import csvParse from 'csv-parse'
import { BadState, NotImplemented } from '../error'
import { Directions } from '..'
import { ProcessFile } from '../process/ProcessFile'
import { ProcessHandler } from '../process/ProcessHandler'
import { ImportAction, InteractiveElement, isImportAction, isImportAnswerAction, isImportConfigureAction, isImportOpAction, ProcessConfig, SegmentId } from 'interactive-elements'
import { ImportCSVOptions } from 'interactive-elements'
import { ImportElement } from 'interactive-elements'
import { ImportState, ImportStateText } from 'interactive-elements'
import { TextFileLine } from 'interactive-elements'
import { Process } from '../process/Process'

/**
 * Utility class to provide tools for implementing any text file based process handler.
 */
 export class TextFileProcessHandler<VendorElement extends InteractiveElement> extends ProcessHandler<VendorElement, ImportState, ImportAction> {

  /**
   * Split the file to lines and keep line numbers with the lines. Mark state type as initial state.
   * @param file
   * @returns
   */
  startingState(file: ProcessFile): ImportStateText<'initial'> {
    return {
      stage: 'initial',
      files: {
        [file.name]: {
          lines: file.decode().replace(/\n+$/, '').split('\n').map((text, line) => ({
            text,
            line,
            columns: {}
          }))
        }
      }
    }
  }

  /**
   * Check the state type is matching to 'complete'.
   * @param state
   */
  checkCompletion(state: ImportState): boolean | undefined {
    if (state.stage === 'executed') {
      return true
    }
    return undefined
  }

  /**
   * A hook to check alternative directions from initial state.
   * @param state
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async needInputForSegmentation(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false> {
    return false
  }

  /**
   * A hook to check alternative directions from segmented state.
   * @param state
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async needInputForClassification(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false> {
    return false
  }

  /**
   * A hook to check alternative directions from classified state.
   * @param state
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async needInputForAnalysis(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false> {
    return false
  }

  /**
   * A hook to check alternative directions from analyzed state.
   * @param state
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async needInputForExecution(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction> | false> {
    return false
  }

  /**
   * Run steps in order 'segmentation', 'classification', 'analysis', 'execution'.
   * @param state
   * @returns
   */
  async getDirections(state: ImportState, config: ProcessConfig): Promise<Directions<VendorElement, ImportAction>> {
    let input: Directions<VendorElement, ImportAction> | false
    let directions: Directions<ImportElement, ImportAction>
    switch (state.stage) {
      case 'initial':
        input = await this.needInputForSegmentation(state, config)
        if (input) return input
        directions = new Directions<ImportElement, ImportAction>({
          type: 'action',
          action: { op: 'segmentation' }
        })
        break
      case 'segmented':
        input = await this.needInputForClassification(state, config)
        if (input) return input
        directions = new Directions<ImportElement, ImportAction>({
          type: 'action',
          action: { op: 'classification' }
        })
        break
      case 'classified':
        input = await this.needInputForAnalysis(state, config)
        if (input) return input
        directions = new Directions<ImportElement, ImportAction>({
          type: 'action',
          action: { op: 'analysis' }
        })
        break
      case 'analyzed':
        input = await this.needInputForExecution(state, config)
        if (input) return input
        directions = new Directions<ImportElement, ImportAction>({
          type: 'action',
          action: { op: 'execution' }
        })
        break
      default:
        throw new BadState('Cannot find directions from the current state.')
    }
    return directions as Directions<VendorElement, ImportAction>
  }

  /**
   * Call subclass implementation for each action.
   * @param action
   * @param state
   * @param files
   */
  async action(process: Process<VendorElement, ImportState, ImportAction>, action: ImportAction, state: ImportState, files: ProcessFile[]): Promise<ImportState> {
    if (!isImportAction(action)) {
      throw new BadState(`Action is not import action ${JSON.stringify(action)}`)
    }

    if (isImportOpAction(action)) {
      switch (action.op) {
        case 'analysis':
        case 'classification':
        case 'segmentation':
        case 'execution':
          return this[action.op](process, state, files, process.config)
        default:
          throw new BadState(`Cannot parse action ${JSON.stringify(action)}`)
      }
    }

    if (isImportConfigureAction(action)) {
      Object.assign(process.config, action.configure)
      await process.save()
    }

    if (isImportAnswerAction(action)) {
      if (!process.config.answers) {
        process.config.answers = {}
      }
      const answers = process.config.answers as Record<SegmentId, Record<string, unknown>>
      for (const segmentId of Object.keys(action.answer)) {
        answers[segmentId] = answers[segmentId] || {}
        for (const variable of Object.keys(action.answer[segmentId])) {
          answers[segmentId][variable] = action.answer[segmentId][variable]
        }
      }
      await process.save()
    }
    return state
  }

  /**
   * This function must implement gathering of each line together that forms together one import activity.
   * @param state
   * @param files
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async segmentation(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState> {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement segmentation().`)
  }

  /**
   * This function must implement gathering of each line together that forms together one import activity.
   * @param state
   * @param files
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async classification(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState> {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement classification().`)
  }

  /**
   * This function must implement conversion from classified data to the actual executable operations.
   * @param state
   * @param files
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analysis(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState> {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement analysis().`)
  }

  /**
   * This function must implement applying the result in practice.
   * @param state
   * @param files
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execution(process: Process<VendorElement, ImportState, ImportAction>, state: ImportState, files: ProcessFile[], config: ProcessConfig): Promise<ImportState> {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement execution().`)
  }

  /**
   * Parse a single line of CSV.
   * @param line
   * @param options
   * @returns
   */
  async parseLine(line: string, options: ImportCSVOptions = {}): Promise<string[]> {
    return new Promise((resolve, reject) => {
      csvParse(line, {
        delimiter: options.columnSeparator || ',',
        skip_lines_with_error: !!options.skipErrors
      }, function(err, out) {
        if (err) {
          reject(err)
        } else {
          resolve(out[0])
        }
      })
    })
  }

  /**
   * Go through each file and each line and add CSV interpretation of the content to each line.
   * @param state
   * @param options
   * @returns The original state that has been modified by adding CSV parsed field `columns`.
   */
  async parseCSV(state: ImportStateText<'initial'>, options: ImportCSVOptions = {}): Promise<ImportStateText<'segmented'>> {

    // Heading names per column.
    let headings: string[] = []
    let dropLines = options.cutFromBeginning || 0
    // Run loop over all files.
    let firstLine = true
    for (const fileName of Object.keys(state.files)) {
      for (let n = 0; n < state.files[fileName].lines.length; n++) {
        if (dropLines) {
          dropLines--
          continue
        }
        const line: TextFileLine = { ...state.files[fileName].lines[n] }
        const text = options.trimLines ? line.text.trim() : line.text

        // Collect or define headings on the first line.
        if (firstLine) {
          firstLine = false
          if (options.useFirstLineHeadings) {
            headings = await this.parseLine(text, options)
            continue
          } else {
            const size = (await this.parseLine(text, options)).length
            for (let i = 0; i < size; i++) {
              headings.push(`${i}`)
            }
          }
        }
        // Map each column to its heading name.
        const columns: Record<string, string> = {}
        const pieces = text.trim() !== '' ? await this.parseLine(text, options) : null
        if (pieces) {
          pieces.forEach((column, index) => {
            if (index < headings.length) {
              columns[headings[index]] = column
            } else {
              columns['+'] = columns['+'] || ''
              columns['+'] += column + '\n'
            }
          })
          line.columns = columns

          // Add it back with columns.
          state.files[fileName].lines[n] = line
        }
      }
    }

    const newState: ImportStateText<'segmented'> = {
      ...state as ImportStateText<'initial'>, // We just filled in columns.
      stage: 'segmented'
    }

    return newState
  }
}
