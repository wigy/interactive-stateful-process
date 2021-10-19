export type ElementName = string
export type ElementLabel = string
export type ElementType = 'text'
export type ElementTrigger = string

export interface Element<VendorElementType> {
  name: ElementName
  label: ElementLabel
  type: ElementType | VendorElementType
  focus: boolean
  onChangeDelayed: ElementTrigger
  onEnter: ElementTrigger
}
