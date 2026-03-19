import { useState, useCallback, useEffect } from 'react'
import type { LoginFormState, FacilityOption, LabAreaOption, SessionBootstrapState } from '../types/login.types'
import { loginService, type LoginServiceContract } from '../services/loginService'
import { logEvent } from '../services/loginLogger'

export function validateLoginForm(form: LoginFormState): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.username.trim()) {
    errors.username = 'Vui lòng nhập tên đăng nhập.'
  }
  if (!form.password) {
    errors.password = 'Vui lòng nhập mật khẩu.'
  }
  if (!form.facilityId) {
    errors.facilityId = 'Vui lòng chọn cơ sở.'
  }
  if (!form.labAreaId) {
    errors.labAreaId = 'Vui lòng chọn khu xét nghiệm.'
  }
  if (!form.workDate) {
    errors.workDate = 'Vui lòng chọn ngày làm việc.'
  }

  return errors
}

const REQUIRED_FIELDS: string[] = [
  'username', 'password', 'facilityId', 'labAreaId', 'workDate',
]

const initialForm: LoginFormState = {
  username: '',
  password: '',
  facilityId: '',
  labAreaId: '',
  workDate: new Date().toISOString().slice(0, 10),
  touched: {},
  errors: {},
}

const initialSession: SessionBootstrapState = {
  status: 'idle',
  reauthRequired: false,
}

interface UseLoginFormDeps {
  service: Pick<LoginServiceContract, 'loadFacilities' | 'loadLabAreas' | 'submitLogin'>
  log: typeof logEvent
}

const defaultDeps: UseLoginFormDeps = {
  service: loginService,
  log: logEvent,
}

function useLoginFormInternal(deps: UseLoginFormDeps) {
  const [form, setForm] = useState<LoginFormState>(initialForm)
  const [session, setSession] = useState<SessionBootstrapState>(initialSession)
  const [facilities, setFacilities] = useState<FacilityOption[]>([])
  const [labAreas, setLabAreas] = useState<LabAreaOption[]>([])
  const [loadingLookups, setLoadingLookups] = useState(true)

  // Load facilities on mount
  useEffect(() => {
    deps.service.loadFacilities()
      .then(result => {
        setFacilities(result)
        deps.log('lookup_load', {})
      })
      .catch(() => {
        deps.log('lookup_load', { errorCode: 'FACILITY_LOAD_FAILED' })
      })
      .finally(() => setLoadingLookups(false))
  }, [deps])

  // Reload lab areas when facility changes
  useEffect(() => {
    if (!form.facilityId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLabAreas([])
      return
    }
    deps.service.loadLabAreas(form.facilityId)
      .then(result => {
        setLabAreas(result)
        // Reset labAreaId if current selection no longer valid
        setForm((prev: LoginFormState) => ({
          ...prev,
          labAreaId: result.some(a => a.id === prev.labAreaId) ? prev.labAreaId : '',
        }))
      })
      .catch(() => {
        deps.log('lookup_load', { facilityId: form.facilityId, errorCode: 'AREA_LOAD_FAILED' })
      })
  }, [deps, form.facilityId])

  const setField = useCallback(<K extends keyof LoginFormState>(
    field: K,
    value: LoginFormState[K],
  ) => {
    setForm((prev: LoginFormState) => {
      const next: LoginFormState = { ...prev, [field]: value, touched: { ...prev.touched, [field as string]: true } }
      next.errors = validateLoginForm(next)
      return next
    })
  }, [])

  const touchAll = useCallback(() => {
    setForm((prev: LoginFormState) => {
      const touched = REQUIRED_FIELDS.reduce<Record<string, boolean>>(
        (acc, f) => { acc[f] = true; return acc },
        {},
      )
      return { ...prev, touched, errors: validateLoginForm(prev) }
    })
  }, [])

  const isFormValid = useCallback((f: LoginFormState) => {
    const errs = validateLoginForm(f)
    return Object.keys(errs).length === 0
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Guard: no duplicate submits
    if (session.status === 'loading') return

    touchAll()
    if (!isFormValid(form)) return

    setSession({ status: 'loading', reauthRequired: false })
    deps.log('submit', {
      username: form.username,
      facilityId: form.facilityId,
      labAreaId: form.labAreaId,
    })

    try {
      const result = await deps.service.submitLogin({
        username: form.username,
        password: form.password,
        facilityId: form.facilityId,
        labAreaId: form.labAreaId,
        workDate: form.workDate,
      })

      if (result.success) {
        setSession({
          status: 'success',
          reauthRequired: result.session?.reauthRequired ?? false,
          sessionToken: result.session?.sessionToken,
          expiresAt: result.session?.expiresAt,
          facilityId: result.session?.facilityId,
          labAreaId: result.session?.labAreaId,
          workDate: result.session?.workDate,
          lastAttemptAt: new Date().toISOString(),
        })
        deps.log('submit_success', { username: form.username, facilityId: form.facilityId })
      } else {
        const msg = result.errors[0]?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.'
        setSession({
          status: 'error',
          message: msg,
          reauthRequired: false,
          lastAttemptAt: new Date().toISOString(),
        })
        deps.log('submit_error', {
          username: form.username,
          facilityId: form.facilityId,
          errorCode: result.errors[0]?.code,
        })
      }
    } catch {
      setSession({
        status: 'error',
        message: 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.',
        reauthRequired: false,
        lastAttemptAt: new Date().toISOString(),
      })
      deps.log('submit_error', {
        username: form.username,
        errorCode: 'NETWORK_ERROR',
      })
    }
  }, [deps, form, session.status, touchAll, isFormValid])

  const resetSessionForRelogin = useCallback((reason: string) => {
    setSession({
      status: 'error',
      message: reason,
      reauthRequired: true,
      lastAttemptAt: new Date().toISOString(),
    })
  }, [])

  const resetSessionForLogout = useCallback(() => {
    setSession(initialSession)
  }, [])

  return {
    form,
    session,
    facilities,
    labAreas,
    loadingLookups,
    setField,
    handleSubmit,
    resetSessionForRelogin,
    resetSessionForLogout,
  }
}

export function useLoginForm() {
  return useLoginFormInternal(defaultDeps)
}
