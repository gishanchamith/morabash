type BallLike = {
  innings?: number | null
  runs?: number | null
  extras?: number | null
  extra_type?: string | null
  wicket_type?: string | null
  is_free_hit?: boolean | null
}

type InningsTotals = {
  runs: number
  wickets: number
  overs: number
  runRate: number
  legalBalls: number
}

export type AggregatedScoreboard = {
  innings1: InningsTotals
  innings2: InningsTotals & {
    requiredRunRate: number | null
    runsNeeded: number | null
    ballsRemaining: number | null
    target: number | null
  }
}

type AggregateOptions = {
  ballsPerInnings?: number
}

function normaliseTotals(totals: { runs: number; wickets: number; legalBalls: number }): InningsTotals {
  const { runs, wickets, legalBalls } = totals
  const overs = legalBalls === 0 ? 0 : parseFloat(`${Math.floor(legalBalls / 6)}.${legalBalls % 6}`)
  const runRate = legalBalls === 0 ? 0 : Number(((runs * 6) / legalBalls).toFixed(2))

  return {
    runs,
    wickets,
    overs,
    runRate,
    legalBalls,
  }
}

export function aggregateScoreboard(
  balls: BallLike[] | null | undefined,
  options: AggregateOptions = {},
): AggregatedScoreboard | null {
  if (!balls || balls.length === 0) {
    return null
  }

  const ballsPerInnings = options.ballsPerInnings ?? 120

  const totals = new Map<number, { runs: number; wickets: number; legalBalls: number }>()

  balls.forEach((ball) => {
    const innings = Number(ball.innings) === 2 ? 2 : 1
    const current = totals.get(innings) || { runs: 0, wickets: 0, legalBalls: 0 }

    const runs = Number(ball.runs ?? 0)
    const extras = Number(ball.extras ?? 0)
    current.runs += runs + extras

    if (ball.wicket_type) {
      current.wickets += 1
    }

    const extraType = ball.extra_type
    const isLegalDelivery = !extraType || (extraType !== "wide" && extraType !== "no-ball")
    if (isLegalDelivery) {
      current.legalBalls += 1
    }

    totals.set(innings, current)
  })

  const innings1Totals = totals.get(1) || { runs: 0, wickets: 0, legalBalls: 0 }
  const innings2Totals = totals.get(2) || { runs: 0, wickets: 0, legalBalls: 0 }

  const innings1 = normaliseTotals(innings1Totals)
  const innings2Base = normaliseTotals(innings2Totals)

  const target = innings1.runs > 0 ? innings1.runs + 1 : null
  const runsNeeded = target !== null ? Math.max(0, target - innings2Base.runs) : null
  const ballsRemaining = target !== null ? Math.max(0, ballsPerInnings - innings2Base.legalBalls) : null

  let requiredRunRate: number | null = null
  if (runsNeeded !== null) {
    if (runsNeeded <= 0) {
      requiredRunRate = 0
    } else if (ballsRemaining && ballsRemaining > 0) {
      requiredRunRate = Number(((runsNeeded * 6) / ballsRemaining).toFixed(2))
    }
  }

  return {
    innings1,
    innings2: {
      ...innings2Base,
      requiredRunRate,
      runsNeeded,
      ballsRemaining,
      target,
    },
  }
}

export function normaliseScoreboardRow(row: any | undefined | null) {
  if (!row) {
    return {
      runs: 0,
      wickets: 0,
      overs: 0,
      runRate: 0,
      requiredRunRate: null as number | null,
    }
  }

  const toNumber = (value: any) => {
    const num = Number(value)
    return Number.isNaN(num) ? 0 : num
  }

  return {
    runs: toNumber(row.runs),
    wickets: toNumber(row.wickets),
    overs: toNumber(row.overs),
    runRate: toNumber(row.current_rr),
    requiredRunRate: row.required_rr === null || row.required_rr === undefined ? null : toNumber(row.required_rr),
  }
}
