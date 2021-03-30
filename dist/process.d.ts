import { Origin } from "./origin";
import { Step } from './step';
export declare type ProcessId = number;
export declare type ProcessTitle = string;
export declare type ProcessName = string;
export declare type ProcessType = 'web' | 'database' | 'calculation';
export interface ProcessFile {
    name: string;
    encoding: string;
    data: string;
}
export declare class Process {
    id: ProcessId;
    currentState: number;
    complete: boolean;
    successful: boolean;
    origin: Origin;
    files: ProcessFile[];
}
export declare class ProcessHandler<VendorElementType, VendorState, VendorActionData> {
    name: string;
    constructor(name: string);
    isComplete(state: VendorState): boolean;
    startingPoint(type: ProcessType): Step<VendorElementType, VendorActionData>;
}
export declare type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
    [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>;
};
export declare class ProcessingSystem<VendorElementType, VendorDataType, VendorState, VendorActionData> {
    handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData>;
    register(handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void;
    startingPoints(type: ProcessType): Step<VendorElementType, VendorActionData>[];
}
