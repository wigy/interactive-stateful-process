export type ActionName = string
export type ActionLabel = string

export interface ActionTemplate<VendorActionData> {
    name: ActionName
    label: ActionLabel
    data: VendorActionData
}
