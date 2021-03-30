import { ElementType } from "./element"
import { Origin } from "./origin"

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

export class ProcessHandler<VendorState> {

    isComplete(state: VendorState): boolean {
        // TODO: Implement.
        return false
    }
}

export type ProcessHandlerMap<VendorState> = {
    [key: string]: ProcessHandler<VendorState>
}

export class ProcessingSystem<VendorElementType, VendorDataType, VendorState, VendorActionData> {

    handlers: ProcessHandlerMap<VendorState>

    register(name: ProcessName, handler: ProcessHandler<VendorState>): void {
        // TODO: Checks
        this.handlers[name] = handler
    }

    startingPoints(type: ProcessType) {
        // TODO: Implement.
    }
}
