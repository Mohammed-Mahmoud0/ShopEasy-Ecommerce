import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useLanguage } from '../context/language'
import { useToast } from '../context/toast'
import { errorMessage } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/Icon'

export function LoginPage() {
  const { t } = useLanguage()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isAuthenticated } = useAuth()

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    password: '',
    email: '',
  })
  const [isSubmitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from || '/'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
        toast.success(t('auth.signedIn'))
      } else {
        await register({ name: form.name, email: form.email, password: form.password })
        toast.success(t('auth.accountCreated'))
      }
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="hidden lg:block">
        <div className="grid h-14 w-14 place-items-center rounded-2xl text-white [background:linear-gradient(135deg,var(--brand),var(--accent))]">
          <Icon name="bag" className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-app">
          {isLogin ? t('auth.welcome') : t('auth.createTitle')}
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted">
          {isLogin ? t('auth.welcomeHint') : t('auth.createHint')}
        </p>
        <ul className="mt-8 space-y-3">
          {[
            t('home.perkSecureBody'),
            t('home.perkFastBody'),
            t('home.perkFreshBody'),
          ].map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm text-muted">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[color-mix(in_srgb,var(--brand)_15%,transparent)] text-[var(--brand)]">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl app-surface p-6 sm:p-8">
        <div className="grid grid-cols-2 rounded-lg bg-[var(--bg-soft)] p-1">
          {[
            { id: 'login', label: t('auth.signIn') },
            { id: 'register', label: t('auth.register') },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                mode === tab.id
                  ? 'bg-[var(--bg-elevated)] text-app shadow-sm'
                  : 'text-muted'
              }`}
              onClick={() => setMode(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {!isLogin && <Field
            label={t('auth.name')}
            value={form.name}
            onChange={(value) => update('name', value)}
            required
            maxLength={100}
            autoComplete="name"
          />}
          <Field
            label={t('auth.email')}
            type="email"
            value={form.email}
            onChange={(value) => update('email', value)}
            required
            autoComplete="email"
          />

          <Field
            label={t('auth.password')}
            type="password"
            value={form.password}
            onChange={(value) => update('password', value)}
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting
              ? t('common.working')
              : isLogin
                ? t('auth.signIn')
                : t('auth.register')}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
          <button
            className="font-semibold text-[var(--brand)]"
            onClick={() => setMode(isLogin ? 'register' : 'login')}
            type="button"
          >
            {isLogin ? t('auth.register') : t('auth.signIn')}
          </button>
        </p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input
        className="app-input px-3 text-sm"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}
