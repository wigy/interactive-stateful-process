import { ProcessName } from "./process";
export declare type ActionName = string;
export declare type ActionLabel = string;
export interface ActionTemplate<VendorActionData> {
    name: ActionName;
    label: ActionLabel;
    data: VendorActionData;
}
export declare class Action<VendorActionData> {
    process: ProcessName;
    action: ActionName;
    data: VendorActionData;
    constructor(obj: {
        process: ProcessName;
        action: ActionName;
        data: VendorActionData;
    });
    get dbData(): object;
}
