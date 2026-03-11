'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { UPDATE_CUSTOMER } from '@/shared/lib/GQL_MUTATIONS'
import type { CustomerAccountData } from '@/features/auth/types/customer'

interface KontodetailsFormProps {
  customer: CustomerAccountData
}

const inputClass =
  'w-full rounded-lg border-2 border-[#DBE9F9] bg-white px-4 py-2.5 text-[#1F5CAB] placeholder:text-[#1F5CAB]/50 focus:border-[#1F5CAB] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB]/20'

export function KontodetailsForm({ customer }: KontodetailsFormProps) {
  const [firstName, setFirstName] = useState(customer.firstName ?? '')
  const [lastName, setLastName] = useState(customer.lastName ?? '')
  const [email, setEmail] = useState(customer.email ?? '')
  const [displayName, setDisplayName] = useState(customer.displayName ?? '')
  const [updateCustomer, { loading, error, data }] = useMutation(UPDATE_CUSTOMER, {
    errorPolicy: 'all',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateCustomer({
      variables: {
        input: {
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          email: email.trim() || null,
          displayName: displayName.trim() || null,
        },
      },
    })
  }

  const success = data?.updateCustomer?.customer != null

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
        Kontodetails
      </h1>

      <section className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6" aria-labelledby="details-heading">
        <h2 id="details-heading" className="text-lg font-semibold text-[#1F5CAB]">
          Persönliche Daten
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="kontodetails-firstName" className="mb-1 block text-sm font-medium text-[#1F5CAB]">
              Vorname
            </label>
            <input
              id="kontodetails-firstName"
              type="text"
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="kontodetails-lastName" className="mb-1 block text-sm font-medium text-[#1F5CAB]">
              Nachname
            </label>
            <input
              id="kontodetails-lastName"
              type="text"
              className={inputClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="kontodetails-email" className="mb-1 block text-sm font-medium text-[#1F5CAB]">
              E-Mail
            </label>
            <input
              id="kontodetails-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="kontodetails-displayName" className="mb-1 block text-sm font-medium text-[#1F5CAB]">
              Anzeigename
            </label>
            <input
              id="kontodetails-displayName"
              type="text"
              className={inputClass}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-[#1F5CAB]/70">
              Benutzername: <span className="font-medium text-[#1F5CAB]">{customer.username ?? '–'}</span> (nicht änderbar)
            </p>
          </div>
          {error && (
            <p className="sm:col-span-2 text-sm text-red-600">
              {error.message}
            </p>
          )}
          {success && (
            <p className="sm:col-span-2 text-sm text-green-600">
              Kontodaten wurden gespeichert.
            </p>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#1F5CAB] px-6 py-2.5 font-semibold text-white transition hover:bg-[#1a4d8c] disabled:opacity-60"
            >
              {loading ? 'Wird gespeichert…' : 'Speichern'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
