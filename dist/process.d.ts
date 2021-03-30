import { Origin } from "./origin";
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
export declare class ProcessHandler<VendorState> {
    isComplete(state: VendorState): boolean;
}
export declare type ProcessHandlerMap<VendorState> = {
    [key: string]: ProcessHandler<VendorState>;
};
export declare class ProcessingSystem<VendorElementType, VendorDataType, VendorState, VendorActionData> {
    handlers: ProcessHandlerMap<VendorState>;
    register(name: ProcessName, handler: ProcessHandler<VendorState>): void;
    startingPoints(type: ProcessType): void;
}
