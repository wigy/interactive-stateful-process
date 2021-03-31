import { ActionTemplate } from "./action";
import { Element } from "./element";
import { ProcessType, ProcessName } from "./process";
export interface StepContent<VendorElementType, VendorActionData> {
    elements?: Element<VendorElementType>[];
    actions?: ActionTemplate<VendorActionData>[];
}
export declare type StepNumber = number;
export declare type StepTitle = string;
export declare type StepDescription = string;
export declare class Directions<VendorElementType, VendorActionData> {
    title: StepTitle;
    process: ProcessName;
    type: ProcessType;
    step: StepNumber;
    description: StepDescription;
    content: StepContent<VendorElementType, VendorActionData>;
    constructor(obj: {
        title: StepTitle;
        process: ProcessName;
        type: ProcessType;
        step: StepNumber;
        description: StepDescription;
        content: StepContent<VendorElementType, VendorActionData>;
    });
    get dbData(): object;
}
