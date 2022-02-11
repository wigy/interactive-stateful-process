import { Database, DatabaseError, Directions } from '..'
import { Process } from './Process'
import { ID } from 'interactive-elements'

/**
 * A basic information of the processing step.
 */
 export interface ProcessStepData<VendorElement, VendorState, VendorAction> {
  processId?: ID
  number: number
  state: VendorState
  handler: string
  action?: VendorAction
  directions?: Directions<VendorElement, VendorAction>
  started?: Date
  finished?: Date
}

/**
 * Data of the one step in the process including possible directions and action taken to the next step, if any.
 */
export class ProcessStep<VendorElement, VendorState, VendorAction> {

  process: Process<VendorElement, VendorState, VendorAction>

  id: ID
  processId: ID
  number: number
  state: VendorState
  handler: string
  started: Date | undefined
  finished: Date | undefined
  directions?: Directions<VendorElement, VendorAction>
  action?: VendorAction | undefined

  constructor(obj: ProcessStepData<VendorElement, VendorState, VendorAction>) {
    this.processId = obj.processId || null
    this.number = obj.number
    this.state = obj.state
    this.handler = obj.handler
    this.directions = obj.directions ? new Directions<VendorElement, VendorAction>(obj.directions) : undefined
    this.action = obj.action
    this.started = obj.started
    this.finished = obj.finished
  }

  toString(): string {
    return `ProcessStep ${this.number} of Process #${this.processId}`
  }

  /**
   * Get a reference to the database.
   */
   get db(): Database {
    return this.process.db
  }

  /**
   * Save the process info to the database.
   */
   async save(): Promise<ID> {
    if (this.id) {
      await this.db('process_steps').update(this.toJSON()).where({ id: this.id })
      return this.id
    } else {
      this.started = new Date()
      this.id = (await this.db('process_steps').insert(this.toJSON()).returning('id'))[0].id
      if (this.id) return this.id
      throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`)
    }
  }

  /**
   * Get the loaded process information as JSON object.
   * @returns
   */
   toJSON(): ProcessStepData<VendorElement, VendorState, VendorAction> {
    return {
      processId: this.processId,
      number: this.number,
      state: this.state,
      directions: this.directions,
      handler: this.handler,
      action: this.action,
      started: this.started,
      finished: this.finished,
    }
  }

  /**
   * Set directions and update database.
   * @param db
   * @param directions
   */
  async setDirections(db: Database, directions: Directions<VendorElement, VendorAction>): Promise<void> {
    this.directions = directions
    await db('process_steps').update({ directions: directions.toJSON() }).where({ id: this.id })
  }
}
