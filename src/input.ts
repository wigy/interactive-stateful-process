import { ID } from "./common"
import { ActionName } from "./action"
import { ProcessName } from "./process"

export interface Input<VendorActionData> {
    id: ID,
    process: ProcessName
    action: ActionName
    data: VendorActionData
}
