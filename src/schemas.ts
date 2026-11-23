/**
 * Collection Schemas
 *
 * All collections with columns and RBAC permissions.
 * Single source of truth — imported by both worker and frontend.
 *
 * Add schemas by creating a file in src/schemas/ and importing it here.
 */

import type { CollectionSchema } from 'deepspace/schema'
import { usersSchema } from './schemas/users-schema'
import { settingsSchema } from './schemas/admin-schema'
import { businessesSchema } from './schemas/businesses-schema'
import { teamMembersSchema } from './schemas/team-members-schema'
import { ticketsSchema } from './schemas/tickets-schema'
import { ticketSecretsSchema } from './schemas/ticket-secrets-schema'
import { queueEventsSchema } from './schemas/queue-events-schema'
import { queueSnapshotsSchema } from './schemas/queue-snapshots-schema'
import { queueCountersSchema } from './schemas/queue-counters-schema'
import { ticketViewsSchema } from './schemas/ticket-views-schema'

export const schemas: CollectionSchema[] = [
  usersSchema,
  settingsSchema,
  businessesSchema,
  teamMembersSchema,
  ticketsSchema,
  ticketSecretsSchema,
  queueEventsSchema,
  queueSnapshotsSchema,
  queueCountersSchema,
  ticketViewsSchema,
]
