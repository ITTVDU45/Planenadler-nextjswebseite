import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Downloads | Mein Konto | Planenadler',
  description: 'Ihre herunterladbaren Produkte.',
}

export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
        Downloads
      </h1>
      <p className="text-[#1F5CAB]/80">
        Sie haben derzeit keine Download-Produkte oder diese Funktion wird noch
        nicht angeboten. Bei Fragen zu digitalen Produkten kontaktieren Sie uns
        gern.
      </p>
    </div>
  )
}
