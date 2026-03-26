export function HeroOverlays() {
  return (
    <>
      {/* Dunkler Gradient von unten für Text-Lesbarkeit */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        aria-hidden
      />
      {/* Leichter Gradient von links für den Text-Block */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-r from-black/40 via-black/10 to-transparent"
        aria-hidden
      />
    </>
  )
}
