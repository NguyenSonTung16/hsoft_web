import './App.css'
import { useLoginForm } from './features/login/hooks/useLoginForm'
import { LoginForm } from './features/login/components/LoginForm'

function App() {
  const loginProps = useLoginForm()
  const { session } = loginProps

  if (session.status === 'success') {
    return (
      <div className="lis-page">
        <div className="lis-authenticated-placeholder">
          <h2>Chào mừng bạn đã đăng nhập!</h2>
          <p>Phiên làm việc đang được khởi động…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lis-page">
      <LoginForm
        form={loginProps.form}
        session={loginProps.session}
        facilities={loginProps.facilities}
        labAreas={loginProps.labAreas}
        loadingLookups={loginProps.loadingLookups}
        setField={loginProps.setField}
        onSubmit={loginProps.handleSubmit}
      />
    </div>
  )
}

export default App
