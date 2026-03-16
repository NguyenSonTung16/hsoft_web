import './App.css'
import { useLoginForm } from './features/login/hooks/useLoginForm'
import { LoginForm } from './features/login/components/LoginForm'
import { MainScreenPage } from './features/main-screen'

function App() {
  const loginProps = useLoginForm()
  const { session } = loginProps

  if (session.status === 'success' && session.sessionToken) {
    return (
      <div className="lis-page lis-page-main">
        <MainScreenPage
          sessionToken={session.sessionToken}
          onRequireRelogin={(reason) => loginProps.resetSessionForRelogin(reason)}
        />
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
