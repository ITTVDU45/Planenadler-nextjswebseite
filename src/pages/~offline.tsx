function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7FAFF] px-6 py-16 text-center">
      <div className="mx-auto w-full max-w-lg rounded-[24px] border border-white/60 bg-white/80 p-8 shadow-[0_12px_30px_rgba(31,92,171,0.12)] backdrop-blur">
        <div className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
          Du bist offline
        </div>
        <p className="mt-3 text-sm text-[#1F5CAB]/80 sm:text-base">
          Einige Inhalte sind offline verfügbar. Sobald du wieder online bist,
          wird die Seite automatisch aktualisiert.
        </p>
      </div>
    </main>
  )
}

export default OfflinePage
