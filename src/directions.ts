import { ActionTemplate } from "./action"
import { Element } from "./element"
import { ProcessType, ProcessName } from "./process"

export interface StepContent<VendorElementType, VendorActionData> {
    elements?: Element<VendorElementType>[]
    actions?: ActionTemplate<VendorActionData>[]
}

export type StepNumber = number
export type StepTitle = string
export type StepDescription = string

export class Directions<VendorElementType, VendorActionData> {
    title: StepTitle
    process: ProcessName
    type: ProcessType
    step: StepNumber
    description: StepDescription
    content: StepContent<VendorElementType, VendorActionData>

    constructor(obj: {
        title: StepTitle,
        process: ProcessName,
        type: ProcessType,
        step: StepNumber,
        description: StepDescription,
        content: StepContent<VendorElementType, VendorActionData>
    }) {
        this.title = obj.title
        this.process = obj.process
        this.type = obj.type
        this.step = obj.step
        this.description = obj.description
        this.content = obj.content
    }

    get dbData(): object {
        return {
            title: this.title,
            process: this.process,
            type: this.type,
            step: this.step,
            description: this.description,
            content: this.content,
        }
    }
}
