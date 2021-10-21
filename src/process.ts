import { InvalidArgument, NotImplemented } from "./error"
import { Directions } from './directions'
import { Database, ID } from "./common"
import { BadState, DatabaseError } from "./error"
import clone from "clone"

/**
 * The name of the process.
 */
export type ProcessName = string
/**
 * How the process input data is encoded.
 */
export type FileEncoding = 'ascii' | 'base64' | 'json'
/**
 * Overall status of the process.
 *
 *  * INCOMPLETE - Something has stopped the process before it has been finished properly.
 *  * WAITING - The process is currently waiting for external input.
 *  * SUCCEEDED - The process is completed successfully.
 *  * FAILED - The process has failed.
 *
 */
export enum ProcessStatus {
  INCOMPLETE = "INCOMPLETE",
  WAITING = "WAITING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED"
}

/**
 * A data structure containing input data for the process.
 */
export interface ProcessFileData {
  processId?: ID
  name: string
  encoding: FileEncoding
  data: string
}

/**
 * An instance of input data for processing.
 */
export class ProcessFile {
  id: ID
  processId: ID
  name: string
  encoding: FileEncoding
  data: string

  constructor(obj: ProcessFileData) {
    this.id = null
    this.processId = obj.processId || null
    this.name = obj.name
    this.encoding = obj.encoding
    this.data = obj.data
  }

  toString(): string {
    return `ProcessFile #${this.id} ${this.name}`
  }

  /**
   * Get the loaded process information as JSON object.
   * @returns
   */
   toJSON(): ProcessFileData {
    return {
      processId: this.processId,
      name: this.name,
      encoding: this.encoding,
      data: this.data
    }
  }

  /**
   * Save the file to the database.
   */
  async save(db: Database): Promise<ID> {
    const out = this.toJSON()
    if (this.encoding === 'json') {
      out.data = JSON.stringify(out.data)
    }
    if (this.id) {
      await db('process_files').update(out).where({ id: this.id })
      return this.id
    } else {
      this.id = (await db('process_files').insert(out).returning('id'))[0]
      if (this.id) return this.id
      throw new DatabaseError(`Saving process ${JSON.stringify(out)} failed.`)
    }
  }

}

/**
 * A basic information of the processing step.
 */
export interface ProcessStepData<VendorState, VendorAction> {
  processId?: ID
  number: number
  state: VendorState
  handler: string
  action?: VendorAction
  started?: Date
  finished?: Date
}

/**
 * Data of the one step in the process including possible directions and action taken to the next step, if any.
 */
export class ProcessStep<VendorElement, VendorState, VendorAction> {

  process: Process<VendorElement, VendorState, VendorAction>

  id: ID
  processId: ID
  number: number
  state: VendorState
  handler: string
  started: Date | undefined
  finished: Date | undefined
  directions: Directions<VendorElement, VendorAction>
  action: VendorAction | undefined

  constructor(obj: ProcessStepData<VendorState, VendorAction>) {
    this.processId = obj.processId || null
    this.number = obj.number
    this.state = obj.state
    this.handler = obj.handler
    this.action = obj.action
    this.started = obj.started
    this.finished = obj.finished
  }

  toString(): string {
    return `ProcessStep ${this.number} of Process #${this.processId}`
  }

  /**
   * Get a reference to the database.
   */
   get db(): Database {
    return this.process.db
  }

  /**
   * Save the process info to the database.
   */
   async save(): Promise<ID> {
    if (this.id) {
      await this.db('process_steps').update(this.toJSON()).where({ id: this.id })
      return this.id
    } else {
      this.started = new Date()
      this.id = (await this.db('process_steps').insert(this.toJSON()).returning('id'))[0]
      if (this.id) return this.id
      throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`)
    }
  }

  /**
   * Get the loaded process information as JSON object.
   * @returns
   */
   toJSON(): ProcessStepData<VendorState, VendorAction> {
    return {
      processId: this.processId,
      number: this.number,
      state: this.state,
      handler: this.handler,
      action: this.action,
      started: this.started,
      finished: this.finished,
    }
  }

  async setDirections(db: Database, directions: Directions<VendorElement, VendorAction>): Promise<void> {
    this.directions = directions
    await db('process_steps').update({ directions: directions.toJSON() }).where({ id: this.id })
  }
}

/**
 * Overall description of the process.
 */
export interface ProcessInfo {
  name: ProcessName
  complete: boolean
  successful: boolean | undefined
  currentStep: number | undefined
}

/**
 * A complete description of the process state and steps taken.
 */
export class Process<VendorElement, VendorState, VendorAction> {

  system: ProcessingSystem<VendorElement, VendorState, VendorAction>

  id: ID
  name: ProcessName
  complete: boolean
  successful: boolean | undefined
  // TODO: Add retryable support.
  currentStep: number | undefined
  files: ProcessFile[]
  steps: ProcessStep<VendorElement, VendorState, VendorAction>[]

  constructor(system: ProcessingSystem<VendorElement, VendorState, VendorAction>, name: ProcessName | null) {
    this.system = system

    this.id = null
    this.name = name || '[no name]'
    this.complete = false
    this.successful = undefined
    this.files = []
    this.steps = []
    this.currentStep = undefined
  }

  toString(): string {
    return `Process #${this.id} ${this.name}`
  }

  /**
   * Get the loaded process information as JSON object.
   * @returns
   */
  toJSON(): ProcessInfo {
    return {
      name: this.name,
      complete: this.complete,
      successful: this.successful,
      currentStep: this.currentStep,
    }
  }

  /**
   * Append a file to this process and link its ID.
   * @param file
   */
  addFile(file: ProcessFile): void {
    file.processId = this.id
    this.files.push(file)
  }

  /**
   * Append a step to this process and link its ID.
   * @param step
   */
   async addStep(step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<void> {
    step.processId = this.id
    step.process = this
    this.steps.push(step)
  }

  /**
   * Load the current step if necessary and return it.
   */
  async getCurrentStep(): Promise<ProcessStep<VendorElement, VendorState, VendorAction>> {
    if (this.currentStep === null || this.currentStep === undefined) {
      throw new BadState(`Process #${this.id} ${this.name} has invalid current step.`)
    }
    if (this.steps[this.currentStep]) {
      return this.steps[this.currentStep]
    }
    return this.loadStep(this.currentStep)
  }

  /**
   * Mark the current state as completed and create new additional step with the new state.
   * @param state
   */
  async proceedToState(action: VendorAction, state: VendorState): Promise<void> {
    const current = await this.getCurrentStep()
    const handler = this.system.getHandler(current.handler)
    current.action = action
    current.finished = new Date()
    current.save()
    const nextStep = new ProcessStep<VendorElement, VendorState, VendorAction>({
      number: current.number + 1,
      state,
      handler: handler.name
    })
    this.addStep(nextStep)
    this.currentStep = (this.currentStep || 0) + 1
    this.save()
    await nextStep.save()
    // TODO: This call should be wrapped safely and end the process on error if it fails.
    const directions = await handler.getDirections(state)
    await nextStep.setDirections(this.db, directions)
    // TODO: We could check if the process is complete here.
  }

  /**
   * Get a reference to the database.
   */
  get db(): Database {
    return this.system.db
  }

  /**
   * Save the process info to the database.
   */
  async save(): Promise<ID> {
    if (this.id) {
      await this.db('processes').update(this.toJSON()).where({ id: this.id })
      return this.id
    } else {
      this.id = (await this.db('processes').insert(this.toJSON()).returning('id'))[0]
      if (this.id) return this.id
      throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`)
    }
  }

  /**
   * Load the step with the given number from the database.
   * @param number
   * @returns
   */
  async loadStep(number: number): Promise<ProcessStep<VendorElement, VendorState, VendorAction>> {
    if (!this.id) {
      throw new BadState(`Cannot load steps, if the process have no ID ${JSON.stringify(this.toJSON())}.`)
    }
    if (this.currentStep === undefined) {
      throw new BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.toJSON())}.`)
    }
    const data = await this.db('process_steps').where({ id: this.id, number }).first()
    if (!data) {
      throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`)
    }
    this.steps[this.currentStep] = new ProcessStep<VendorElement, VendorState, VendorAction>(data)
    return this.steps[this.currentStep]
  }

  /**
   * Execute process as long as it is completed, failed or requires additional input.
   */
  async run(): Promise<void> {
    let step
    let MAX_RUNS = 100
    while (true) {
      MAX_RUNS--
      if (MAX_RUNS < 0) {
        console.error(`Maximum number of executions reached for the process ${this}.`)
        break
      }
      step = await this.getCurrentStep()
      if (!step.directions.isImmediate()) {
        break
      }
      const handler = this.system.getHandler(step.handler)
      const state = clone(step.state)
      const action = clone(step.directions.action)
      try {
        if (action) {
          // TODO: Safeguard for handler call.
          const nextState = await handler.action(action, state, this.files)
          await this.proceedToState(action, nextState)
        } else {
          throw new BadState(`Process step ${step} has no action.`)
        }
      } catch (err) {
        // TODO: Internal logging? Or just return error?
        console.error(err)
      }
    }
    await this.updateStatus()
  }

  /**
   * Resolve the status of the process and update it to the database.
   */
  async updateStatus(): Promise<void> {
    await this.db('processes').update({ status: this.status() }).where({ id: this.id })
  }

  /**
   * Get the status of the process.
   */
  status(): ProcessStatus {
    if (this.currentStep === null || this.currentStep === undefined) {
      throw new BadState(`Cannot check status when there is no current step loaded for ${this}`)
    }
    const step = this.steps[this.currentStep]
    if (step.directions.isComplete() && step.finished) {
      if (this.successful === true) return ProcessStatus.SUCCEEDED
      if (this.successful === false) return ProcessStatus.FAILED
    }
    if (!step.directions.isImmediate() && !step.finished) {
      return ProcessStatus.WAITING
    }
    return ProcessStatus.INCOMPLETE
  }

  /**
   * Get the state of the current step of the process.
   */
  state(): VendorState {
    if (this.currentStep === null || this.currentStep === undefined) {
      throw new BadState(`Cannot check state when there is no current step loaded for ${this}`)
    }
    const step = this.steps[this.currentStep]
    return step.state
  }

  /**
   * Handle external input coming ing.
   * @param action
   */
  async input(action: VendorAction): Promise<void> {
    const step = await this.getCurrentStep()
    const handler = this.system.getHandler(step.handler)
    // TODO: Safeguard for handler call.
    const nextState = await handler.action(action, clone(step.state), this.files)
    await this.proceedToState(action, nextState)
  }
}

/**
 * A handler taking care of moving between process states.
 */
export class ProcessHandler<VendorElement, VendorState, VendorAction> {

  name: string

  constructor(name: string) {
    this.name = name
  }

  /**
   * Check if we are able to handle the given data.
   * @param file
   */
  canHandle(file: ProcessFile): boolean {
    throw new NotImplemented(`A handler '${this.name}' cannot handle file '${file.name}', since canHandle() is not implemented.`)
  }

  /**
   * Execute an action to the state in order to produce new state. Note that state is cloned and can be modified to be new state.
   * @param action
   * @param state
   * @param files
   */
  async action(action: VendorAction, state: VendorState, files: ProcessFile[]): Promise<VendorState> {
    throw new NotImplemented(`A handler '${this.name}' for files ${files.map(f => `'${f}''`).join(', ')} does not implement action()`)
  }

  /**
   * Construct intial state from the given data.
   * @param file
   */
  startingState(file: ProcessFile): VendorState {
    throw new NotImplemented(`A handler '${this.name}' for file '${file.name}' does not implement startingState()`)
  }

  /**
   * Figure out possible directions from the given state.
   * @param state
   */
  async getDirections(state: VendorState): Promise<Directions<VendorElement, VendorAction>> {
    throw new NotImplemented(`A handler '${this.name}' for state '${JSON.stringify(state)}' does not implement getDirections()`)
  }
}

/**
 * A collection of process handlers.
 */
export type ProcessHandlerMap<VendorElement, VendorState, VendorAction> = {
  [key: string]: ProcessHandler<VendorElement, VendorState, VendorAction>
}

/**
 * An instance of the full processing system.
 */
export class ProcessingSystem<VendorElement, VendorState, VendorAction> {

  db: Database
  handlers: ProcessHandlerMap<VendorElement, VendorState, VendorAction> = {}

  /**
   * Initialize the system and set the database instance for storing process data.
   * @param db
   */
  constructor(db: Database) {
    this.db = db
  }

  /**
   * Register new handler class for processing.
   * @param handler
   */
  register(handler: ProcessHandler<VendorElement, VendorState, VendorAction>): void {
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
   * @returns
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
      // TODO: Safeguard for handler call.
      if (handler.canHandle(processFile)) {
        selectedHandler = handler
        break
      }
    }
    if (!selectedHandler) {
      throw new InvalidArgument(`No handler found for the file ${file.name}.`)
    }
    // Create initial step using the handler.
    const state = selectedHandler.startingState(processFile)
    const step = new ProcessStep<VendorElement, VendorState, VendorAction>({
      number: 0,
      handler: selectedHandler.name,
      state
    })

    process.addStep(step)
    await step.save()

    process.currentStep = 0
    await process.save()

    // Find directions forward from the state.
    const directions = await selectedHandler.getDirections(state)
    await step.setDirections(this.db, directions)
    // TODO: We could check if the process is already complete here.

    return process
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
}
