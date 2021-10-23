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
export type FileEncoding = 'utf-8' | 'base64' | 'json'
/**
 * Overall status of the process.
 *
 *  * INCOMPLETE - Something has stopped the process before it has been finished properly.
 *  * WAITING - The process is currently waiting for external input.
 *  * SUCCEEDED - The process is completed successfully.
 *  * FAILED - The process is completed unsuccessfully.
 *  * CRASHED - A handler has crashed at some point and process is halted.
 *
 */
export enum ProcessStatus {
  INCOMPLETE = "INCOMPLETE",
  WAITING = "WAITING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  CRASHED = "CRASHED"
}

/**
 * A data structure containing input data for the process.
 */
export interface ProcessFileData {
  processId?: ID
  name: string
  type?: string
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
  type?: string
  encoding: FileEncoding
  data: string

  constructor(obj: ProcessFileData) {
    this.id = null
    this.processId = obj.processId || null
    this.name = obj.name
    this.type = obj.type
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
      type: this.type,
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
export interface ProcessStepData<VendorElement, VendorState, VendorAction> {
  processId?: ID
  number: number
  state: VendorState
  handler: string
  action?: VendorAction
  directions?: Directions<VendorElement, VendorAction>
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
  directions?: Directions<VendorElement, VendorAction>
  action?: VendorAction | undefined

  constructor(obj: ProcessStepData<VendorElement, VendorState, VendorAction>) {
    this.processId = obj.processId || null
    this.number = obj.number
    this.state = obj.state
    this.handler = obj.handler
    this.directions = obj.directions ? new Directions<VendorElement, VendorAction>(obj.directions) : undefined
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
   toJSON(): ProcessStepData<VendorElement, VendorState, VendorAction> {
    return {
      processId: this.processId,
      number: this.number,
      state: this.state,
      directions: this.directions,
      handler: this.handler,
      action: this.action,
      started: this.started,
      finished: this.finished,
    }
  }

  /**
   * Set directions and update database.
   * @param db
   * @param directions
   */
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
  status: ProcessStatus
  error?: string
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
  currentStep: number | undefined
  status: ProcessStatus
  files: ProcessFile[]
  steps: ProcessStep<VendorElement, VendorState, VendorAction>[]
  error: string | undefined

  constructor(system: ProcessingSystem<VendorElement, VendorState, VendorAction>, name: ProcessName | null) {
    this.system = system

    this.id = null
    this.name = name || '[no name]'
    this.complete = false
    this.successful = undefined
    this.files = []
    this.steps = []
    this.currentStep = undefined
    this.status = ProcessStatus.INCOMPLETE
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
      status: this.status,
      error: this.error
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
    await this.system.checkFinishAndFindDirections(handler, nextStep)
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
   * Load the process data and its files. Note that current step is not yet loaded here, but when using getCurrentStep().
   * @param id
   */
  async load(id: ID): Promise<void> {
    // Load basic info.
    const data = await this.db('processes').select('*').where({ id }).first()
    if (!data) {
      throw new InvalidArgument(`Cannot find process #${id}`)
    }
    Object.assign(this, data)
    this.id = id
    // Load files.
    this.files = (await this.db('process_files').select('*').where({ processId: this.id })).map(fileData => {
      const file = new ProcessFile(fileData)
      file.id = fileData.id
      return file
    })
    // Load current step.
    await this.getCurrentStep()
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
    const data = await this.db('process_steps').where({ processId: this.id, number }).first()
    if (!data) {
      throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`)
    }
    this.steps[this.currentStep] = new ProcessStep<VendorElement, VendorState, VendorAction>(data)
    this.steps[this.currentStep].process = this
    return this.steps[this.currentStep]
  }

  /**
   * Check if the process can be run.
   */
  canRun(): boolean {
    return !this.complete && (this.status === ProcessStatus.INCOMPLETE || this.status === ProcessStatus.WAITING)
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
        this.system.logger.error(`Maximum number of executions reached for the process ${this}.`)
        break
      }
      step = await this.getCurrentStep()
      if (!step.directions.isImmediate()) {
        await this.updateStatus()
        break
      }
      const handler = this.system.getHandler(step.handler)
      const state = clone(step.state)
      const action = clone(step.directions.action)
      try {
        if (action) {
          const nextState = await handler.action(action, state, this.files)
          await this.proceedToState(action, nextState)
        } else {
          throw new BadState(`Process step ${step} has no action.`)
        }
      } catch (err) {
        this.system.logger.error(err)
        return this.crashed(err)
      }
    }
  }

  /**
   * Record the error and mark the process as finished with an error.
   * @param err
   */
  async crashed(err: Error): Promise<void> {
    this.system.logger.error(`Processing of ${this} failed:`, err)
    if (this.currentStep !== undefined && this.currentStep !== null) {
      const step = await this.loadStep(this.currentStep)
      step.finished = new Date()
      await step.save()
    }
    this.error = err.stack ? err.stack : `${err.name}: ${err.message}`
    await this.save()
    await this.updateStatus()
  }

  /**
   * Resolve the status of the process and update it to the database.
   */
  async updateStatus(): Promise<void> {
    let status = ProcessStatus.INCOMPLETE
    if (this.error) {
      status = ProcessStatus.CRASHED
    } else {
      if (this.currentStep === null || this.currentStep === undefined) {
        throw new BadState(`Cannot check status when there is no current step loaded for ${this}`)
      }
      const step = this.steps[this.currentStep]
      if (step.finished) {
        if (this.successful === true) status = ProcessStatus.SUCCEEDED
        if (this.successful === false) status = ProcessStatus.FAILED
      }
      if (step.directions) {
        status = step.directions.isImmediate() ? ProcessStatus.INCOMPLETE : ProcessStatus.WAITING
      }
    }
    if (this.status !== status) {
      this.system.logger.info(`Process ${this} is now ${status}`)
    }
    this.status = status
    await this.db('processes').update({ status }).where({ id: this.id })
  }

  /**
   * Get the state of the current step of the process.
   */
  get state(): VendorState {
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
    let nextState
    try {
      nextState = await handler.action(action, clone(step.state), this.files)
    } catch(err) {
      return this.crashed(err)
    }
    await this.proceedToState(action, nextState)
  }

  /**
   * Roll back the latest step.
   */
  async rollback(): Promise<boolean> {
    if (this.currentStep === null || this.currentStep === undefined) {
      throw new BadState(`Cannot roll back when there is no current step.`)
    }
    if (this.currentStep < 1) {
      throw new BadState(`Cannot roll back when there is only initial step in the process.`)
    }
    const step = await this.getCurrentStep()
    this.system.logger.info(`Attempt of rolling back '${step}' from '${this}'.`)
    const handler = this.system.getHandler(step.handler)
    const result = await handler.rollback(step)
    if (result) {
      if (this.error) {
        this.error = undefined
      }
      await this.db('process_steps').delete().where({ id: step.id })
      this.currentStep--
      await this.save()
      const newCurrentStep = await this.getCurrentStep()
      newCurrentStep.finished = undefined
      await newCurrentStep.save()
      await this.updateStatus()
      this.system.logger.info(`Roll back of '${this}' to '${newCurrentStep}' successful.`)
      return true
    }
    this.system.logger.info(`Not able to roll back '${this}'.`)
    return false
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
   * Check if the state is either successful `true` or failed `false` or not yet complete `undefined`.
   * @param state
   */
  checkCompletion(state: VendorState): boolean | undefined {
    throw new NotImplemented(`A handler '${this.name}' cannot check state '${JSON.stringify(state)}', since checkCompletion() is not implemented.`)
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

  /**
   * See if it is possible rollback a step.
   * @param step
   */
  async rollback(step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<boolean> {
    throw new NotImplemented(`A handler '${this.name}' for step '${step}' does not implement rollback()`)
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
