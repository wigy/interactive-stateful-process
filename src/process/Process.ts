import clone from 'clone'
import { Database } from '../common'
import { Directions } from './directions'
import { BadState, DatabaseError, InvalidArgument } from '../error'
import { ProcessFile } from './ProcessFile'
import { ProcessingSystem } from './ProcessingSystem'
import { ProcessStep } from './ProcessStep'
import { ProcessName, ProcessConfig, ProcessStatus, ID } from 'interactive-elements'

/**
 * Overall description of the process.
 */
 export interface ProcessInfo {
  name: ProcessName
  config: ProcessConfig
  complete: boolean
  successful: boolean | undefined
  currentStep: number | undefined
  status: ProcessStatus
  error?: string
}

/**
 * A complete description of the process state and steps taken.
 */
export class Process<VendorElement, VendorState, VendorAction> {

  system: ProcessingSystem<VendorElement, VendorState, VendorAction>

  id: ID
  name: ProcessName
  config: ProcessConfig
  complete: boolean
  successful: boolean | undefined
  currentStep: number | undefined
  status: ProcessStatus
  files: ProcessFile[]
  steps: ProcessStep<VendorElement, VendorState, VendorAction>[]
  error: string | undefined

  constructor(system: ProcessingSystem<VendorElement, VendorState, VendorAction>, name: ProcessName | null, config: ProcessConfig = {}) {
    this.system = system

    this.id = null
    this.config = config
    this.name = name || '[no name]'
    this.complete = false
    this.successful = undefined
    this.files = []
    this.steps = []
    this.currentStep = undefined
    this.status = 'INCOMPLETE' as ProcessStatus
  }

  toString(): string {
    return `Process #${this.id} ${this.name}`
  }

  /**
   * Get the loaded process information as JSON object.
   * @returns
   */
  toJSON(): ProcessInfo {
    return {
      name: this.name,
      config: this.config,
      complete: this.complete,
      successful: this.successful,
      currentStep: this.currentStep,
      status: this.status,
      error: this.error
    }
  }

  /**
   * Append a file to this process and link its ID.
   * @param file
   */
  addFile(file: ProcessFile): void {
    file.processId = this.id
    this.files.push(file)
  }

  /**
   * Append a step to this process and link its ID.
   * @param step
   */
   async addStep(step: ProcessStep<VendorElement, VendorState, VendorAction>): Promise<void> {
    step.processId = this.id
    step.process = this
    this.steps.push(step)
  }

  /**
   * Load the current step if not yet loaded and return it.
   */
  async getCurrentStep(): Promise<ProcessStep<VendorElement, VendorState, VendorAction>> {
    if (this.currentStep === null || this.currentStep === undefined) {
      throw new BadState(`Process #${this.id} ${this.name} has invalid current step.`)
    }
    if (this.steps[this.currentStep]) {
      return this.steps[this.currentStep]
    }
    return this.loadStep(this.currentStep)
  }

  /**
   * Mark the current state as completed and create new additional step with the new state.
   * @param state
   */
  async proceedToState(action: VendorAction, state: VendorState): Promise<void> {
    const current = await this.getCurrentStep()
    const handler = this.system.getHandler(current.handler)
    current.action = action
    current.finished = new Date()
    current.save()
    const nextStep = new ProcessStep<VendorElement, VendorState, VendorAction>({
      number: current.number + 1,
      state,
      handler: handler.name
    })
    this.addStep(nextStep)
    this.currentStep = (this.currentStep || 0) + 1
    this.system.logger.info(`Proceeding ${this} to new step ${this.currentStep}.`)
    this.save()
    await nextStep.save()
    await this.system.checkFinishAndFindDirections(handler, nextStep)
  }

  /**
   * Get a reference to the database.
   */
  get db(): Database {
    return this.system.db
  }

  /**
   * Save the process info to the database.
   */
  async save(): Promise<ID> {
    if (this.id) {
      await this.db('processes').update(this.toJSON()).where({ id: this.id })
      return this.id
    } else {
      this.id = (await this.db('processes').insert(this.toJSON()).returning('id'))[0].id
      if (this.id) return this.id
      throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`)
    }
  }

  /**
   * Load the process data and its files. Note that current step is not yet loaded here, but when using getCurrentStep().
   * @param id
   */
  async load(id: ID): Promise<void> {
    // Load basic info.
    const data = await this.db('processes').select('*').where({ id }).first()
    if (!data) {
      throw new InvalidArgument(`Cannot find process #${id}`)
    }
    Object.assign(this, data)
    this.id = id
    // Load files.
    this.files = (await this.db('process_files').select('*').where({ processId: this.id })).map(fileData => {
      const file = new ProcessFile(fileData)
      file.id = fileData.id
      return file
    })
    // Load current step.
    await this.getCurrentStep()
  }

  /**
   * Load the step with the given number from the database.
   * @param number
   * @returns
   */
  async loadStep(number: number): Promise<ProcessStep<VendorElement, VendorState, VendorAction>> {
    if (!this.id) {
      throw new BadState(`Cannot load steps, if the process have no ID ${JSON.stringify(this.toJSON())}.`)
    }
    if (this.currentStep === undefined) {
      throw new BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.toJSON())}.`)
    }
    const data = await this.db('process_steps').where({ processId: this.id, number }).first()
    if (!data) {
      throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`)
    }
    this.steps[this.currentStep] = new ProcessStep<VendorElement, VendorState, VendorAction>(data)
    this.steps[this.currentStep].id = data.id
    this.steps[this.currentStep].process = this
    return this.steps[this.currentStep]
  }

  /**
   * Check if the process can be run.
   */
  canRun(): boolean {
    return !this.complete && (this.status === 'INCOMPLETE' || this.status === 'WAITING')
  }

  /**
   * Execute process as long as it is completed, failed or requires additional input.
   */
  async run(): Promise<void> {
    let step
    let MAX_RUNS = 100
    while (true) {
      MAX_RUNS--
      if (MAX_RUNS < 0) {
        this.system.logger.error(`Maximum number of executions reached for the process ${this}.`)
        break
      }
      step = await this.getCurrentStep()
      if (!step.directions) {
        this.system.logger.info(`No new directions for the process ${this}.`)
        break
      }
      if (!step.directions.isImmediate()) {
        this.system.logger.info(`Waiting for more input for the process ${this}.`)
        await this.updateStatus()
        break
      }
      const handler = this.system.getHandler(step.handler)
      const state = clone(step.state)
      const action = clone(step.directions.action)
      try {
        if (action) {
          const nextState = await handler.action(this, action, state, this.files)
          await this.proceedToState(action, nextState)
        } else {
          throw new BadState(`Process step ${step} has no action.`)
        }
      } catch (err) {
        return await this.crashed(err)
      }
    }
  }

  /**
   * Record the error and mark the process as finished with an error.
   * @param err
   */
  async crashed(err: Error): Promise<void> {
    if ('element' in err) {
      // Postpone the action we tried. Instead, create query for UI to add more configuration for later retry.
      const directions = new Directions<VendorElement, VendorAction>({
        type: 'ui',
        element: err['element'] as unknown as VendorElement
      })
      const step = await this.getCurrentStep()
      step.directions = directions
      await step.save()
      await this.updateStatus()
      return
    }

    this.system.logger.error(`Processing of ${this} failed:`, err)
    if (this.currentStep !== undefined && this.currentStep !== null) {
      const step = await this.loadStep(this.currentStep)
      step.finished = new Date()
      await step.save()
    }
    this.error = err.stack ? err.stack : `${err.name}: ${err.message}`
    await this.save()
    await this.updateStatus()
  }

  /**
   * Resolve the status of the process and update it to the database.
   */
  async updateStatus(): Promise<void> {
    let status = 'INCOMPLETE'
    if (this.error) {
      status = 'CRASHED'
    } else {
      if (this.currentStep === null || this.currentStep === undefined) {
        throw new BadState(`Cannot check status when there is no current step loaded for ${this}`)
      }
      const step = this.steps[this.currentStep]
      if (step.finished) {
        if (this.successful === true) status = 'SUCCEEDED'
        if (this.successful === false) status = 'FAILED'
      }
      if (step.directions) {
        status = step.directions.isImmediate() ? 'INCOMPLETE' : 'WAITING'
      }
    }
    if (this.status !== status) {
      this.system.logger.info(`Process ${this} is now ${status}`)
    }
    this.status = status as ProcessStatus
    await this.db('processes').update({ status }).where({ id: this.id })

    switch (status) {
      case 'SUCCEEDED':
        await this.system.connector.success(this.state)
        break
      case 'CRASHED':
        await this.system.connector.fail(this.error)
        break
      case 'FAILED':
        await this.system.connector.fail(this.state)
        break
      default:
        const directions = this.currentStep ? this.steps[this.currentStep].directions : null
        const state = this.currentStep ? this.steps[this.currentStep].state : null
        await this.system.connector.waiting(state, directions)
    }
  }

  /**
   * Get the state of the current step of the process.
   */
  get state(): VendorState {
    if (this.currentStep === null || this.currentStep === undefined) {
      throw new BadState(`Cannot check state when there is no current step loaded for ${this}`)
    }
    const step = this.steps[this.currentStep]
    return step.state
  }

  /**
   * Handle external input coming in.
   * @param action
   */
  async input(action: VendorAction): Promise<void> {
    const step = await this.getCurrentStep()
    const handler = this.system.getHandler(step.handler)
    let nextState
    try {
      nextState = await handler.action(this, action, clone(step.state), this.files)
    } catch(err) {
      return this.crashed(err)
    }
    await this.proceedToState(action, nextState)
  }

  /**
   * Roll back the latest step.
   */
  async rollback(): Promise<boolean> {
    if (this.currentStep === null || this.currentStep === undefined) {
      throw new BadState(`Cannot roll back when there is no current step.`)
    }
    if (this.currentStep < 1) {
      throw new BadState(`Cannot roll back when there is only initial step in the process.`)
    }
    const step = await this.getCurrentStep()
    this.system.logger.info(`Attempt of rolling back '${step}' from '${this}'.`)
    const handler = this.system.getHandler(step.handler)
    const result = await handler.rollback(step)
    if (result) {
      if (this.error) {
        this.error = undefined
      }
      await this.db('process_steps').delete().where({ id: step.id })
      this.currentStep--
      await this.save()
      const newCurrentStep = await this.getCurrentStep()
      newCurrentStep.finished = undefined
      await newCurrentStep.save()
      await this.updateStatus()
      this.system.logger.info(`Roll back of '${this}' to '${newCurrentStep}' successful.`)
      return true
    }
    this.system.logger.info(`Not able to roll back '${this}'.`)
    return false
  }
}
