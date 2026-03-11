'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { UPDATE_CUSTOMER } from '@/shared/lib/GQL_MUTATIONS'
import type { CustomerAddress } from '@/features/auth/types/customer'

type AddressType = 'billing' | 'shipping'

interface AddressEditFormProps {
  type: AddressType
  initial?: CustomerAddress | null
  title: string
}

interface AddressInput {
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  city: string
  state: string
  postcode: string
  country: string
  phone: string
  email: string
}

const emptyAddress: AddressInput = {
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'DE',
  phone: '',
  email: '',
}

function toInput(addr: CustomerAddress | null | undefined): AddressInput {
  if (!addr) return { ...emptyAddress }
  return {
    firstName: addr.firstName ?? '',
    lastName: addr.lastName ?? '',
    company: addr.company ?? '',
    address1: addr.address1 ?? '',
    address2: addr.address2 ?? '',
    city: addr.city ?? '',
    state: addr.state ?? '',
    postcode: addr.postcode ?? '',
    country: addr.country ?? 'DE',
    phone: addr.phone ?? '',
    email: (addr as CustomerAddress & { email?: string }).email ?? '',
  }
}

const inputClass =
  'w-full rounded-lg border-2 border-[#DBE9F9] bg-white px-4 py-2.5 text-[#1F5CAB] placeholder:text-[#1F5CAB]/50 focus:border-[#1F5CAB] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB]/20'

export function AddressEditForm({ type, initial, title }: AddressEditFormProps) {
  const [formData, setFormData] = useState(toInput(initial))
  const [updateCustomer, { loading, error, data }] = useMutation(UPDATE_CUSTOMER, {
    errorPolicy: 'all',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const input: Record<string, unknown> = {}
    if (type === 'billing') {
      input.billing = formData
    } else {
      input.shipping = { ...formData, email: undefined }
    }
    await updateCustomer({ variables: { input } })
  }

  const success = data?.updateCustomer?.customer != null

  return (
    <section className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6" aria-labelledby={`${type}-heading`}>
      <h2 id={`${type}-heading`} className="text-lg font-semibold text-[#1F5CAB]">
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${type}-firstName`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Vorname
          </label>
          <input
            id={`${type}-firstName`}
            type="text"
            className={inputClass}
            value={formData.firstName ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor={`${type}-lastName`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Nachname
          </label>
          <input
            id={`${type}-lastName`}
            type="text"
            className={inputClass}
            value={formData.lastName ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${type}-company`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Firma
          </label>
          <input
            id={`${type}-company`}
            type="text"
            className={inputClass}
            value={formData.company ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${type}-address1`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Adresse
          </label>
          <input
            id={`${type}-address1`}
            type="text"
            className={inputClass}
            value={formData.address1 ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, address1: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${type}-address2`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Adresse 2
          </label>
          <input
            id={`${type}-address2`}
            type="text"
            className={inputClass}
            value={formData.address2 ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, address2: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor={`${type}-postcode`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            PLZ
          </label>
          <input
            id={`${type}-postcode`}
            type="text"
            className={inputClass}
            value={formData.postcode ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, postcode: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor={`${type}-city`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Ort
          </label>
          <input
            id={`${type}-city`}
            type="text"
            className={inputClass}
            value={formData.city ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor={`${type}-country`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Land
          </label>
          <input
            id={`${type}-country`}
            type="text"
            className={inputClass}
            value={formData.country ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor={`${type}-state`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Bundesland / Region
          </label>
          <input
            id={`${type}-state`}
            type="text"
            className={inputClass}
            value={formData.state ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor={`${type}-phone`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
            Telefon
          </label>
          <input
            id={`${type}-phone`}
            type="tel"
            className={inputClass}
            value={formData.phone ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        {type === 'billing' && (
          <div>
            <label htmlFor={`${type}-email`} className="mb-1 block text-sm font-medium text-[#1F5CAB]">
              E-Mail
            </label>
            <input
              id={`${type}-email`}
              type="email"
              className={inputClass}
              value={formData.email ?? ''}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
        )}
        {error && (
          <p className="sm:col-span-2 text-sm text-red-600">
            {error.message}
          </p>
        )}
        {success && (
          <p className="sm:col-span-2 text-sm text-green-600">
            Adresse wurde gespeichert.
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
  )
}
