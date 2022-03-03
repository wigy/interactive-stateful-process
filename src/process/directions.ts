/**
 * Definition of the how the direction plays out.
 */
export type DirectionsType = 'action' | 'ui' | 'complete'

/**
 * Definition of direction data.
 */
export interface DirectionsData<VendorElement, VendorAction> {
  type: DirectionsType
  element?: VendorElement
  action?: VendorAction
}

/**
 * Data describing possible directions forward from the given state.
 */
export class Directions<VendorElement, VendorAction> {
  type: DirectionsType
  element?: VendorElement
  action?: VendorAction

  constructor(obj: DirectionsData<VendorElement, VendorAction>) {
    this.type = obj.type
    this.element = obj.element
    this.action = obj.action
  }

  /**
   * Construct JSON data of the member fields that has been set.
   * @returns
   */
  toJSON(): DirectionsData<VendorElement, VendorAction> {
    const ret: DirectionsData<VendorElement, VendorAction> = {
      type: this.type
    }
    if (this.element) {
      ret.element = this.element
    }
    if (this.action) {
      ret.action = this.action
    }
    return ret
  }

  /**
   * Check if the direction can be determined without user intervention.
   */
  isImmediate(): boolean {
    return this.type === 'action'
  }

  /**
   * Check if there are no directions forward.
   */
  isComplete(): boolean {
    return this.type === 'complete'
  }
}
