import { ActionTemplate } from "./action";
import { Element } from "./element";
import { ProcessType, ProcessName } from "./process"

export interface StepContent<VendorElementType, VendorActionData> {
    elements?: Element<VendorElementType>[]
    actions?: ActionTemplate<VendorActionData>[]
}

export type StepNumber = number
export type StepTitle = string
export type StepDescription = string

export interface Directions<VendorElementType, VendorActionData> {
    title: StepTitle
    process: ProcessName
    type: ProcessType
    step: StepNumber
    description: StepDescription
    content: StepContent<VendorElementType, VendorActionData>
}
