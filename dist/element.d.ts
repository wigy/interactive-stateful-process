export declare type ElementName = string;
export declare type ElementLabel = string;
export declare type ElementType = 'text';
export declare type ElementTrigger = string;
export interface Element<VendorElementType> {
    name: ElementName;
    label: ElementLabel;
    type: ElementType | VendorElementType;
    focus: boolean;
    onChangeDelayed: ElementTrigger;
    onEnter: ElementTrigger;
}
