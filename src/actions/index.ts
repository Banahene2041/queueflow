import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'
import {
  ensureBusiness,
  getMyBusiness,
  updateBusinessSettings,
} from './business.js'
import {
  callNextTicket,
  cancelTicket,
  completeTicket,
  markServing,
  skipTicket,
} from './queue.js'
import { inviteStaff, removeStaff, updateStaffRole } from './team.js'

export const actions: Record<string, ActionHandler<Env>> = {
  ensureBusiness,
  updateBusinessSettings,
  getMyBusiness,
  callNextTicket,
  completeTicket,
  skipTicket,
  cancelTicket,
  markServing,
  inviteStaff,
  updateStaffRole,
  removeStaff,
}
