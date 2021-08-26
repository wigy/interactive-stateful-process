import { Origin } from "./origin";
import { Directions } from './directions';
import { Action } from "./action";
import { Database, TimeStamp } from "./common";
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
    number: number;
    started: TimeStamp;
    state: VendorState;
    finished: TimeStamp;
    constructor(obj: {
        directions: Directions<VendorElementType, VendorActionData>;
        action: Action<VendorActionData>;
        number: number;
        started: TimeStamp;
        state: VendorState;
        finished: TimeStamp;
    });
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
    constructor(name?: ProcessName | null, origin?: Origin | null);
    get dbData(): object;
    load(db: Database, id: ProcessId): Promise<Process<VendorElementType, VendorState, VendorActionData>>;
    loadCurrentStep(db: Database): Promise<ProcessStep<VendorElementType, VendorState, VendorActionData>>;
}
export declare class ProcessHandler<VendorElementType, VendorState, VendorActionData> {
    name: string;
    constructor(name: string);
    isComplete(state: VendorState): boolean;
    startingDirections(type: ProcessType): Directions<VendorElementType, VendorActionData> | null;
    startingState(type: ProcessType): VendorState;
}
export declare type ProcessHandlerMap<VendorElementType, VendorState, VendorActionData> = {
    [key: string]: ProcessHandler<VendorElementType, VendorState, VendorActionData>;
};
export declare class ProcessingSystem<VendorElementType, VendorState, VendorActionData> {
    db: Database;
    handlers: ProcessHandlerMap<VendorElementType, VendorState, VendorActionData>;
    register(handler: ProcessHandler<VendorElementType, VendorState, VendorActionData>): void;
    startingDirections(type: ProcessType): Directions<VendorElementType, VendorActionData>[];
    getHandler(name: ProcessName): ProcessHandler<VendorElementType, VendorState, VendorActionData>;
    useKnex(knex: Database): Promise<void>;
    getDb(): Database;
    createProcess(type: ProcessType, name: ProcessName, origin: Origin): Promise<Process<VendorElementType, VendorState, VendorActionData>>;
    loadProcess(processId: ProcessId): Promise<Process<VendorElementType, VendorState, VendorActionData>>;
    handleAction(processId: ProcessId | null, action: Action<VendorActionData>): Promise<Directions<VendorElementType, VendorActionData> | boolean>;
}
