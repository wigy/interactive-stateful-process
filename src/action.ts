import { ProcessName } from "./process"

export type ActionName = string
export type ActionLabel = string

export interface ActionTemplate<VendorActionData> {
  name: ActionName
  label: ActionLabel
  data: VendorActionData
}

export interface ActionData<VendorActionData> {
  process: ProcessName
  action: ActionName
  data: VendorActionData
}

export class Action<VendorActionData> {
  process: ProcessName
  action: ActionName
  data: VendorActionData

  constructor(obj: ActionData<VendorActionData>) {
    this.process = obj.process
    this.action = obj.action
    this.data = obj.data
  }

  toJSON(): ActionData<VendorActionData> {
    return {
      process: this.process,
      action: this.action,
      data: this.data,
    }
  }
}
