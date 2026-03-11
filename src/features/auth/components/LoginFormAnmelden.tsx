'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  login,
  registerAccount,
  resetPasswordWithKey,
  sendPasswordResetEmail,
} from '@/utils/auth'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

type Notice = {
  type: 'success' | 'error'
  message: string
}

interface LoginData {
  username: string
  password: string
}

interface RegisterData {
  email: string
}

interface ForgotData {
  username: string
}

interface ResetData {
  login: string
  key: string
  password: string
  confirmPassword: string
}

const inputClass =
  'h-12 w-full rounded-xl border border-[#bdd7f9] bg-white px-4 text-sm text-[#123a6a] placeholder:text-[#7d9ec8] outline-none transition focus:border-[#1F5CAB] focus:ring-4 focus:ring-[#1F5CAB]/20'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#2f5f9a]'

export function LoginFormAnmelden() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const keyFromUrl = searchParams?.get('key') ?? ''
  const loginFromUrl = searchParams?.get('login') ?? searchParams?.get('id') ?? ''
  const hasResetParams = Boolean(keyFromUrl && loginFromUrl)

  const initialMode = useMemo<AuthMode>(() => (hasResetParams ? 'reset' : 'login'), [hasResetParams])
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [submittingMode, setSubmittingMode] = useState<AuthMode | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [showLogoutToast, setShowLogoutToast] = useState(false)

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<LoginData>({
    defaultValues: {
      username: loginFromUrl,
      password: '',
    },
  })

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterData>()

  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotData>({
    defaultValues: {
      username: loginFromUrl,
    },
  })

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetData>({
    defaultValues: {
      login: loginFromUrl,
      key: keyFromUrl,
      password: '',
      confirmPassword: '',
    },
  })

  const setModeWithReset = (nextMode: AuthMode) => {
    setNotice(null)
    setMode(nextMode)
  }

  useEffect(() => {
    if (searchParams?.get('logout') !== 'success') return

    setShowLogoutToast(true)

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('logout')
    const nextUrl = nextParams.toString() ? `/anmelden?${nextParams}` : '/anmelden'
    router.replace(nextUrl)

    const timer = window.setTimeout(() => {
      setShowLogoutToast(false)
    }, 3800)

    return () => window.clearTimeout(timer)
  }, [router, searchParams])

  const onLogin = async (data: LoginData) => {
    setNotice(null)
    setSubmittingMode('login')
    try {
      const result = await login(data.username, data.password)
      if (result.success && result.status === 'SUCCESS') {
        router.push('/mein-konto')
        return
      }
      throw new Error('Anmeldung fehlgeschlagen.')
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.',
      })
    } finally {
      setSubmittingMode(null)
    }
  }

  const onRegister = async (data: RegisterData) => {
    setNotice(null)

    setSubmittingMode('register')
    try {
      const result = await registerAccount({ email: data.email })

      if (result.loggedIn) {
        router.push('/mein-konto')
        return
      }

      setMode('login')
      setNotice({
        type: 'success',
        message:
          result.message ||
          'Registrierung erfolgreich. Bitte pruefen Sie Ihre E-Mails und melden Sie sich dann an.',
      })
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.',
      })
    } finally {
      setSubmittingMode(null)
    }
  }

  const onForgot = async (data: ForgotData) => {
    setNotice(null)
    setSubmittingMode('forgot')
    try {
      await sendPasswordResetEmail(data.username)
      setNotice({
        type: 'success',
        message:
          'Wenn ein Konto existiert, wurde eine Passwort-Reset-E-Mail versendet. Bitte Postfach pruefen.',
      })
      setMode('reset')
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Passwort-Reset konnte nicht gestartet werden.',
      })
    } finally {
      setSubmittingMode(null)
    }
  }

  const onReset = async (data: ResetData) => {
    setNotice(null)
    if (data.password !== data.confirmPassword) {
      setNotice({ type: 'error', message: 'Die Passwoerter stimmen nicht ueberein.' })
      return
    }

    setSubmittingMode('reset')
    try {
      await resetPasswordWithKey({
        login: data.login,
        key: data.key,
        password: data.password,
      })
      setLoginValue('username', data.login)
      setMode('login')
      setNotice({
        type: 'success',
        message: 'Passwort wurde erfolgreich aktualisiert. Bitte jetzt anmelden.',
      })
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Passwort konnte nicht zurueckgesetzt werden.',
      })
    } finally {
      setSubmittingMode(null)
    }
  }

  return (
    <section aria-label="Anmeldung" className="w-full">
      {showLogoutToast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-4 top-4 z-[700] w-[min(92vw,380px)] rounded-xl border border-[#9dc2ef] bg-white px-4 py-3 shadow-[0_16px_40px_-16px_rgba(31,92,171,0.5)]"
        >
          <p className="text-sm font-semibold text-[#1F5CAB]">Erfolgreich abgemeldet</p>
          <p className="mt-1 text-xs text-[#3d699f]">Sie wurden sicher aus Ihrem Konto ausgeloggt.</p>
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-xl bg-[#eaf2ff] p-1.5">
        <button
          type="button"
          onClick={() => setModeWithReset('login')}
          className={`h-10 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] transition ${
            mode === 'login'
              ? 'bg-[#1F5CAB] text-white shadow-sm'
              : 'bg-transparent text-[#3c6498] hover:bg-white/80'
          }`}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => setModeWithReset('register')}
          className={`h-10 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] transition ${
            mode === 'register'
              ? 'bg-[#1F5CAB] text-white shadow-sm'
              : 'bg-transparent text-[#3c6498] hover:bg-white/80'
          }`}
        >
          Registrieren
        </button>
        <button
          type="button"
          onClick={() => setModeWithReset('forgot')}
          className={`h-10 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] transition ${
            mode === 'forgot' || mode === 'reset'
              ? 'bg-[#1F5CAB] text-white shadow-sm'
              : 'bg-transparent text-[#3c6498] hover:bg-white/80'
          }`}
        >
          Passwort vergessen
        </button>
      </div>

      {notice ? (
        <p
          className={`mb-4 rounded-xl border px-3 py-2 text-sm ${
            notice.type === 'success'
              ? 'border-[#b7d4fa] bg-[#edf6ff] text-[#1f5cab]'
              : 'border-[#f2c5bf] bg-[#fff3f1] text-[#9f3023]'
          }`}
        >
          {notice.message}
        </p>
      ) : null}

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
          <div>
            <label htmlFor="username" className={labelClass}>
              Benutzername oder E-Mail
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              aria-invalid={loginErrors.username ? 'true' : 'false'}
              className={inputClass}
              placeholder="name@beispiel.de"
              {...loginRegister('username', { required: 'Bitte Benutzername oder E-Mail eingeben.' })}
            />
            {loginErrors.username ? (
              <p className="mt-1.5 text-xs text-[#a53d2d]">{loginErrors.username.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Passwort
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={loginErrors.password ? 'true' : 'false'}
              className={inputClass}
              placeholder="Ihr Passwort"
              {...loginRegister('password', { required: 'Bitte Passwort eingeben.' })}
            />
            {loginErrors.password ? (
              <p className="mt-1.5 text-xs text-[#a53d2d]">{loginErrors.password.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-[#3d699f]">
            <button type="button" onClick={() => setModeWithReset('forgot')} className="hover:underline">
              Passwort vergessen?
            </button>
            <button type="button" onClick={() => setModeWithReset('register')} className="hover:underline">
              Kein Konto?
            </button>
          </div>

          <button
            type="submit"
            disabled={submittingMode === 'login'}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#1F5CAB] px-5 text-sm font-semibold text-white transition hover:bg-[#1a4f95] focus:outline-none focus:ring-4 focus:ring-[#1F5CAB]/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submittingMode === 'login' ? 'Anmeldung laeuft ...' : 'Anmelden'}
          </button>
        </form>
      ) : null}

      {mode === 'register' ? (
        <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
          <p className="text-sm text-[#3d699f]">
            Ein Link zum Erstellen eines neuen Passworts wird an Ihre E-Mail-Adresse gesendet.
          </p>

          <div>
            <label htmlFor="registerEmail" className={labelClass}>
              E-Mail
            </label>
            <input
              id="registerEmail"
              type="email"
              className={inputClass}
              placeholder="name@beispiel.de"
              {...registerRegister('email', { required: 'Bitte E-Mail eingeben.' })}
            />
            {registerErrors.email ? (
              <p className="mt-1.5 text-xs text-[#a53d2d]">{registerErrors.email.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submittingMode === 'register'}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#1F5CAB] px-5 text-sm font-semibold text-white transition hover:bg-[#1a4f95] focus:outline-none focus:ring-4 focus:ring-[#1F5CAB]/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submittingMode === 'register' ? 'Registrierung laeuft ...' : 'Registrieren'}
          </button>
        </form>
      ) : null}

      {mode === 'forgot' ? (
        <form onSubmit={handleForgotSubmit(onForgot)} className="space-y-4">
          <p className="text-sm text-[#3d699f]">
            Geben Sie Ihre E-Mail oder Ihren Benutzernamen ein. Wir senden Ihnen einen Link zum Zuruecksetzen.
          </p>

          <div>
            <label htmlFor="forgotUsername" className={labelClass}>
              E-Mail oder Benutzername
            </label>
            <input
              id="forgotUsername"
              type="text"
              className={inputClass}
              placeholder="name@beispiel.de"
              {...forgotRegister('username', { required: 'Bitte E-Mail oder Benutzername eingeben.' })}
            />
            {forgotErrors.username ? (
              <p className="mt-1.5 text-xs text-[#a53d2d]">{forgotErrors.username.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-[#3d699f]">
            <button type="button" onClick={() => setModeWithReset('login')} className="hover:underline">
              Zurueck zur Anmeldung
            </button>
            <button type="button" onClick={() => setModeWithReset('reset')} className="hover:underline">
              Ich habe schon einen Code
            </button>
          </div>

          <button
            type="submit"
            disabled={submittingMode === 'forgot'}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#1F5CAB] px-5 text-sm font-semibold text-white transition hover:bg-[#1a4f95] focus:outline-none focus:ring-4 focus:ring-[#1F5CAB]/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submittingMode === 'forgot' ? 'Wird gesendet ...' : 'Reset-E-Mail senden'}
          </button>
        </form>
      ) : null}

      {mode === 'reset' ? (
        <form onSubmit={handleResetSubmit(onReset)} className="space-y-4">
          <p className="text-sm text-[#3d699f]">
            Setzen Sie Ihr Passwort mit Login und Reset-Key zurueck.
          </p>

          <div>
            <label htmlFor="resetLogin" className={labelClass}>
              Login
            </label>
            <input
              id="resetLogin"
              type="text"
              readOnly={Boolean(loginFromUrl)}
              className={inputClass}
              placeholder="Benutzername"
              {...resetRegister('login', { required: 'Login ist erforderlich.' })}
            />
            {resetErrors.login ? (
              <p className="mt-1.5 text-xs text-[#a53d2d]">{resetErrors.login.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="resetKey" className={labelClass}>
              Reset-Key
            </label>
            <input
              id="resetKey"
              type="text"
              readOnly={Boolean(keyFromUrl)}
              className={inputClass}
              placeholder="Key aus E-Mail"
              {...resetRegister('key', { required: 'Reset-Key ist erforderlich.' })}
            />
            {resetErrors.key ? (
              <p className="mt-1.5 text-xs text-[#a53d2d]">{resetErrors.key.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="resetPassword" className={labelClass}>
                Neues Passwort
              </label>
              <input
                id="resetPassword"
                type="password"
                className={inputClass}
                placeholder="Mind. 8 Zeichen"
                {...resetRegister('password', {
                  required: 'Neues Passwort ist erforderlich.',
                  minLength: { value: 8, message: 'Passwort muss mindestens 8 Zeichen haben.' },
                })}
              />
              {resetErrors.password ? (
                <p className="mt-1.5 text-xs text-[#a53d2d]">{resetErrors.password.message}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="resetConfirmPassword" className={labelClass}>
                Passwort wiederholen
              </label>
              <input
                id="resetConfirmPassword"
                type="password"
                className={inputClass}
                placeholder="Passwort bestaetigen"
                {...resetRegister('confirmPassword', { required: 'Bitte Passwort bestaetigen.' })}
              />
              {resetErrors.confirmPassword ? (
                <p className="mt-1.5 text-xs text-[#a53d2d]">{resetErrors.confirmPassword.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#3d699f]">
            <button type="button" onClick={() => setModeWithReset('forgot')} className="hover:underline">
              Reset-E-Mail erneut anfordern
            </button>
            <button type="button" onClick={() => setModeWithReset('login')} className="hover:underline">
              Zurueck zur Anmeldung
            </button>
          </div>

          <button
            type="submit"
            disabled={submittingMode === 'reset'}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#1F5CAB] px-5 text-sm font-semibold text-white transition hover:bg-[#1a4f95] focus:outline-none focus:ring-4 focus:ring-[#1F5CAB]/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submittingMode === 'reset' ? 'Passwort wird gesetzt ...' : 'Passwort zuruecksetzen'}
          </button>
        </form>
      ) : null}
    </section>
  )
}
