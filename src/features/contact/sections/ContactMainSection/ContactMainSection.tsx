import { CONTACT_INFO_ITEMS } from '../../data/contactContent'
import { ContactInfoCards } from '../../components/ContactInfoCards'
import { ContactForm } from '../../components/ContactForm'

export function ContactMainSection() {
  return (
    <section className="w-full bg-[#F4F8FD] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div>
            <h2 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
              So erreichen Sie uns
            </h2>
            <p className="mt-2 text-sm text-[#3982DC]/80">
              Rufen Sie uns an, schreiben Sie uns eine E-Mail oder nutzen Sie das Kontaktformular.
            </p>
            <div className="mt-8">
              <ContactInfoCards items={CONTACT_INFO_ITEMS} />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-[0_8px_32px_rgba(31,92,171,0.08)] sm:p-8 lg:p-10">
            <h2 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
              Kontaktformular
            </h2>
            <p className="mt-2 text-sm text-[#3982DC]/80">
              Füllen Sie das Formular aus – wir antworten innerhalb von 24 Stunden.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-[2rem] shadow-[0_8px_24px_rgba(31,92,171,0.08)]">
          <iframe
            title="Planenadler Standort"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2485.1627177849!2d6.7823!3d51.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8c2c4e9e!2sD%C3%BCsseldorfer+Str.+387%2C+47055+Duisburg!5e0!3m2!1sde!2sde"
            width="100%"
            height="360"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block border-0"
            aria-label="Standort von Planenadler auf Google Maps"
          />
        </div>
      </div>
    </section>
  )
}
