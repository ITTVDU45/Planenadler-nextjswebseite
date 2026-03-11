'use client'

import { useState } from 'react'
import type { ContactFormValues } from '../types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  subject?: string
  message?: string
  privacy?: string
}

const initialValues: ContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  privacy: false,
  website: '',
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [submitError, setSubmitError] = useState<string>('')

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!values.firstName?.trim()) next.firstName = 'Vorname ist erforderlich.'
    if (!values.lastName?.trim()) next.lastName = 'Nachname ist erforderlich.'
    if (!values.email?.trim()) next.email = 'E-Mail ist erforderlich.'
    else if (!EMAIL_REGEX.test(values.email)) next.email = 'Bitte eine gültige E-Mail-Adresse eingeben.'
    if (!values.subject?.trim()) next.subject = 'Betreff ist erforderlich.'
    if (!values.message?.trim()) next.message = 'Nachricht ist erforderlich.'
    if (!values.privacy) next.privacy = 'Bitte stimmen Sie der Datenschutzerklärung zu.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitStatus('idle')
    setSubmitError('')
    if (!validate()) return

    setSubmitStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 429) {
          setSubmitError(data.error ?? 'Zu viele Anfragen. Bitte später erneut versuchen.')
        } else if (data.errors && typeof data.errors === 'object') {
          setErrors((prev) => ({ ...prev, ...data.errors }))
          setSubmitError('Bitte prüfen Sie Ihre Eingaben.')
        } else {
          setSubmitError(data.error ?? 'Beim Senden ist ein Fehler aufgetreten.')
        }
        setSubmitStatus('error')
        return
      }

      setValues(initialValues)
      setErrors({})
      setSubmitStatus('success')
    } catch {
      setSubmitError('Netzwerkfehler. Bitte später erneut versuchen.')
      setSubmitStatus('error')
    }
  }

  function update(field: keyof ContactFormValues, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FieldErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-firstName" className="block text-sm font-medium text-[#1F5CAB]">
            Vorname *
          </label>
          <input
            id="contact-firstName"
            type="text"
            value={values.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'contact-firstName-error' : undefined}
            className="mt-1 w-full rounded-lg border border-[#DBE9F9] bg-white px-4 py-3 text-[#1F5CAB] focus:border-[#3982DC] focus:outline-none focus:ring-2 focus:ring-[#3982DC]/30"
          />
          {errors.firstName && (
            <p id="contact-firstName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contact-lastName" className="block text-sm font-medium text-[#1F5CAB]">
            Nachname *
          </label>
          <input
            id="contact-lastName"
            type="text"
            value={values.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'contact-lastName-error' : undefined}
            className="mt-1 w-full rounded-lg border border-[#DBE9F9] bg-white px-4 py-3 text-[#1F5CAB] focus:border-[#3982DC] focus:outline-none focus:ring-2 focus:ring-[#3982DC]/30"
          />
          {errors.lastName && (
            <p id="contact-lastName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-[#1F5CAB]">
          E-Mail-Adresse *
        </label>
        <input
          id="contact-email"
          type="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className="mt-1 w-full rounded-lg border border-[#DBE9F9] bg-white px-4 py-3 text-[#1F5CAB] focus:border-[#3982DC] focus:outline-none focus:ring-2 focus:ring-[#3982DC]/30"
        />
        {errors.email && (
          <p id="contact-email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-[#1F5CAB]">
          Telefon (optional)
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={values.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#DBE9F9] bg-white px-4 py-3 text-[#1F5CAB] focus:border-[#3982DC] focus:outline-none focus:ring-2 focus:ring-[#3982DC]/30"
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-[#1F5CAB]">
          Betreff *
        </label>
        <input
          id="contact-subject"
          type="text"
          value={values.subject}
          onChange={(e) => update('subject', e.target.value)}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
          className="mt-1 w-full rounded-lg border border-[#DBE9F9] bg-white px-4 py-3 text-[#1F5CAB] focus:border-[#3982DC] focus:outline-none focus:ring-2 focus:ring-[#3982DC]/30"
        />
        {errors.subject && (
          <p id="contact-subject-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-[#1F5CAB]">
          Nachricht *
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className="mt-1 w-full resize-y rounded-lg border border-[#DBE9F9] bg-white px-4 py-3 text-[#1F5CAB] focus:border-[#3982DC] focus:outline-none focus:ring-2 focus:ring-[#3982DC]/30"
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update('website', e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="contact-privacy"
            type="checkbox"
            checked={values.privacy}
            onChange={(e) => update('privacy', e.target.checked)}
            aria-invalid={!!errors.privacy}
            aria-describedby={errors.privacy ? 'contact-privacy-error' : undefined}
            className="mt-1 h-4 w-4 rounded border-[#DBE9F9] text-[#1F5CAB] focus:ring-[#3982DC]"
          />
          <label htmlFor="contact-privacy" className="text-sm text-[#1F5CAB]/80">
            Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen gespeichert
            werden. Die Einwilligung kann jederzeit widerrufen werden. Weitere Informationen in der{' '}
            <a href="/datenschutz" className="underline hover:text-[#1F5CAB]">
              Datenschutzerklärung
            </a>
            . *
          </label>
        </div>
        {errors.privacy && (
          <p id="contact-privacy-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.privacy}
          </p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div
          className="rounded-lg border border-green-600/50 bg-green-50 p-4 text-sm text-green-800"
          role="status"
        >
          Vielen Dank. Ihre Nachricht wurde gesendet. Wir melden uns in Kürze.
        </div>
      )}
      {submitStatus === 'error' && submitError && (
        <div
          className="rounded-lg border border-red-600/50 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitStatus === 'loading'}
        className="w-full rounded-full bg-[#1F5CAB] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {submitStatus === 'loading' ? 'Wird gesendet …' : 'Nachricht senden'}
      </button>
    </form>
  )
}
