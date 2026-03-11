import { z } from 'zod'

const shippingMethodIds = ['free_shipping', 'express', 'pickup'] as const
const paymentMethodIds = ['card', 'bacs', 'paypal', 'klarna', 'wallet'] as const

export const checkoutShippingSchema = z.object({
  firstName: z.string().trim().min(2, 'Mindestens 2 Zeichen').max(100),
  lastName: z.string().trim().min(2, 'Mindestens 2 Zeichen').max(100),
  email: z.string().trim().email('Ungültige E-Mail'),
  phone: z.string().trim().min(8, 'Mindestens 8 Zeichen').regex(/^[+\d\s()-]+$/, 'Nur Ziffern und + - ( )'),
  address1: z.string().trim().min(3, 'Mindestens 3 Zeichen'),
  address2: z.string().trim().optional(),
  postcode: z.string().trim().min(4, 'Mindestens 4 Zeichen').max(12),
  city: z.string().trim().min(2, 'Mindestens 2 Zeichen'),
  country: z.string().trim().min(2, 'Land auswählen'),
  state: z.string().trim().optional(),
  shipToDifferentAddress: z.boolean().default(false),
  shippingFirstName: z.string().optional(),
  shippingLastName: z.string().optional(),
  shippingAddress1: z.string().optional(),
  shippingAddress2: z.string().optional(),
  shippingPostcode: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingState: z.string().optional(),
  shippingMethod: z.enum(shippingMethodIds),
})

export const checkoutPaymentSchema = z.object({
  paymentMethod: z.enum(paymentMethodIds),
})

export const checkoutFormSchema = checkoutShippingSchema.merge(checkoutPaymentSchema)

export type CheckoutShippingFormInput = z.input<typeof checkoutShippingSchema>
export type CheckoutShippingInput = z.infer<typeof checkoutShippingSchema>
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>
