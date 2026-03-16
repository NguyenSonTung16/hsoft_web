import type { LoginAttemptLog, LoginEventType } from '../types/login.types'

type LogInput = Omit<LoginAttemptLog, 'occurredAt'>

export function logLoginAttempt(event: LogInput): void {
  // Security: never log password. Explicitly delete if somehow present.
  const safeEvent = { ...(event as LogInput & { password?: unknown }) }
  delete safeEvent.password

  const entry: LoginAttemptLog = {
    ...safeEvent,
    occurredAt: new Date().toISOString(),
  }

  console.info('[LIS Login]', entry.eventType, JSON.stringify({
    occurredAt: entry.occurredAt,
    eventType: entry.eventType,
    username: entry.username,
    facilityId: entry.facilityId,
    labAreaId: entry.labAreaId,
    ...(entry.errorCode ? { errorCode: entry.errorCode } : {}),
  }))
}

export function logEvent(eventType: LoginEventType, ctx: Omit<LogInput, 'eventType'>): void {
  logLoginAttempt({ eventType, ...ctx })
}
