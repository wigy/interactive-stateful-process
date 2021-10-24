import { Database, DatabaseError, FileEncoding, ID } from ".."

/**
 * A data structure containing input data for the process.
 */
 export interface ProcessFileData {
  processId?: ID
  name: string
  type?: string
  encoding: FileEncoding
  data: string
}

/**
 * An instance of input data for processing.
 */
export class ProcessFile {
  id: ID
  processId: ID
  name: string
  type?: string
  encoding: FileEncoding
  data: string

  constructor(obj: ProcessFileData) {
    this.id = null
    this.processId = obj.processId || null
    this.name = obj.name
    this.type = obj.type
    this.encoding = obj.encoding
    this.data = obj.data
  }

  toString(): string {
    return `ProcessFile #${this.id} ${this.name}`
  }

  /**
   * Get the loaded process information as JSON object.
   * @returns
   */
   toJSON(): ProcessFileData {
    return {
      processId: this.processId,
      name: this.name,
      type: this.type,
      encoding: this.encoding,
      data: this.data
    }
  }

  /**
   * Save the file to the database.
   */
  async save(db: Database): Promise<ID> {
    const out = this.toJSON()
    if (this.encoding === 'json') {
      out.data = JSON.stringify(out.data)
    }
    if (this.id) {
      await db('process_files').update(out).where({ id: this.id })
      return this.id
    } else {
      this.id = (await db('process_files').insert(out).returning('id'))[0]
      if (this.id) return this.id
      throw new DatabaseError(`Saving process ${JSON.stringify(out)} failed.`)
    }
  }
}
