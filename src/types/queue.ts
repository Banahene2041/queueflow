/** Valid ticket lifecycle states. */
export type TicketStatus = 'waiting' | 'serving' | 'completed' | 'skipped' | 'cancelled'

/** Business-level membership role (not the DeepSpace room role). */
export type MembershipRole = 'admin' | 'staff'

export type MembershipStatus = 'active' | 'inactive'

export type QueueEventAction =
  | 'joined'
  | 'called'
  | 'serving'
  | 'completed'
  | 'skipped'
  | 'cancelled'

export interface Business {
  name: string
  slug: string
  description: string
  address: string
  logoKey: string
  isOpen: boolean
  averageServiceMinutes: number
}

export interface TeamMember {
  teamId: string
  userId: string
  role: MembershipRole
  status: MembershipStatus
}

export interface Ticket {
  businessId: string
  queueDay: string
  ticketNumber: number
  customerName: string
  phone: string
  status: TicketStatus
  joinedAt: string
  calledAt: string
  completedAt: string
}

export interface TicketSecret {
  ticketId: string
  businessId: string
  accessToken: string
  accessTokenHash: string
}

export interface QueueEvent {
  businessId: string
  ticketId: string
  actorId: string
  action: QueueEventAction
}

export interface QueueSnapshot {
  businessId: string
  waitingCount: number
  servingTicketNumber: number
  estimatedWaitMinutes: number
  isOpen: boolean
}

export interface QueueCounter {
  businessId: string
  queueDay: string
  nextNumber: number
}

/** Safe fields shown on the customer ticket page. */
export interface TicketView {
  businessId: string
  businessName: string
  ticketNumber: number
  status: TicketStatus
  peopleAhead: number
  estimatedWaitMinutes: number
  customerName: string
}
