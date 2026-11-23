import type { ActionResult, ActionTools } from 'deepspace/worker'
import type { Env } from '../../worker'

/**
 * Build RBAC-bypassing record tools pointed at a specific RecordRoom.
 * Used by public queue routes and (later) per-ticket rooms.
 */
export function createRecordTools(env: Env, roomName: string, actorId: string): ActionTools {
  const stub = env.RECORD_ROOMS.get(env.RECORD_ROOMS.idFromName(roomName))

  async function execTool<TData>(
    tool: string,
    params: Record<string, unknown>,
  ): Promise<ActionResult<TData>> {
    const res = await stub.fetch(
      new Request('https://internal/api/tools/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': actorId,
          'X-App-Action': 'true',
        },
        body: JSON.stringify({ tool, params }),
      }),
    )
    return res.json() as Promise<ActionResult<TData>>
  }

  return {
    create: (collection, data, recordId) =>
      execTool('records.create', { collection, data, recordId }),
    update: (collection, recordId, data) =>
      execTool('records.update', { collection, recordId, data }),
    remove: (collection, recordId) =>
      execTool('records.delete', { collection, recordId }),
    deleteWhere: (collection, where, limit) =>
      execTool('records.deleteWhere', { collection, where, limit }),
    get: (collection, recordId) => execTool('records.get', { collection, recordId }),
    query: (collection, options) => execTool('records.query', { collection, ...options }),
    integration: async () => ({
      success: false,
      error: 'Integrations are not available on public queue tools',
    }),
    registerUser: (options) => execTool('users.register', { ...options }),
  }
}

export function appRoomName(env: Env): string {
  return `app:${env.DEEPSPACE_APP_ID}`
}
