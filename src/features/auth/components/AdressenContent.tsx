'use client'

import type { CustomerAccountData } from '@/features/auth/types/customer'
import { AddressEditForm } from './AddressEditForm'

interface AdressenContentProps {
  customer: CustomerAccountData
}

export function AdressenContent({ customer }: AdressenContentProps) {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
        Adressen
      </h1>
      <AddressEditForm
        type="billing"
        initial={customer.billing}
        title="Rechnungsadresse"
      />
      <AddressEditForm
        type="shipping"
        initial={customer.shipping}
        title="Lieferadresse"
      />
    </div>
  )
}
