import type { FacilityOption, LabAreaOption, LoginFormState, SessionBootstrapState } from '../types/login.types'
import '../styles/LoginForm.css'

interface LoginFormProps {
  form: LoginFormState
  session: SessionBootstrapState
  facilities: FacilityOption[]
  labAreas: LabAreaOption[]
  loadingLookups: boolean
  setField: <K extends keyof LoginFormState>(field: K, value: LoginFormState[K]) => void
  onSubmit: (e: React.FormEvent) => void
}

function FieldError({ field, errors, touched }: {
  field: string
  errors: Record<string, string>
  touched: Record<string, boolean>
}) {
  if (!touched[field] || !errors[field]) return null
  return <span className="lis-field-error" role="alert">{errors[field]}</span>
}

export function LoginForm({
  form,
  session,
  facilities,
  labAreas,
  loadingLookups,
  setField,
  onSubmit,
}: LoginFormProps) {
  const isLoading = session.status === 'loading'
  const isSuccess = session.status === 'success'
  const hasError = session.status === 'error'
  const submitDisabled = isLoading || isSuccess

  return (
    <div className="lis-login-card">
      <div className="lis-login-header">
        <h1 className="lis-login-title">Đăng nhập hệ thống</h1>
        <p className="lis-login-subtitle">LIS — Hệ thống Thông tin Xét nghiệm</p>
      </div>

      {isSuccess && (
        <div className="lis-status-banner lis-status-success" role="status">
          Đăng nhập thành công. Đang khởi động hệ thống…
        </div>
      )}

      {hasError && session.message && (
        <div className="lis-status-banner lis-status-error" role="alert">
          {session.message}
        </div>
      )}

      <form className="lis-login-form" onSubmit={onSubmit} noValidate>

        {/* Username */}
        <div className="lis-field-group">
          <label htmlFor="lis-username" className="lis-label">
            Tên đăng nhập <span className="lis-required">*</span>
          </label>
          <input
            id="lis-username"
            type="text"
            className={`lis-input${form.touched.username && form.errors.username ? ' lis-input-error' : ''}`}
            value={form.username}
            onChange={e => setField('username', e.target.value)}
            autoComplete="username"
            disabled={isLoading || isSuccess}
            placeholder="Nhập tên đăng nhập"
          />
          <FieldError field="username" errors={form.errors} touched={form.touched} />
        </div>

        {/* Password */}
        <div className="lis-field-group">
          <label htmlFor="lis-password" className="lis-label">
            Mật khẩu <span className="lis-required">*</span>
          </label>
          <input
            id="lis-password"
            type="password"
            className={`lis-input${form.touched.password && form.errors.password ? ' lis-input-error' : ''}`}
            value={form.password}
            onChange={e => setField('password', e.target.value)}
            autoComplete="current-password"
            disabled={isLoading || isSuccess}
            placeholder="Nhập mật khẩu"
          />
          <FieldError field="password" errors={form.errors} touched={form.touched} />
        </div>

        {/* Cơ sở */}
        <div className="lis-field-group">
          <label htmlFor="lis-coso" className="lis-label">
            Cơ sở <span className="lis-required">*</span>
          </label>
          <select
            id="lis-coso"
            className={`lis-select${form.touched.facilityId && form.errors.facilityId ? ' lis-input-error' : ''}`}
            value={form.facilityId}
            onChange={e => setField('facilityId', e.target.value)}
            disabled={isLoading || isSuccess || loadingLookups}
          >
            <option value="">
              {loadingLookups ? 'Đang tải…' : '-- Chọn cơ sở --'}
            </option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <FieldError field="facilityId" errors={form.errors} touched={form.touched} />
        </div>

        {/* Khu XN */}
        <div className="lis-field-group">
          <label htmlFor="lis-khuxn" className="lis-label">
            Khu xét nghiệm <span className="lis-required">*</span>
          </label>
          <select
            id="lis-khuxn"
            className={`lis-select${form.touched.labAreaId && form.errors.labAreaId ? ' lis-input-error' : ''}`}
            value={form.labAreaId}
            onChange={e => setField('labAreaId', e.target.value)}
            disabled={isLoading || isSuccess || !form.facilityId}
          >
            <option value="">
              {!form.facilityId ? '-- Chọn cơ sở trước --' : '-- Chọn khu xét nghiệm --'}
            </option>
            {labAreas.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <FieldError field="labAreaId" errors={form.errors} touched={form.touched} />
        </div>

        {/* Ngày làm việc */}
        <div className="lis-field-group">
          <label htmlFor="lis-workdate" className="lis-label">
            Ngày làm việc <span className="lis-required">*</span>
          </label>
          <input
            id="lis-workdate"
            type="date"
            className={`lis-input${form.touched.workDate && form.errors.workDate ? ' lis-input-error' : ''}`}
            value={form.workDate}
            onChange={e => setField('workDate', e.target.value)}
            disabled={isLoading || isSuccess}
          />
          <FieldError field="workDate" errors={form.errors} touched={form.touched} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="lis-submit-btn"
          disabled={submitDisabled}
        >
          {isLoading
            ? <><span className="lis-spinner" aria-hidden="true" /> Đang đăng nhập…</>
            : 'Đăng nhập'}
        </button>

      </form>
    </div>
  )
}
