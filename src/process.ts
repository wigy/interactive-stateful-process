import { ElementType } from "./element"
import { InvalidArgument, NotImplemented } from "./error"
import { Origin } from "./origin"
import { Directions } from './directions';

export type ProcessId = number
export type ProcessTitle = string
export type ProcessName = string
export type ProcessType = 'web' | 'database' | 'calculation'

export interface ProcessFile {
    name: string
    encoding: string
    data: string
}

export class Process {
    id: ProcessId
    currentState: number
    complete: boolean
    successful: boolean
    origin: Origin
    files: ProcessFile[]
    // TODO: Handling
    // TODO: States
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

    startingPoint(type: ProcessType): Directions<VendorElementType, VendorActionData> | null {
        throw new NotImplemented(`A handler '${this.name}' does not implement startingPoint()`)
    }
}

export type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
    [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>
}

export class ProcessingSystem<VendorElementType, VendorDataType, VendorState, VendorActionData> {

    handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {}

    register(handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void {
        if (handler.name in this.handlers) {
            throw new InvalidArgument(`The handler '${handler}' is already defined.`)
        }
        this.handlers[handler.name] = handler
    }

    startingPoints(type: ProcessType): Directions<VendorElementType, VendorActionData>[] {
        const points: Directions<VendorElementType, VendorActionData>[] = []
        for (const [_, handler] of Object.entries(this.handlers)) {
            const point = handler.startingPoint(type)
            if (point) {
                points.push(point);
            }
        }
        return points;
    }
}
