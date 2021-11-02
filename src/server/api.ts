import { Database, ID, ProcessConfig, ProcessName, ProcessStatus } from ".."

export type GetApiResponse = {
  id: ID
  ownerId: ID
  name: ProcessName
  config: ProcessConfig
  complete: boolean
  successful: boolean | undefined
  currentStep: number | undefined
  status: ProcessStatus
  error: string | undefined
  created: Date
}

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
        return db('processes').select('*').where({ id }).first()
      }
    }
  }
}
