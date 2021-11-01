/**
 * Default version of the configuration for the RISP setup.
 *
 * @property baseUrl Base address for HTPP requests.
 */
export interface Setup {
    baseUrl?: string;
}
/**
 * A trigger is a data packet initiated by some activity in the application.
 * For example user interaction on UI component. Triggers are mapped to the
 * action handlers when used in RISP.
 */
export declare type Trigger = OnChangeTrigger | OnClickTrigger | {
    readonly type: string;
};
/**
 * This trigger is activated, when value of an input is changed.
 */
export interface OnChangeTrigger {
    readonly type: 'onChange';
    name: string;
    value: TriggerValue;
}
/**
 * This trigger is acticated by clicking on some target.
 */
export interface OnClickTrigger {
    readonly type: 'onClick';
}
/**
 * A parameter collection used when rendering element.
 *
 * @property element Actual top level element to render.
 * @property values A set of values to edit associated with the rendering process.
 * @property setup Global configuration for the rendering system.
 */
export declare type RenderingProps<SetupType = Setup, ElementType = Element> = {
    element: ElementType;
    values: TriggerValues;
    setup: SetupType;
};
/**
 * Readability helper to specify that a string is being used as a trigger name.
 */
export declare type ActionName = string;
/**
* Payload of `debug` action.
*/
export interface DebugAction {
    readonly type: 'debug';
}
/**
 * Payload for the action execution.
 */
export declare type Action = DebugAction;
/**
 * An action definition collection.
 */
export interface Actions<ActionType = Action> {
    [key: string]: ActionType | ActionType[];
}
/**
 * A result retuned by the action handler.
 */
export declare type ActionResult = Promise<SuccessgulActionResult | FailedActionResult>;
/**
 * A successful result retuned by the action handler.
 */
export interface SuccessgulActionResult {
    success: true;
}
/**
 * A failure result retuned by the action handler.
 */
export interface FailedActionResult {
    success: false;
    message: string;
}
/**
 * A function processing an action.
 */
export interface ActionHandler<SetupType = Setup, ElementType = Element, ActionType = Action> {
    (action: ActionType, props: RenderingProps<SetupType, ElementType>): ActionResult;
}
/**
 * The handler function is a function converting the trigger data to the action result.
 */
export interface TriggerHandler<SetupType = Setup, ElementType = Element, TriggerType = Trigger> {
    (trigger: TriggerType, props: RenderingProps<SetupType, ElementType>): ActionResult;
}
/**
 * A single payload that the trigger can have, i.e. tigger data.
 */
export declare type TriggerValue = string | number | boolean | null | TriggerValue[] | TriggerValues;
/**
 * A map of names to trigger values.
 */
export interface TriggerValues {
    [key: string]: TriggerValue;
}
/**
 * Readability helper to specify that a string is being used as a trigger name.
 */
export declare type TriggerName = string;
/**
 * Generic interface for all elements that can define action handlers.
 */
export interface ActiveElement<SetupType = Setup, ElementType = Element, TriggerType = Trigger, ActionType = Action> {
    readonly type: string;
    triggerHandler?: TriggerHandler<SetupType, ElementType, TriggerType>;
    actions: Actions<ActionType>;
    label?: string;
}
export declare function isActiveElement(object: unknown): object is ActiveElement;
/**
 * An element that has a name and a value.
 */
export interface NamedElement {
    readonly type: string;
    name: string;
    defaultValue?: TriggerValue;
    label?: string;
}
export declare function isNamedElement(object: unknown): object is NamedElement;
/**
 * A boolean toggle element.
 */
export interface BooleanElement extends ActiveElement, NamedElement {
    readonly type: string;
}
export declare function isBooleanElement(object: unknown): object is BooleanElement;
/**
 * A text editing element.
 */
export interface TextElement extends ActiveElement, NamedElement {
    readonly type: string;
}
export declare function isTextElement(object: unknown): object is TextElement;
/**
 * An element activating an action when clicked.
 */
export interface ButtonElement extends ActiveElement {
    readonly type: 'string';
    label: string;
}
export declare function isButtonElement(object: unknown): object is ButtonElement;
/**
 * An elment that contains other elements.
 */
export interface ContainerElement<ElementType = Element> {
    elements: ElementType[];
}
export declare function isContainerElement(object: unknown): object is ContainerElement;
/**
 * A simple element container rendering each contained element one by one in DIV.
 */
export interface FlatElement<ElementType = Element> extends ContainerElement<ElementType> {
    readonly type: string;
}
export declare function isFlatElement(object: unknown): object is FlatElement;
/**
 * Generic base class for an element displaying some data content.
 */
export interface ViewElement<DataType> {
    data: DataType;
}
export declare type Element = BooleanElement | TextElement | ButtonElement | FlatElement;
