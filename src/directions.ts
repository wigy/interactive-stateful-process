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

export interface DirectionsData<VendorElementType, VendorActionData> {
  title: StepTitle
  process: ProcessName
  type: ProcessType
  step: StepNumber
  description: StepDescription
  content: StepContent<VendorElementType, VendorActionData>
}

export class Directions<VendorElementType, VendorActionData> {
  title: StepTitle
  process: ProcessName
  type: ProcessType
  step: StepNumber
  description: StepDescription
  content: StepContent<VendorElementType, VendorActionData>

  constructor(obj: DirectionsData<VendorElementType, VendorActionData>) {
    this.title = obj.title
    this.process = obj.process
    this.type = obj.type
    this.step = obj.step
    this.description = obj.description
    this.content = obj.content
  }

  toJSON(): DirectionsData<VendorElementType, VendorActionData> {
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
