import { ActionName } from "./action";
import { ProcessId, ProcessName } from "./process";

export interface Input<VendorActionData> {
    id: ProcessId,
    process: ProcessName
    action: ActionName
    data: VendorActionData
}
