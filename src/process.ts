import { ElementType } from "./element"
import { InvalidArgument } from "./error"
import { Origin } from "./origin"
import { Step } from './step';

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

    isComplete(state: VendorState): boolean {
        // TODO: Implement.
        return false
    }

    startingPoints(type: ProcessType): Step<VendorElementType, VendorActionData>[] {
        return []
    }
}

export type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
    [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>
}

export class ProcessingSystem<VendorElementType, VendorDataType, VendorState, VendorActionData> {

    handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {}

    register(name: ProcessName, handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void {
        if (name in this.handlers) {
            throw new InvalidArgument(`The handler for '${name}' is already defined.`)
        }
        this.handlers[name] = handler
    }

    startingPoints(type: ProcessType): Step<VendorElementType, VendorActionData>[] {
        let points: Step<VendorElementType, VendorActionData>[] = []
        for (const [_, handler] of Object.entries(this.handlers)) {
            points = points.concat(handler.startingPoints(type));
        }
        return points;
    }
}
