import type { Metadata } from 'next'
import { Suspense } from 'react'
import Image from 'next/image'
import { LoginFormAnmelden } from '@/features/auth/components/LoginFormAnmelden'
import { NOINDEX_ROBOTS, absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Anmelden | Planenadler',
  description: 'Melden Sie sich in Ihrem Kundenkonto an.',
  alternates: {
    canonical: absoluteUrl('/anmelden'),
  },
  robots: NOINDEX_ROBOTS,
}

export default function AnmeldenPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e7f0fc] via-[#d7e7fb] to-[#c9ddf7] p-4 sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center sm:min-h-[calc(100vh-4rem)]">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#d7e7fb] bg-[#f8fbff] shadow-[0_28px_80px_-35px_rgba(21,74,140,0.45)] lg:grid-cols-[minmax(380px,1fr)_minmax(460px,1.2fr)]">
          <section className="flex items-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-md">
              <Image
                src="/Planenadlerlogo.png"
                alt="Planenadler"
                width={220}
                height={56}
                className="mb-6 h-12 w-auto object-contain sm:h-14"
                priority
              />
              <h1 className="text-4xl font-semibold leading-tight text-[#1F5CAB] sm:text-5xl">
                Willkommen zurueck
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#355f95]">
                Melden Sie sich an, um Ihre Bestellungen, Adressen und gespeicherten Zahlungsmethoden zu verwalten.
              </p>
              <div className="mt-8">
                <Suspense fallback={<div className="text-sm text-[#355f95]">Lade Anmeldung ...</div>}>
                  <LoginFormAnmelden />
                </Suspense>
              </div>
            </div>
          </section>
          <section className="relative min-h-[320px] lg:min-h-[760px]">
            <Image
              src="/images/Planenadler1.jpg"
              alt="Planenadler Impression"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F5CAB]/40 via-transparent to-[#1F5CAB]/15" />
          </section>
        </div>
      </div>
    </main>
  )
}
