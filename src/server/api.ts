import { Database, ID } from ".."

/**
 * Data query API for processes.
 * @param db
 * @returns
 */
export default function(db: Database) {
  return {
    process: {
      get: async (id: ID) => {
        return db('processes').select('*').where({ id })
      }
    }
  }
}
