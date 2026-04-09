import type { ConfigFormState, ResolvedCustomizerConfig } from '@/lib/customizer-runtime'
import {
  TARPAULIN_MAX_WINDOW_HEIGHT_CM,
  TARPAULIN_MIN_GAP_BETWEEN_OPENINGS_CM,
  TARPAULIN_OPENING_MARGIN_CM,
} from '@/lib/tarpaulin-constants'

export {
  TARPAULIN_MAX_WINDOW_HEIGHT_CM,
  TARPAULIN_MIN_GAP_BETWEEN_OPENINGS_CM,
  TARPAULIN_OPENING_MARGIN_CM,
} from '@/lib/tarpaulin-constants'

function parseCm(value: string | undefined | null): number | null {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function clampNum(n: number, lo: number, hi: number): number {
  if (lo > hi) return lo
  return Math.min(hi, Math.max(lo, n))
}

function formatCmForInput(n: number): string {
  return String(Math.round(n))
}

/** Keys die Terrassen-Oeffnungs-Clamps ausloesen duerfen (setField-Whitelist). */
export const TERRACE_OPENING_CLAMP_FIELD_KEYS: ReadonlyArray<keyof ConfigFormState> = [
  'lengthACm',
  'heightRightBCm',
  'heightLeftCCm',
  'hasWindow',
  'hasDoor',
  'windowSplit',
  'windowWidthCm',
  'windowHeightCm',
  'windowDistanceSideCm',
  'windowDistanceBottomCm',
  'windowSplitLeftWidthCm',
  'windowSplitLeftHeightCm',
  'windowSplitRightWidthCm',
  'windowSplitRightHeightCm',
  'windowSplitRightDistanceRightCm',
  'windowSplitLeftDistanceLeftCm',
  'windowSplitLeftDistanceBottomCm',
  'windowSplitRightDistanceBottomCm',
  'doorWidthCm',
  'doorHeightCm',
  'doorDistanceLeftCm',
]

/**
 * Begrenzt Fenster-/Tuer-Masse auf die gleichen Grenzen wie die Validierung (Terrassenplane).
 * Leere oder ungueltige Felder werden nicht mit erfundenen Werten befuellt.
 */
export function applyTerraceTarpaulinOpeningClamps(
  form: ConfigFormState,
  resolvedConfig: ResolvedCustomizerConfig,
): ConfigFormState {
  if (!isTerraceTarpaulinLayout(resolvedConfig)) return form

  const needsWindow = form.hasWindow === 'yes' && resolvedConfig.steps.includes('window')
  const needsDoor = form.hasDoor === 'yes' && resolvedConfig.steps.includes('door')
  if (!needsWindow && !needsDoor) return form

  const lengthA = parseCm(form.lengthACm)
  const hasLeftHeight = resolvedConfig.dimensions.fields.some((f) => f.key === 'heightLeftCCm')
  const usableH = usableHeightCm(form, hasLeftHeight)

  const m = TARPAULIN_OPENING_MARGIN_CM
  const gap = TARPAULIN_MIN_GAP_BETWEEN_OPENINGS_CM
  const maxWinH = TARPAULIN_MAX_WINDOW_HEIGHT_CM

  const canHoriz = lengthA !== null && lengthA > 0
  const canVert = usableH !== null && usableH > 0

  let next: ConfigFormState = form

  const patch = (key: keyof ConfigFormState, num: number) => {
    const s = formatCmForInput(num)
    if ((next[key] as string) !== s) {
      next = { ...next, [key]: s }
    }
  }

  const read = (key: keyof ConfigFormState) => parseCm(next[key] as string)

  if (needsWindow && form.windowSplit !== 'yes') {
    if (canHoriz) {
      let w = read('windowWidthCm')
      const maxW = lengthA! - 2 * m
      if (w !== null && w > maxW) {
        patch('windowWidthCm', maxW)
        w = maxW
      }
    }
    const h0 = read('windowHeightCm')
    if (h0 !== null && h0 > maxWinH) {
      patch('windowHeightCm', maxWinH)
    }
    if (canHoriz) {
      const w = read('windowWidthCm')
      let side = read('windowDistanceSideCm')
      if (side !== null && side < m) patch('windowDistanceSideCm', m)
      side = read('windowDistanceSideCm')
      if (side !== null && w !== null) {
        const hi = lengthA! - m - w
        const lo = m
        if (hi >= lo) {
          const clamped = clampNum(side, lo, hi)
          if (clamped !== side) patch('windowDistanceSideCm', clamped)
        }
      }
    }
    if (canVert) {
      const h = read('windowHeightCm')
      let bottom = read('windowDistanceBottomCm')
      if (bottom !== null && bottom < m) patch('windowDistanceBottomCm', m)
      bottom = read('windowDistanceBottomCm')
      if (bottom !== null && h !== null) {
        const hi = usableH! - m - h
        const lo = m
        if (hi >= lo) {
          const clamped = clampNum(bottom, lo, hi)
          if (clamped !== bottom) patch('windowDistanceBottomCm', clamped)
        }
      }
    }
  }

  if (needsWindow && form.windowSplit === 'yes') {
    for (let i = 0; i < 3; i++) {
      let leftM = read('windowSplitLeftDistanceLeftCm')
      if (leftM !== null && leftM < m) patch('windowSplitLeftDistanceLeftCm', m)

      let rightM = read('windowSplitRightDistanceRightCm')
      if (rightM !== null && rightM < m) patch('windowSplitRightDistanceRightCm', m)

      let b1 = read('windowSplitLeftDistanceBottomCm')
      if (b1 !== null && b1 < m) patch('windowSplitLeftDistanceBottomCm', m)

      let b2 = read('windowSplitRightDistanceBottomCm')
      if (b2 !== null && b2 < m) patch('windowSplitRightDistanceBottomCm', m)

      let h1 = read('windowSplitLeftHeightCm')
      if (h1 !== null && h1 > maxWinH) patch('windowSplitLeftHeightCm', maxWinH)

      let h2 = read('windowSplitRightHeightCm')
      if (h2 !== null && h2 > maxWinH) patch('windowSplitRightHeightCm', maxWinH)

      if (canHoriz) {
        leftM = read('windowSplitLeftDistanceLeftCm')
        rightM = read('windowSplitRightDistanceRightCm')
        const w1 = read('windowSplitLeftWidthCm')
        const w2 = read('windowSplitRightWidthCm')
        if (leftM !== null && rightM !== null && w1 !== null && w2 !== null) {
          const sum = leftM + w1 + gap + w2 + rightM
          if (sum > lengthA!) {
            const maxRight = lengthA! - leftM - w1 - gap - w2
            if (maxRight >= m) {
              patch('windowSplitRightDistanceRightCm', maxRight)
            } else {
              patch('windowSplitRightDistanceRightCm', m)
              const maxW2 = lengthA! - leftM - w1 - gap - m
              if (maxW2 >= 1) patch('windowSplitRightWidthCm', maxW2)
            }
          }
        }
      }

      if (canVert) {
        b1 = read('windowSplitLeftDistanceBottomCm')
        h1 = read('windowSplitLeftHeightCm')
        if (b1 !== null && h1 !== null) {
          const hi = usableH! - m - h1
          const lo = m
          if (hi >= lo) {
            const c = clampNum(b1, lo, hi)
            if (c !== b1) patch('windowSplitLeftDistanceBottomCm', c)
          }
        }
        b2 = read('windowSplitRightDistanceBottomCm')
        h2 = read('windowSplitRightHeightCm')
        if (b2 !== null && h2 !== null) {
          const hi = usableH! - m - h2
          const lo = m
          if (hi >= lo) {
            const c = clampNum(b2, lo, hi)
            if (c !== b2) patch('windowSplitRightDistanceBottomCm', c)
          }
        }
      }
    }
  }

  if (needsDoor) {
    if (canHoriz) {
      let dw = read('doorWidthCm')
      const maxDw = lengthA! - 2 * m
      if (dw !== null && dw > maxDw) {
        patch('doorWidthCm', maxDw)
        dw = maxDw
      }
    }
    if (canVert) {
      const dh = read('doorHeightCm')
      const maxDh = usableH! - m
      if (dh !== null && dh > maxDh) {
        patch('doorHeightCm', maxDh)
      }
    }
    if (canHoriz) {
      let dLeft = read('doorDistanceLeftCm')
      if (dLeft !== null && dLeft < m) patch('doorDistanceLeftCm', m)
      dLeft = read('doorDistanceLeftCm')
      const dw = read('doorWidthCm')
      if (dLeft !== null && dw !== null) {
        const hi = lengthA! - m - dw
        const lo = m
        if (hi >= lo) {
          const clamped = clampNum(dLeft, lo, hi)
          if (clamped !== dLeft) patch('doorDistanceLeftCm', clamped)
        }
      }
    }
  }

  return next
}

function pushUnique(issues: string[], msg: string): void {
  if (!issues.includes(msg)) issues.push(msg)
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
    pushUnique(
      issues,
      'Bitte zuerst eine gueltige Laenge A (cm) eintragen, damit Fenster- und Tuer-Masse geprueft werden koennen.',
    )
    return issues
  }

  if (usableH === null || usableH <= 0) {
    pushUnique(
      issues,
      'Bitte zuerst gueltige Hoehen B/C (cm) eintragen, damit Fenster- und Tuer-Masse geprueft werden koennen.',
    )
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

    if (side !== null && side < m) {
      pushUnique(issues, `Abstand Fenster zum Seitenrand (c) muss mindestens ${m} cm betragen.`)
    }
    if (bottom !== null && bottom < m) {
      pushUnique(issues, `Abstand Fenster zur unteren Seite (d) muss mindestens ${m} cm betragen.`)
    }
    if (h !== null && h > maxWinH) {
      pushUnique(issues, `Fensterhoehe (b) darf hoechstens ${maxWinH} cm betragen.`)
    }
    if (w !== null && w > lengthA - 2 * m) {
      pushUnique(
        issues,
        `Fensterbreite (a) darf hoechstens ${lengthA - 2 * m} cm betragen (je ${m} cm Rand links/rechts).`,
      )
    }
    if (side !== null && w !== null && side + w > lengthA - m) {
      pushUnique(
        issues,
        'Fenster ragt ueber die rechte Kante: Abstand (c) plus Breite (a) muss so gewaehlt sein, dass rechts mindestens 10 cm Rand bleiben.',
      )
    }
    if (bottom !== null && h !== null && bottom + h > usableH - m) {
      pushUnique(
        issues,
        'Fenster ragt nach oben: Abstand unten (d) plus Hoehe (b) muss so gewaehlt sein, dass oben mindestens 10 cm Rand bleiben.',
      )
    }

    if (side !== null && w !== null) {
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

    if (leftM !== null && leftM < m) {
      pushUnique(issues, `Abstand linkes Fenster zum linken Rand muss mindestens ${m} cm betragen.`)
    }
    if (rightM !== null && rightM < m) {
      pushUnique(issues, `Abstand rechtes Fenster zum rechten Rand muss mindestens ${m} cm betragen.`)
    }
    if (w1 !== null && w1 <= 0) {
      pushUnique(issues, 'Fensterbreite links muss groesser als 0 sein.')
    }
    if (w2 !== null && w2 <= 0) {
      pushUnique(issues, 'Fensterbreite rechts muss groesser als 0 sein.')
    }
    if (
      leftM !== null &&
      rightM !== null &&
      w1 !== null &&
      w2 !== null &&
      leftM + w1 + gap + w2 + rightM > lengthA
    ) {
      pushUnique(
        issues,
        `Summe aus linkem Rand, beiden Fensterbreiten, ${gap} cm Zwischenraum und rechtem Rand darf die Laenge A (${lengthA} cm) nicht ueberschreiten.`,
      )
    }

    if (h1 !== null && h1 > maxWinH) {
      pushUnique(issues, `Fensterhoehe links darf hoechstens ${maxWinH} cm betragen.`)
    }
    if (h2 !== null && h2 > maxWinH) {
      pushUnique(issues, `Fensterhoehe rechts darf hoechstens ${maxWinH} cm betragen.`)
    }

    if (b1 !== null && b1 < m) {
      pushUnique(issues, `Abstand linkes Fenster zum unteren Rand muss mindestens ${m} cm betragen.`)
    }
    if (b2 !== null && b2 < m) {
      pushUnique(issues, `Abstand rechtes Fenster zum unteren Rand muss mindestens ${m} cm betragen.`)
    }
    if (b1 !== null && h1 !== null && b1 + h1 > usableH - m) {
      pushUnique(
        issues,
        'Linkes Fenster: Abstand unten plus Hoehe verletzt den oberen Mindestrand (10 cm).',
      )
    }
    if (b2 !== null && h2 !== null && b2 + h2 > usableH - m) {
      pushUnique(
        issues,
        'Rechtes Fenster: Abstand unten plus Hoehe verletzt den oberen Mindestrand (10 cm).',
      )
    }

    if (leftM !== null && w1 !== null && w2 !== null) {
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

    if (dLeft !== null && dLeft < m) {
      pushUnique(issues, `Abstand der Tuer zur linken Seite muss mindestens ${m} cm betragen.`)
    }
    if (dLeft !== null && dw !== null && dLeft + dw > lengthA - m) {
      pushUnique(
        issues,
        'Tuer ragt ueber die rechte Kante: Abstand plus Tuerbreite muss so sein, dass rechts mindestens 10 cm Rand bleiben.',
      )
    }
    if (dh !== null && dh > usableH - m) {
      pushUnique(
        issues,
        'Tuerhoehe ist zu gross fuer die gewaehlte Planenhoehe (unterer Rand 10 cm, oberer Mindestrand 10 cm).',
      )
    }

    if (dLeft !== null && dw !== null) {
      doorInterval = { left: dLeft, right: dLeft + dw }
    }
  }

  if (windowIntervals.length > 0 && doorInterval) {
    const pairs: Array<[number, number]> = [
      ...windowIntervals.map((i) => [i.left, i.right] as [number, number]),
      [doorInterval.left, doorInterval.right],
    ]
    if (!horizontalOpeningsSeparated(pairs, gap)) {
      pushUnique(
        issues,
        `Fenster und Tuer duerfen sich nicht ueberlappen; zwischen den Oeffnungen muessen mindestens ${gap} cm frei bleiben.`,
      )
    }
  }

  return issues
}
