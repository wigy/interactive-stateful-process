import { BadState, InvalidArgument, NotFound, NotImplemented } from "./error"
import { Origin } from "./origin"
import { Directions } from './directions'
import { Action } from "./action"
import { Database, TimeStamp } from "./common"

export type ProcessId = number
export type ProcessTitle = string
export type ProcessName = string
export type ProcessType = 'web' | 'database' | 'calculation'
export type FileEncoding = 'ascii' | 'base64'

export interface ProcessFile {
  name: string
  encoding: FileEncoding
  data: string
}

export interface ProcessStepData<VendorElementType, VendorState, VendorActionData> {
  directions: Directions<VendorElementType, VendorActionData>
  action: Action<VendorActionData>
  number: number
  started: TimeStamp
  state: VendorState
  finished: TimeStamp
}

export class ProcessStep<VendorElementType, VendorState, VendorActionData> {
  directions: Directions<VendorElementType, VendorActionData>
  action: Action<VendorActionData>
  number: number
  started: TimeStamp
  state: VendorState
  finished: TimeStamp

  constructor(obj: ProcessStepData<VendorElementType, VendorState, VendorActionData>) {
    this.directions = obj.directions
    this.action = obj.action
    this.number = obj.number
    this.started = obj.started
    this.state = obj.state
    this.finished = obj.finished
  }
}

export interface ProcessInfo {
  name: ProcessName
  complete: boolean
  successful: boolean | undefined
  currentStep: number | undefined
}

export class Process<VendorElementType, VendorState, VendorActionData> {
  id: ProcessId | null
  name: ProcessName
  complete: boolean
  successful: boolean | undefined
  currentStep: number | undefined
  files: ProcessFile[]
  steps: ProcessStep<VendorElementType, VendorState, VendorActionData>[]

  constructor(name: ProcessName | null, file: ProcessFile | null) {
    this.id = null
    this.name = name || '[no name]'
    this.complete = false
    this.successful = undefined
    this.files = []
    if (file) {
      this.files.push(file)
    }
    this.steps = []
    this.currentStep = undefined
  }

  toJSON(): ProcessInfo {
    return {
      name: this.name,
      complete: this.complete,
      successful: this.successful,
      currentStep: this.currentStep,
    }
  }

  async load(db: Database, id: ProcessId): Promise<Process<VendorElementType, VendorState, VendorActionData>> {

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

  async loadCurrentStep(db: Database): Promise<ProcessStep<VendorElementType, VendorState, VendorActionData>> {
    if (!this.id) {
      throw new BadState(`Cannot load steps, if process have no ID ${JSON.stringify(this.toJSON())}.`)
    }
    if (this.currentStep === undefined) {
      throw new BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.toJSON())}.`)
    }
    const data = await db('process_steps').where({ id: this.id, number: this.currentStep }).first()
    if (!data) {
      throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`)
    }
    this.steps[this.currentStep] = new ProcessStep<VendorElementType, VendorState, VendorActionData>(data)
    return this.steps[this.currentStep]
  }
}

export class ProcessHandler<VendorElementType, VendorState, VendorActionData> {

  name: string

  constructor(name: string) {
    this.name = name
  }

  isComplete(state: VendorState): boolean {
    // TODO: Implement.
    return false
  }

  startingDirections(type: ProcessType): Directions<VendorElementType, VendorActionData> | null {
    throw new NotImplemented(`A handler '${this.name}' does not implement startingPoint()`)
  }

  startingState(type: ProcessType): VendorState {
    throw new NotImplemented(`A handler '${this.name}' does not implement startingState()`)
  }
}

export type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
  [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>
}

/**
 * An instance of the full processing system.
 */
export class ProcessingSystem<VendorElementType, VendorState, VendorActionData> {

  db: Database
  handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {}

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
  register(handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void {
    if (handler.name in this.handlers) {
      throw new InvalidArgument(`The handler '${handler}' is already defined.`)
    }
    this.handlers[handler.name] = handler
  }

  startingDirections(type: ProcessType): Directions<VendorElementType, VendorActionData>[] {
    const points: Directions<VendorElementType, VendorActionData>[] = []
    for (const handler of Object.values(this.handlers)) {
      const point = handler.startingDirections(type)
      if (point) {
        points.push(point)
      }
    }
    return points
  }

  getHandler(name: ProcessName): ProcessHandler<VendorElementType, VendorState, VendorActionData> {
    if (!(name in this.handlers)) {
      throw new InvalidArgument(`There is no handler for '${name}'.`)
    }
    return this.handlers[name]
  }

  async createProcess(type: ProcessType, name: ProcessName, file: ProcessFile): Promise<Process<VendorElementType, VendorState, VendorActionData>> {
    // Set up the process.
    const process = new Process<VendorElementType, VendorState, VendorActionData>(name, file)
    const processId: ProcessId = (await this.db('processes').insert(process.toJSON()).returning('id'))[0]
    process.id = processId

    return process
  }

  OldcreateProcess(type: ProcessType, name: ProcessName, origin: Origin): void {
/*
     const handler = this.getHandler(name)


    // Get the initial state.
    const init = handler.startingDirections(type)
    if (!init) {
      throw new BadState(`Trying to find starting directions from handler '${name}' for '${type}' and got null.`)
    }
    const state = handler.startingState(type)
    const step = { processId, state, action: null, number: 0, directions: init.toJSON() }
    await this.db('process_steps').insert(step)
    await this.db('processes').update({ currentStep: 0 }).where({ id: processId })

    return process
    */
  }

  /*
  async loadProcess(processId: ProcessId): Promise<Process<VendorElementType, VendorState, VendorActionData>> {
    const process = await (new Process<VendorElementType, VendorState, VendorActionData>()).load(this.db, processId)
    return process
  }
  */

  /*
  async handleAction(processId: ProcessId | null, action: Action<VendorActionData>): Promise<Directions<VendorElementType, VendorActionData> | boolean> {
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
