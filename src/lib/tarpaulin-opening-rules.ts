import type { ConfigFormState, ResolvedCustomizerConfig } from '@/lib/customizer-runtime'

export const TARPAULIN_OPENING_MARGIN_CM = 10
export const TARPAULIN_MAX_WINDOW_HEIGHT_CM = 130
export const TARPAULIN_MIN_GAP_BETWEEN_OPENINGS_CM = 10

function parseCm(value: string | undefined | null): number | null {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/** Terrassen-Tarp (3 Massfelder A/B/C), kein 2-Feld-Pool-Tarp. */
export function isTerraceTarpaulinLayout(resolvedConfig: ResolvedCustomizerConfig): boolean {
  if (resolvedConfig.productType !== 'tarpaulins') return false
  return resolvedConfig.dimensions.fields.some((f) => f.key === 'heightLeftCCm')
}

function usableHeightCm(form: ConfigFormState, hasLeftHeight: boolean): number | null {
  const b = parseCm(form.heightRightBCm)
  if (b === null || b <= 0) return null
  if (!hasLeftHeight) return b
  const c = parseCm(form.heightLeftCCm)
  if (c === null || c <= 0) return null
  return Math.min(b, c)
}

/** Aufsteigend sortiert; benachbarte Intervalle mindestens gapCm auseinander. */
function horizontalOpeningsSeparated(
  intervals: Array<[number, number]>,
  gapCm: number,
): boolean {
  const valid = intervals.filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b >= a)
  if (valid.length <= 1) return true
  const sorted = [...valid].sort((x, y) => x[0] - y[0])
  for (let i = 0; i < sorted.length - 1; i++) {
    const end = sorted[i][1]
    const nextStart = sorted[i + 1][0]
    if (end + gapCm > nextStart) return false
  }
  return true
}

export function getTarpaulinOpeningValidationIssues(
  resolvedConfig: ResolvedCustomizerConfig,
  form: ConfigFormState,
): string[] {
  if (!isTerraceTarpaulinLayout(resolvedConfig)) return []

  const lengthA = parseCm(form.lengthACm)
  const hasLeftHeight = resolvedConfig.dimensions.fields.some((f) => f.key === 'heightLeftCCm')
  const usableH = usableHeightCm(form, hasLeftHeight)

  const issues: string[] = []

  const needsWindow = form.hasWindow === 'yes' && resolvedConfig.steps.includes('window')
  const needsDoor = form.hasDoor === 'yes' && resolvedConfig.steps.includes('door')

  if (!needsWindow && !needsDoor) return []

  if (lengthA === null || lengthA <= 0) {
    issues.push('Bitte zuerst eine gueltige Laenge A (cm) eintragen, damit Fenster- und Tuer-Masse geprueft werden koennen.')
    return issues
  }

  if (usableH === null || usableH <= 0) {
    issues.push('Bitte zuerst gueltige Hoehen B/C (cm) eintragen, damit Fenster- und Tuer-Masse geprueft werden koennen.')
    return issues
  }

  const m = TARPAULIN_OPENING_MARGIN_CM
  const gap = TARPAULIN_MIN_GAP_BETWEEN_OPENINGS_CM
  const maxWinH = TARPAULIN_MAX_WINDOW_HEIGHT_CM

  type HInterval = { left: number; right: number }

  const windowIntervals: HInterval[] = []

  if (needsWindow && form.windowSplit !== 'yes') {
    const side = parseCm(form.windowDistanceSideCm)
    const bottom = parseCm(form.windowDistanceBottomCm)
    const w = parseCm(form.windowWidthCm)
    const h = parseCm(form.windowHeightCm)

    if (side !== null && bottom !== null && w !== null && h !== null) {
      if (side < m) {
        issues.push(`Abstand Fenster zum Seitenrand (c) muss mindestens ${m} cm betragen.`)
      }
      if (bottom < m) {
        issues.push(`Abstand Fenster zur unteren Seite (d) muss mindestens ${m} cm betragen.`)
      }
      if (h > maxWinH) {
        issues.push(`Fensterhoehe (b) darf hoechstens ${maxWinH} cm betragen.`)
      }
      if (w > lengthA - 2 * m) {
        issues.push(`Fensterbreite (a) darf hoechstens ${lengthA - 2 * m} cm betragen (je ${m} cm Rand links/rechts).`)
      }
      if (side + w > lengthA - m) {
        issues.push(
          'Fenster ragt ueber die rechte Kante: Abstand (c) plus Breite (a) muss so gewaehlt sein, dass rechts mindestens 10 cm Rand bleiben.',
        )
      }
      if (bottom + h > usableH - m) {
        issues.push(
          'Fenster ragt nach oben: Abstand unten (d) plus Hoehe (b) muss so gewaehlt sein, dass oben mindestens 10 cm Rand bleiben.',
        )
      }

      windowIntervals.push({ left: side, right: side + w })
    }
  }

  if (needsWindow && form.windowSplit === 'yes') {
    const leftM = parseCm(form.windowSplitLeftDistanceLeftCm)
    const rightM = parseCm(form.windowSplitRightDistanceRightCm)
    const w1 = parseCm(form.windowSplitLeftWidthCm)
    const w2 = parseCm(form.windowSplitRightWidthCm)
    const h1 = parseCm(form.windowSplitLeftHeightCm)
    const h2 = parseCm(form.windowSplitRightHeightCm)
    const b1 = parseCm(form.windowSplitLeftDistanceBottomCm)
    const b2 = parseCm(form.windowSplitRightDistanceBottomCm)

    if (
      leftM !== null &&
      rightM !== null &&
      w1 !== null &&
      w2 !== null &&
      h1 !== null &&
      h2 !== null &&
      b1 !== null &&
      b2 !== null
    ) {
      if (leftM < m) {
        issues.push(`Abstand linkes Fenster zum linken Rand muss mindestens ${m} cm betragen.`)
      }
      if (rightM < m) {
        issues.push(`Abstand rechtes Fenster zum rechten Rand muss mindestens ${m} cm betragen.`)
      }
      if (w1 <= 0 || w2 <= 0) {
        issues.push('Fensterbreiten links und rechts muessen groesser als 0 sein.')
      }
      if (leftM + w1 + gap + w2 + rightM > lengthA) {
        issues.push(
          `Summe aus linkem Rand, beiden Fensterbreiten, ${gap} cm Zwischenraum und rechtem Rand darf die Laenge A (${lengthA} cm) nicht ueberschreiten.`,
        )
      }

      if (h1 > maxWinH) issues.push(`Fensterhoehe links darf hoechstens ${maxWinH} cm betragen.`)
      if (h2 > maxWinH) issues.push(`Fensterhoehe rechts darf hoechstens ${maxWinH} cm betragen.`)

      if (b1 < m) {
        issues.push(`Abstand linkes Fenster zum unteren Rand muss mindestens ${m} cm betragen.`)
      }
      if (b2 < m) {
        issues.push(`Abstand rechtes Fenster zum unteren Rand muss mindestens ${m} cm betragen.`)
      }
      if (b1 + h1 > usableH - m) {
        issues.push('Linkes Fenster: Abstand unten plus Hoehe verletzt den oberen Mindestrand (10 cm).')
      }
      if (b2 + h2 > usableH - m) {
        issues.push('Rechtes Fenster: Abstand unten plus Hoehe verletzt den oberen Mindestrand (10 cm).')
      }

      const x1 = leftM
      const x2 = leftM + w1 + gap
      windowIntervals.push({ left: x1, right: x1 + w1 }, { left: x2, right: x2 + w2 })
    }
  }

  let doorInterval: HInterval | null = null

  if (needsDoor) {
    const dLeft = parseCm(form.doorDistanceLeftCm)
    const dw = parseCm(form.doorWidthCm)
    const dh = parseCm(form.doorHeightCm)

    if (dLeft !== null && dw !== null && dh !== null) {
      if (dLeft < m) {
        issues.push(`Abstand der Tuer zur linken Seite muss mindestens ${m} cm betragen.`)
      }
      if (dLeft + dw > lengthA - m) {
        issues.push(
          'Tuer ragt ueber die rechte Kante: Abstand plus Tuerbreite muss so sein, dass rechts mindestens 10 cm Rand bleiben.',
        )
      }
      if (dh > usableH - m) {
        issues.push(
          'Tuerhoehe ist zu gross fuer die gewaehlte Planenhoehe (unterer Rand 10 cm, oberer Mindestrand 10 cm).',
        )
      }

      doorInterval = { left: dLeft, right: dLeft + dw }
    }
  }

  if (windowIntervals.length > 0 && doorInterval) {
    const pairs: Array<[number, number]> = [
      ...windowIntervals.map((i) => [i.left, i.right] as [number, number]),
      [doorInterval.left, doorInterval.right],
    ]
    if (!horizontalOpeningsSeparated(pairs, gap)) {
      issues.push(
        `Fenster und Tuer duerfen sich nicht ueberlappen; zwischen den Oeffnungen muessen mindestens ${gap} cm frei bleiben.`,
      )
    }
  }

  return issues
}
