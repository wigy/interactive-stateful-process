import { ElementType } from "./element"
import { BadState, InvalidArgument, NotImplemented } from "./error"
import { Origin } from "./origin"
import { Directions } from './directions';
import { Action } from "./action";
import { TimeStamp } from "./common";

export type ProcessId = number
export type ProcessTitle = string
export type ProcessName = string
export type ProcessType = 'web' | 'database' | 'calculation'

export interface ProcessFile {
    name: string
    encoding: string
    data: string
}

export class ProcessStep<VendorElementType, VendorState, VendorActionData> {
    directions: Directions<VendorElementType, VendorActionData>
    action: Action<VendorActionData>
    started: TimeStamp
    state: VendorState
    finished: TimeStamp
}

export class Process<VendorElementType, VendorState, VendorActionData> {
    id: ProcessId | null
    name: ProcessName
    complete: boolean
    successful: boolean | undefined
    origin: Origin
    files: ProcessFile[]
    steps: ProcessStep<VendorElementType, VendorState, VendorActionData>[]
    currentStep: number | undefined

    constructor(name: ProcessName, origin: Origin) {
        this.id = null
        this.name = name
        this.complete = false
        this.successful = undefined
        this.origin = origin
        this.files = []
        this.steps = []
        this.currentStep = undefined
    }

    get dbData(): object {
        return {
            name: this.name,
            complete: this.complete,
            successful: this.successful,
            origin: this.origin,
            currentStep: this.currentStep,
        }
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

    startingState(type: ProcessType): VendorState | null {
        throw new NotImplemented(`A handler '${this.name}' does not implement startingState()`)
    }
}

export type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
    [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>
}

export class ProcessingSystem<VendorElementType, VendorState, VendorActionData> {

    db: any = null
    handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {}

    register(handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void {
        if (handler.name in this.handlers) {
            throw new InvalidArgument(`The handler '${handler}' is already defined.`)
        }
        this.handlers[handler.name] = handler
    }

    startingDirections(type: ProcessType): Directions<VendorElementType, VendorActionData>[] {
        const points: Directions<VendorElementType, VendorActionData>[] = []
        for (const [_, handler] of Object.entries(this.handlers)) {
            const point = handler.startingDirections(type)
            if (point) {
                points.push(point);
            }
        }
        return points;
    }

    getHandler(name: ProcessName): ProcessHandler<VendorElementType, VendorState, VendorActionData> {
        if (!(name in this.handlers)) {
            throw new InvalidArgument(`There is no handler for '${name}'.`)
        }
        return this.handlers[name]
    }

    async createProcess(
        type: ProcessType,
        action: Action<VendorActionData>,
        origin: Origin)
        : Promise<Process<VendorElementType, VendorState, VendorActionData> >
    {
        const handler = this.getHandler(action.process)

        // Set up the process.
        const process = new Process<VendorElementType, VendorState, VendorActionData>(action.process, origin)
        const db = this.getDb()
        const processId: ProcessId = (await this.getDb()('processes').insert(process.dbData).returning('id'))[0]

        // Get the initial state.
        const init = handler.startingDirections(type)
        if (!init) {
            throw new BadState(`Trying to find starting point from handler ${action.process} for ${type} and got null.`)
        }
        const state = handler.startingState(type)
        const step = { processId, state, action: action.dbData, directions: init.dbData }
        await this.getDb()('process_steps').insert(step)
        await this.getDb()('processes').update({ currentStep: 0 }).where({ id: processId })

        return process
    }

    async useKnex(knex) {
        this.db = knex
    }

    getDb(): any {
        if (this.db) {
            return this.db
        }
        throw new BadState(`Database is not yet set.`)
    }
}
