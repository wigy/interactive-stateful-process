import { Directions, NotImplemented } from ".."
import { ProcessFile } from "./ProcessFile"
import { ProcessStep } from "./ProcessStep"
import { ProcessingSystem } from "./ProcessingSystem"
import { ProcessConfigSection } from "./ProcessConnector"
import { ProcessConfig } from "interactive-elements"

/**
 * A handler taking care of moving between process states.
 */
 export class ProcessHandler<VendorElement, VendorState, VendorAction> {

  system: ProcessingSystem<VendorElement, VendorState, VendorAction>
  name: string

  constructor(name: string) {
    this.name = name
  }

  /**
   * Attach this handler to the processing system during the registration.
   * @param system
   */
  connect(system: ProcessingSystem<VendorElement, VendorState, VendorAction>): void {
    this.system = system
  }

  /**
   * Get the value from the system configuration.
   */
  async getConfig(section: ProcessConfigSection, name: string): Promise<unknown> {
    return this.system.getConfig(section, name)
  }

  /**
   * Check if we are able to handle the given data.
   * @param file
   */
  canHandle(file: ProcessFile): boolean {
    throw new NotImplemented(`A handler '${this.name}' cannot check file '${file.name}', since canHandle() is not implemented.`)
  }

  /**
   * Check if the state is either successful `true` or failed `false` or not yet complete `undefined`.
   * @param state
   */
  checkCompletion(state: VendorState): boolean | undefined {
    throw new NotImplemented(`A handler '${this.name}' cannot check state '${JSON.stringify(state)}', since checkCompletion() is not implemented.`)
  }

  /**
   * Execute an action to the state in order to produce new state. Note that state is cloned and can be modified to be new state.
   * @param action
   * @param state
   * @param files
   */
  async action(action: VendorAction, state: VendorState, files: ProcessFile[]): Promise<VendorState> {
    throw new NotImplemented(`A handler '${this.name}' for files ${files.map(f => `'${f}''`).join(', ')} does not implement action()`)
  }

  /**
   * Construct intial state from the given data.
   * @param file
   */
  startingState(file: ProcessFile): VendorState {
    throw new NotImplemented(`A handler '${this.name}' for file '${file.name}' does not implement startingState()`)
  }

  /**
   * Figure out possible directions from the given state.
   * @param state
   */
  async getDirections(state: VendorState, config: ProcessConfig): Promise<Directions<VendorElement, VendorAction>> {
    throw new NotImplemented(`A handler '${this.name}' for state '${JSON.stringify(state)}' does not implement getDirections()`)
  }

  /**
   * See if it is possible rollback a step.
   * @param step
   */
  async rollback(step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<boolean> {
    throw new NotImplemented(`A handler '${this.name}' for step '${step}' does not implement rollback()`)
  }
}

/**
 * A collection of process handlers.
 */
export type ProcessHandlerMap<VendorElement, VendorState, VendorAction> = {
  [key: string]: ProcessHandler<VendorElement, VendorState, VendorAction>
}
