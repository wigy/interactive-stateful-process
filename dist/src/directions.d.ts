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
export interface DirectionsData<VendorElementType, VendorActionData> {
    title: StepTitle;
    process: ProcessName;
    type: ProcessType;
    step: StepNumber;
    description: StepDescription;
    content: StepContent<VendorElementType, VendorActionData>;
}
export declare class Directions<VendorElementType, VendorActionData> {
    title: StepTitle;
    process: ProcessName;
    type: ProcessType;
    step: StepNumber;
    description: StepDescription;
    content: StepContent<VendorElementType, VendorActionData>;
    constructor(obj: DirectionsData<VendorElementType, VendorActionData>);
    toJSON(): DirectionsData<VendorElementType, VendorActionData>;
}
