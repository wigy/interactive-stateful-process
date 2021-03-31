import { ProcessName } from "./process"

export type ActionName = string
export type ActionLabel = string

export interface ActionTemplate<VendorActionData> {
    name: ActionName
    label: ActionLabel
    data: VendorActionData
}

export class Action<VendorActionData> {
    process: ProcessName
    action: ActionName
    data: VendorActionData

    constructor(obj: {
        process: ProcessName
        action: ActionName
        data: VendorActionData
    }) {
        this.process = obj.process
        this.action = obj.action
        this.data = obj.data
    }

    get dbData(): object {
        return {
            process: this.process,
            action: this.action,
            data: this.data,
        }
    }
}
