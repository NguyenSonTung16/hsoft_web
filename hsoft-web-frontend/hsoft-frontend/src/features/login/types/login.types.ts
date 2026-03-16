export interface FacilityOption {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface LabAreaOption {
  id: string
  facilityId: string
  code: string
  name: string
  isActive: boolean
}

export interface LoginFormState {
  username: string
  password: string
  facilityId: string
  labAreaId: string
  workDate: string
  touched: Record<string, boolean>
  errors: Record<string, string>
}

export interface LoginRequestDraft {
  username: string
  password: string
  facilityId: string
  labAreaId: string
  workDate: string
}

export type SessionStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SessionBootstrapState {
  status: SessionStatus
  message?: string
  sessionToken?: string
  expiresAt?: string
  reauthRequired: boolean
  lastAttemptAt?: string
}

export type LoginEventType = 'lookup_load' | 'submit' | 'submit_success' | 'submit_error'

export interface LoginAttemptLog {
  occurredAt: string
  eventType: LoginEventType
  username?: string
  facilityId?: string
  labAreaId?: string
  errorCode?: string
}
