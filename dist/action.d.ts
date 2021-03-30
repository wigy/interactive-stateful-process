export declare type ActionName = string;
export declare type ActionLabel = string;
export interface ActionTemplate<VendorActionData> {
    name: ActionName;
    label: ActionLabel;
    data: VendorActionData;
}
