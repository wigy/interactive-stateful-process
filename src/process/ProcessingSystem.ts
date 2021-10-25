import { Database, ID, InvalidArgument, ProcessName } from ".."
import { Process } from "./Process"
import { ProcessFile, ProcessFileData } from "./ProcessFile"
import { ProcessStep } from "./ProcessStep"
import { ProcessHandler, ProcessHandlerMap } from "./ProcessHandler"

/**
 * An instance of the full processing system.
 */
 export class ProcessingSystem<VendorElement, VendorState, VendorAction> {

  db: Database
  handlers: ProcessHandlerMap<VendorElement, VendorState, VendorAction> = {}
  logger: {
    info: (...msg) => void
    error: (...msg) => void
  }

  /**
   * Initialize the system and set the database instance for storing process data.
   * @param db
   */
  constructor(db: Database) {
    this.db = db
    this.logger = {
      info: (...msg) => console.log(new Date(), ...msg),
      error: (...msg) => console.error(new Date(), ...msg)
    }
  }

  /**
   * Register new handler class for processing.
   * @param handler
   */
  register(handler: ProcessHandler<VendorElement, VendorState, VendorAction>): void {
    if (!handler.name) {
      throw new InvalidArgument(`A handler without name cannot be registered.`)
    }
    if (handler.name in this.handlers) {
      throw new InvalidArgument(`The handler '${handler.name}' is already defined.`)
    }
    if (handler.name.length > 32) {
      throw new InvalidArgument(`The handler name '${handler.name}' is too long.`)
    }
    this.handlers[handler.name] = handler
  }

  /**
   * Initialize new process and save it to the database.
   * @param type
   * @param name
   * @param file
   * @returns New process that is already in crashed state, if no handler
   */
  async createProcess(name: ProcessName, file: ProcessFileData): Promise<Process<VendorElement, VendorState, VendorAction>> {
    // Set up the process.
    const process = new Process<VendorElement, VendorState, VendorAction>(this, name)
    await process.save()
    // Save the file and attach it to the process.
    const processFile = new ProcessFile(file)
    process.addFile(processFile)
    await processFile.save(this.db)
    // Find the handler.
    let selectedHandler : ProcessHandler<VendorElement, VendorState, VendorAction> | null = null
    for (const handler of Object.values(this.handlers)) {
      try {
        if (handler.canHandle(processFile)) {
          selectedHandler = handler
          break
        }
      } catch(err) {
        await process.crashed(err)
        return process
      }
    }
    if (!selectedHandler) {
      await process.crashed(new InvalidArgument(`No handler found for the file ${file.name} of type ${file.type}.`))
      return process
    }
    // Create initial step using the handler.
    let state
    try {
      state = selectedHandler.startingState(processFile)
    } catch(err) {
      await process.crashed(err)
      return process
    }
    const step = new ProcessStep<VendorElement, VendorState, VendorAction>({
      number: 0,
      handler: selectedHandler.name,
      state
    })

    process.addStep(step)
    await step.save()

    process.currentStep = 0
    await process.save()
    this.logger.info(`Created process ${process}.`)

    // Find directions forward from the initial state.
    await this.checkFinishAndFindDirections(selectedHandler, step)

    return process
  }

  /**
   * Check if we are in the finished state and if not, find the directions forward.
   */
  async checkFinishAndFindDirections(handler: ProcessHandler<VendorElement, VendorState, VendorAction>, step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<void> {
    let result
    try {
      result = handler.checkCompletion(step.state)
    } catch(err) {
      return step.process.crashed(err)
    }

    if (result === undefined) {
      const directions = await handler.getDirections(step.state)
      await step.setDirections(this.db, directions)
    } else {
      // Process is finished.
      step.directions = undefined
      step.action = undefined
      step.finished = new Date()
      await step.save()
      step.process.complete = true
      step.process.successful = result
      await step.process.save()
    }
    await step.process.updateStatus()
  }

  /**
   * Get the named handler or throw an error if not registered.
   * @param name
   * @returns
   */
  getHandler(name: string): ProcessHandler<VendorElement, VendorState, VendorAction> {
    if (!(name in this.handlers)) {
      throw new InvalidArgument(`There is no handler for '${name}'.`)
    }
    return this.handlers[name]
  }

  /**
   * Load the process data from the disk.
   * @param id
   * @returns
   */
  async loadProcess(id: ID): Promise<Process<VendorElement, VendorState, VendorAction>> {
    const process = new Process<VendorElement, VendorState, VendorAction>(this, null)
    await process.load(id)
    return process
  }
}
