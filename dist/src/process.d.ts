import { Origin } from "./origin";
import { Directions } from './directions';
import { Action } from "./action";
import { TimeStamp } from "./common";
export declare type ProcessId = number;
export declare type ProcessTitle = string;
export declare type ProcessName = string;
export declare type ProcessType = 'web' | 'database' | 'calculation';
export interface ProcessFile {
    name: string;
    encoding: string;
    data: string;
}
export declare class ProcessStep<VendorElementType, VendorState, VendorActionData> {
    directions: Directions<VendorElementType, VendorActionData>;
    action: Action<VendorActionData>;
    started: TimeStamp;
    state: VendorState;
    finished: TimeStamp;
}
export declare class Process<VendorElementType, VendorState, VendorActionData> {
    id: ProcessId | null;
    name: ProcessName;
    complete: boolean;
    successful: boolean | undefined;
    origin: Origin;
    files: ProcessFile[];
    steps: ProcessStep<VendorElementType, VendorState, VendorActionData>[];
    currentStep: number | undefined;
    constructor(name: ProcessName, origin: Origin);
}
export declare class ProcessHandler<VendorElementType, VendorState, VendorActionData> {
    name: string;
    constructor(name: string);
    isComplete(state: VendorState): boolean;
    startingPoint(type: ProcessType): Directions<VendorElementType, VendorActionData> | null;
}
export declare type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
    [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>;
};
export declare class ProcessingSystem<VendorElementType, VendorState, VendorActionData> {
    db: any;
    handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData>;
    register(handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void;
    startingPoints(type: ProcessType): Directions<VendorElementType, VendorActionData>[];
    getHandler(name: ProcessName): ProcessHandler<VendorElementType, VendorState, VendorActionData>;
    createProcess(type: ProcessType, action: Action<VendorActionData>, origin: Origin): ProcessId;
    useKnex(config: any): Promise<void>;
}
