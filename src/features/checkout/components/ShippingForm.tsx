'use client'

import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCheckoutStore } from '../store/checkout.store'
import { useCartStore } from '@/shared/lib/cartStore'
import { decodePriceDisplay, getEffectiveShippingTotal } from '@/shared/lib/functions'
import {
  checkoutShippingSchema,
  type CheckoutShippingFormInput,
  type CheckoutShippingInput,
} from '../lib/checkoutSchema'
import { SHIPPING_METHOD_IDS } from '../types/checkout.types'

const DEFAULT_VALUES: CheckoutShippingFormInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  postcode: '',
  city: '',
  country: 'DE',
  state: '',
  shipToDifferentAddress: false,
  shippingFirstName: '',
  shippingLastName: '',
  shippingAddress1: '',
  shippingAddress2: '',
  shippingPostcode: '',
  shippingCity: '',
  shippingCountry: 'DE',
  shippingState: '',
  shippingMethod: SHIPPING_METHOD_IDS.FREE,
}

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  id: keyof CheckoutShippingFormInput
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, id, type = 'text', required, autoComplete, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#1F5CAB]">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        id={id}
        ref={ref}
        type={type}
        autoComplete={autoComplete}
        className="rounded-lg border-2 border-[#DBE9F9] bg-white px-4 py-2.5 text-[#1F5CAB] placeholder:text-[#1F5CAB]/50 focus:border-[#1F5CAB] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB]/20"
        {...rest}
      />
    </div>
  )
})

interface ShippingFormProps {
  onValidSubmit?: (data: CheckoutShippingInput) => void
  /** If set, a submit button with this label is rendered inside the form (e.g. "Weiter zur Zahlung") */
  submitLabel?: string
  /** Vorausgefüllte Daten z. B. aus dem Checkout-Store (nach Zurück-Navigation oder Persist) */
  initialData?: CheckoutShippingFormInput | null
}

export function ShippingForm({ onValidSubmit, submitLabel, initialData }: ShippingFormProps) {
  const setSelectedShipping = useCheckoutStore((s) => s.setSelectedShipping)
  const cartTotals = useCartStore((s) => s.cart?.totals ?? null)
  const appliedInitialRef = useRef(false)

  const methods = useForm<CheckoutShippingFormInput, unknown, CheckoutShippingInput>({
    resolver: zodResolver(checkoutShippingSchema),
    defaultValues: initialData ?? DEFAULT_VALUES,
    mode: 'onBlur',
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = methods

  const shipToDifferentAddress = watch('shipToDifferentAddress')
  const shippingMethod = watch('shippingMethod')

  useEffect(() => {
    setSelectedShipping(shippingMethod)
  }, [shippingMethod, setSelectedShipping])

  // isDirty in Ref halten, damit die Dependency-Liste konstant bleibt (React-Regel: gleiche Array-Länge).
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  // Nur beim ersten Mount mit gespeicherten Daten füllen – nicht wenn später z. B. Persist rehydriert (sonst gehen Eingaben verloren).
  useEffect(() => {
    if (!initialData || appliedInitialRef.current || isDirtyRef.current) return
    reset(initialData)
    appliedInitialRef.current = true
  }, [initialData, reset])

  const onFormSubmit = handleSubmit((data) => {
    reset(data)
    onValidSubmit?.(data)
  })

  return (
    <FormProvider {...methods}>
      <form
        id="checkout-form"
        onSubmit={onFormSubmit}
        className="space-y-6 rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6"
      >
        <h2 className="text-lg font-bold text-[#1F5CAB]">Kundendaten &amp; Adresse</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormInput
              label="Vorname"
              id="firstName"
              required
              autoComplete="given-name"
              {...register('firstName')}
            />
            {errors.firstName ? (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            ) : null}
          </div>
          <div>
            <FormInput
              label="Nachname"
              id="lastName"
              required
              autoComplete="family-name"
              {...register('lastName')}
            />
            {errors.lastName ? (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <FormInput
            label="E-Mail"
            id="email"
            type="email"
            required
            autoComplete="email"
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <FormInput
            label="Telefonnummer"
            id="phone"
            type="tel"
            required
            autoComplete="tel"
            {...register('phone')}
          />
          {errors.phone ? (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          ) : null}
        </div>

        <hr className="border-[#DBE9F9]" />
        <h3 className="text-sm font-semibold text-[#1F5CAB]">Rechnungsadresse</h3>

        <div>
          <FormInput
            label="Straße und Hausnummer"
            id="address1"
            required
            autoComplete="street-address"
            {...register('address1')}
          />
          {errors.address1 ? (
            <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
          ) : null}
        </div>

        <div>
          <FormInput
            label="Adresszusatz"
            id="address2"
            autoComplete="address-line2"
            {...register('address2')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormInput
              label="PLZ"
              id="postcode"
              required
              autoComplete="postal-code"
              {...register('postcode')}
            />
            {errors.postcode ? (
              <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>
            ) : null}
          </div>
          <div>
            <FormInput
              label="Stadt"
              id="city"
              required
              autoComplete="address-level2"
              {...register('city')}
            />
            {errors.city ? (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className="text-sm font-medium text-[#1F5CAB]">
              Land <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              className="mt-1.5 w-full rounded-lg border-2 border-[#DBE9F9] bg-white px-4 py-2.5 text-[#1F5CAB] focus:border-[#1F5CAB] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB]/20"
              autoComplete="country"
              {...register('country')}
            >
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
            </select>
            {errors.country ? (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            ) : null}
          </div>
          <div>
            <FormInput
              label="Bundesland"
              id="state"
              autoComplete="address-level1"
              {...register('state')}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="shipToDifferentAddress"
            className="h-4 w-4 rounded border-[#DBE9F9] text-[#1F5CAB] focus:ring-[#1F5CAB]"
            {...register('shipToDifferentAddress')}
          />
          <label htmlFor="shipToDifferentAddress" className="text-sm font-medium text-[#1F5CAB]">
            Lieferadresse weicht von der Rechnungsadresse ab
          </label>
        </div>

        {shipToDifferentAddress ? (
          <div className="space-y-4 rounded-xl border border-[#DBE9F9] bg-white p-4">
            <h3 className="text-sm font-semibold text-[#1F5CAB]">Lieferadresse</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Vorname"
                id="shippingFirstName"
                autoComplete="shipping given-name"
                {...register('shippingFirstName')}
              />
              <FormInput
                label="Nachname"
                id="shippingLastName"
                autoComplete="shipping family-name"
                {...register('shippingLastName')}
              />
            </div>
            <FormInput
              label="Straße und Hausnummer"
              id="shippingAddress1"
              autoComplete="shipping street-address"
              {...register('shippingAddress1')}
            />
            <FormInput
              label="Adresszusatz"
              id="shippingAddress2"
              autoComplete="shipping address-line2"
              {...register('shippingAddress2')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="PLZ"
                id="shippingPostcode"
                autoComplete="shipping postal-code"
                {...register('shippingPostcode')}
              />
              <FormInput
                label="Stadt"
                id="shippingCity"
                autoComplete="shipping address-level2"
                {...register('shippingCity')}
              />
            </div>
            <div>
              <label htmlFor="shippingCountry" className="text-sm font-medium text-[#1F5CAB]">
                Land
              </label>
              <select
                id="shippingCountry"
                className="mt-1.5 w-full rounded-lg border-2 border-[#DBE9F9] bg-white px-4 py-2.5 text-[#1F5CAB] focus:border-[#1F5CAB] focus:outline-none"
                autoComplete="shipping country"
                {...register('shippingCountry')}
              >
                <option value="DE">Deutschland</option>
                <option value="AT">Österreich</option>
                <option value="CH">Schweiz</option>
              </select>
            </div>
          </div>
        ) : null}

        <input type="hidden" {...register('shippingMethod')} />

        <hr className="border-[#DBE9F9]" />
        <div className="rounded-xl border border-[#DBE9F9] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#1F5CAB]">Versand</h3>
          <p className="mt-2 text-sm text-[#1F5CAB]/80">
            Die Versandkosten werden automatisch aus Gewicht und Flaeche Ihrer Konfiguration berechnet.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-[#1F5CAB]/80">
            <li>Unter 30 kg: 9,00 €</li>
            <li>Ab 30 kg: 80,00 €</li>
            <li>Bis 34 m² pro Paket: 9,00 € je Paketstufe</li>
          </ul>
          <p className="mt-3 text-sm font-semibold text-[#1F5CAB]">
            Aktueller Versand: {cartTotals ? decodePriceDisplay(getEffectiveShippingTotal(cartTotals)) : 'wird automatisch berechnet'}
          </p>
        </div>
        {submitLabel ? (
          <div className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2 lg:w-auto lg:min-w-[200px]"
            >
              {submitLabel}
            </button>
          </div>
        ) : null}
      </form>
    </FormProvider>
  )
}
