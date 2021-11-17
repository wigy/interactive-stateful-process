import { Database } from '../common'
import { GetAllProcessesApiResponse, GetOneProcessResponse, ID } from 'interactive-elements'

export type ProcessApi = {
  process: {
    getAll: () => Promise<GetAllProcessesApiResponse>,
    get: (id: ID) => Promise<GetOneProcessResponse>
    getStep: (id: ID, step: number) => Promise<any> // TODO: Define response
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
      getAll: async (): Promise<GetAllProcessesApiResponse> => {
        return db('processes').select('*').orderBy('created', 'desc')
      },
      get: async (id: ID): Promise<GetOneProcessResponse> => {
        const data = await db('processes').select('*').where({ id }).first()
        if (data) {
          const count = await db('process_steps').count('id').where({ processId: id }).first()
          data.steps = count ? parseInt(count.count as string) : null
        }
        return data
      },
      getStep: async (id: ID, number: number): Promise<any> => { // TODO: Define response
        const data = await db('process_steps').select('*').where({ processId: id, number }).first()
        return data
      }
    }
  }
}
