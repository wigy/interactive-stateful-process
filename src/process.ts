import { InvalidArgument, NotImplemented } from "./error"
import { Directions } from './directions'
import { Database, ID } from "./common"
import { BadState, DatabaseError } from "./error"

export type ProcessTitle = string
export type ProcessName = string
export type FileEncoding = 'ascii' | 'base64' | 'json'

/**
 * A data structure containing file data.
 */
export interface ProcessFileData {
  processId?: ID
  name: string
  encoding: FileEncoding
  data: string
}

/**
 * An instance of file data for processing.
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
export interface ProcessStepData<VendorState> {
  processId?: ID
  number: number
  description?: string
  state: VendorState
  handler: string
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
  description: string | undefined
  state: VendorState
  handler: string
  started: Date | undefined
  finished: Date | undefined
  directions: Directions<VendorElement, VendorAction>
  action: VendorAction

  constructor(obj: ProcessStepData<VendorState>) {
    this.processId = obj.processId || null
    this.number = obj.number
    this.description = obj.description
    this.state = obj.state
    this.handler = obj.handler
    this.started = obj.started
    this.finished = obj.finished
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
   toJSON(): ProcessStepData<VendorState> {
    return {
      processId: this.processId,
      number: this.number,
      state: this.state,
      handler: this.handler,
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

  async run(): Promise<void> { // TODO: Return something?
    const step = await this.getCurrentStep()
    console.log(step)
  }

  /*
  async load(db: Database, id: ID): Promise<Process<VendorElement, VendorState, VendorAction>> {

    const data = await db('processes').where({ id }).first()
    if (!data) {
      throw new NotFound(`Cannot find process with ID = ${id}.`)
    }
    this.id = id
    this.name = data.name
    this.complete = data.complete
    this.successful = data.successful
    this.currentStep = data.currentStep
    this.files = []
    this.steps = []

    return this
  }
  */
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
      description: 'Process started',
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

    return process
  }

  /*
  getHandler(name: ProcessName): ProcessHandler<VendorElement, VendorState, VendorAction> {
    if (!(name in this.handlers)) {
      throw new InvalidArgument(`There is no handler for '${name}'.`)
    }
    return this.handlers[name]
  }

  async handleAction(processId: ProcessId | null, action: Action<VendorAction>): Promise<Directions<VendorElement, VendorAction> | boolean> {
    if (!processId) {
      throw new InvalidArgument(`Process ID not given when trying to handle action ${JSON.stringify(action.toJSON())}.`)
    }
    // Load data needed.
    const process = await this.loadProcess(processId)
    const step = await process.loadCurrentStep(this.db)
    console.log(step)
    const handler = this.getHandler(action.process)

    return false
  }
  */
}
