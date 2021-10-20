import { ProcessName } from "./process";
export declare type ActionName = string;
export declare type ActionLabel = string;
export interface ActionTemplate<VendorActionData> {
    name: ActionName;
    label: ActionLabel;
    data: VendorActionData;
}
export interface ActionData<VendorActionData> {
    process: ProcessName;
    action: ActionName;
    data: VendorActionData;
}
export declare class Action<VendorActionData> {
    process: ProcessName;
    action: ActionName;
    data: VendorActionData;
    constructor(obj: ActionData<VendorActionData>);
    toJSON(): ActionData<VendorActionData>;
}
