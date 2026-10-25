import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { Spinner } from '../components/ui/Spinner'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingUser } = useAuth()
  const location = useLocation()

  if (isLoadingUser) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-[var(--brand)]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
