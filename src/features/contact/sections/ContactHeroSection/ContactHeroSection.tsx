import Image from 'next/image'
import { CONTACT_HERO_CONTENT } from '../../data/contactContent'

export function ContactHeroSection() {
  const { subline, image } = CONTACT_HERO_CONTENT

  return (
    <section className="relative w-full overflow-hidden bg-[#1F5CAB] py-20 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F5CAB] via-[#2a6ec0] to-[#3982DC] opacity-90" />

      {image && (
        <div className="absolute inset-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover opacity-10"
            priority
          />
        </div>
      )}

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            Kontakt
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Wir sind für Sie da
          </h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">{subline}</p>
        </div>
      </div>
    </section>
  )
}
