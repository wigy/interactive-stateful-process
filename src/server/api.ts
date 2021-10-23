import { Database, ID } from ".."

/**
 * Data query API for processes.
 * @param db
 * @returns
 */
export default function(db: Database) {
  return {
    process: {
      get: async (id: ID = null) => {
        if (id) {
          return db('processes').select('*').where({ id }).first()
        }
        return db('processes').select('*')
      }
    }
  }
}
