/**
 * Definition of the how the direction plays out.
 */
export declare type DirectionsType = 'action' | 'ui' | 'complete';
/**
 * Definition of direction data.
 */
export interface DirectionsData<VendorElement, VendorAction> {
    type: DirectionsType;
    element?: VendorElement;
    action?: VendorAction;
}
/**
 * Data describing possible directions forward from the given state.
 */
export declare class Directions<VendorElement, VendorAction> {
    type: DirectionsType;
    element?: VendorElement;
    action?: VendorAction;
    constructor(obj: DirectionsData<VendorElement, VendorAction>);
    /**
     * Construct JSON data of the member fields that has been set.
     * @returns
     */
    toJSON(): DirectionsData<VendorElement, VendorAction>;
    /**
     * Check if the direction can be determined without user intervention.
     */
    isImmediate(): boolean;
    /**
     * Check if there are no directions forward.
     */
    isComplete(): boolean;
}
