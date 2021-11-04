import { Database } from '../common'
import { GetApiResponse, ID } from 'interactive-elements'

export type ProcessApi = {
  process: {
    getAll: () => Promise<GetApiResponse[]>,
    get: (id: ID) => Promise<GetApiResponse>
  }
}

/**
 * Data query API for processes.
 * @param db
 * @returns
 */
export default function(db: Database): ProcessApi {
  return {
    process: {
      getAll: async (): Promise<GetApiResponse[]> => {
        return db('processes').select('*').orderBy('created', 'desc')
      },
      get: async (id: ID): Promise<GetApiResponse> => {
        const data = await db('processes').select('*').where({ id }).first()
        if (data) {
          const count = await db('process_steps').count('id').where({ processId: id }).first()
          data.steps = count ? parseInt(count.count as string) : null
        }
        return data
      }
    }
  }
}
