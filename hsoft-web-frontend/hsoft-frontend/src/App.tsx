import './App.css'
import { useLoginForm } from './features/login/hooks/useLoginForm'
import { LoginForm } from './features/login/components/LoginForm'
import { MainScreenPage } from './features/main-screen'
import { AddPatientForm } from './features/patient-intake'
import { TestOrderPage } from './features/test-order'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SampleCollectionPage } from './features/sample-collection';

function App() {
  const loginProps = useLoginForm()
  const { session } = loginProps
  const isAuthenticated = session.status === 'success' && !!session.sessionToken

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/main-screen" replace />
          ) : (
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
      />
      <Route
        path="/main-screen"
        element={
          isAuthenticated ? (
            <div className="lis-page lis-page-main">
              <MainScreenPage
                sessionToken={session.sessionToken}
                onRequireRelogin={(reason) => loginProps.resetSessionForRelogin(reason)}
                onLogout={() => loginProps.resetSessionForLogout()}
              />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/patient-intake"
        element={
          isAuthenticated ? (
            <div className="lis-page lis-page-main">
              <AddPatientForm sessionToken={session.sessionToken} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/test-order"
        element={
          isAuthenticated ? (
            <div className="lis-page lis-page-main">
              <TestOrderPage />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/sample-collection"
        element={
          isAuthenticated ? (
            <div className="lis-page lis-page-main">
              <SampleCollectionPage />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/main-screen' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
