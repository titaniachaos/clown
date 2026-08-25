import { readFileSync } from 'node:fs'
import { defineLoader } from 'vitepress'

/**
 * Publishes the fair-pay gap, and only that.
 *
 * The figures come from funding/budget.json so the public number cannot drift
 * from the one the application is written with. That file is private -- it
 * holds the plan and the ceiling -- so this loader derives the few aggregates
 * the page needs and exposes nothing else.
 */
export interface FairPayData {
  floorDay: number
  fairPayDay: number
  rehearsalDays: number
  outsideEyeDays: number
  gap: number
}

declare const data: FairPayData
export { data }

export default defineLoader({
  watch: ['../../funding/budget.json'],
  load(): FairPayData {
    const b = JSON.parse(readFileSync('funding/budget.json', 'utf8'))
    const floorDay = b.plan.performer_day_rate
    const fairPayDay = b.rates.fairpay_day
    const rehearsalDays = b.plan.rehearsal_weeks * b.plan.rehearsal_days_per_week
    const outsideEyeDays = b.plan.outside_eye_days
    const perDay = fairPayDay - floorDay
    return {
      floorDay,
      fairPayDay,
      rehearsalDays,
      outsideEyeDays,
      gap: (rehearsalDays + outsideEyeDays) * perDay
    }
  }
})
