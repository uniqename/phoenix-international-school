import type { Grade } from './types'

export function getGESGrade(score: number): number {
  if (score >= 80) return 1
  if (score >= 70) return 2
  if (score >= 60) return 3
  if (score >= 50) return 4
  if (score >= 40) return 5
  if (score >= 30) return 6
  if (score >= 20) return 7
  return 8
}

export function getGESLabel(grade: number): string {
  const labels: Record<number, string> = {
    1: 'Excellent', 2: 'Very Good', 3: 'Good', 4: 'Credit',
    5: 'Average', 6: 'Below Average', 7: 'Weak', 8: 'Very Weak',
  }
  return labels[grade] ?? 'Unknown'
}

export function getGESColor(grade: number): string {
  if (grade <= 2) return '#22c55e'
  if (grade === 3) return '#10b981'
  if (grade === 4) return '#00D4FF'
  if (grade === 5) return '#f59e0b'
  return '#ef4444'
}

export function calculateAggregate(grades: Grade[]): number {
  return grades.reduce((sum, g) => sum + g.ges_grade, 0)
}

export function aggregateRating(agg: number): string {
  if (agg <= 8) return '🟢 Excellent — Top SHS very likely'
  if (agg <= 12) return '🔵 Very Good — Great SHS options'
  if (agg <= 18) return '🟡 Good — Keep pushing'
  return '🔴 Needs serious improvement'
}

// Monthly PAYE — simplified Ghana tax table 2024
export function calculatePAYE(monthlySalary: number): number {
  const annual = monthlySalary * 12
  const exempt = 4380
  if (annual <= exempt) return 0
  let tax = 0
  const t = annual - exempt
  if (t <= 1320) tax = t * 0.05
  else if (t <= 2640) tax = 66 + (t - 1320) * 0.10
  else if (t <= 4620) tax = 198 + (t - 2640) * 0.175
  else if (t <= 72000) tax = 545 + (t - 4620) * 0.25
  else tax = 17395 + (t - 72000) * 0.30
  return Math.round(tax / 12)
}

export function calculateSSNIT(basicSalary: number) {
  return {
    employee: Math.round(basicSalary * 0.055),
    employer: Math.round(basicSalary * 0.13),
  }
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `PIS-${year}-${rand}`
}

export function generateStudentId(level: string, seq: number): string {
  const codes: Record<string, string> = {
    creche: 'CR', nursery: 'NR', kg: 'KG', primary: 'PR', jhs: 'JHS',
  }
  const year = new Date().getFullYear()
  return `${codes[level] ?? 'ST'}-${year}-${String(seq).padStart(3, '0')}`
}

export function generatePickupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${part(3)}-${part(3)}`
}

export function formatGHS(amount: number): string {
  return `GH₵${amount.toFixed(2)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export const LEVEL_NAMES: Record<string, string> = {
  creche: 'Crèche', nursery: 'Nursery', kg: 'KG', primary: 'Primary', jhs: 'JHS',
}

export const CLASSES = [
  'Crèche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B',
]

export const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  creche: ['Learning Through Play', 'Language Development', 'Creative Arts'],
  nursery: ['English Language', 'Numeracy', 'Creative Arts', 'Physical Education'],
  kg: ['English Language', 'Numeracy', 'Science', 'Creative Arts', 'Physical Education', 'RME'],
  primary: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'RME', 'French', 'ICT', 'Creative Arts'],
  jhs: ['English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 'RME', 'French', 'ICT', 'Creative Arts', 'Career Technology'],
}

export const NACCA_STRANDS: Record<string, { strand: string; subs: string[] }[]> = {
  Mathematics: [
    { strand: 'Number and Algebra', subs: ['Fractions & Decimals', 'Indices & Logarithms', 'Ratio & Proportion', 'Algebraic Expressions'] },
    { strand: 'Geometry & Measurement', subs: ['Angles & Shapes', 'Mensuration', 'Coordinate Geometry', 'Vectors'] },
    { strand: 'Statistics & Probability', subs: ['Data Collection', 'Probability', 'Graphs & Charts'] },
  ],
  'Integrated Science': [
    { strand: 'Earth & Environment', subs: ['Soil Types in Ghana', 'Water Bodies', 'Rocks & Minerals'] },
    { strand: 'Life Science', subs: ['Human Body Systems', 'Plant Biology', 'Genetics & Heredity'] },
    { strand: 'Physical Science', subs: ['Forces & Motion', 'Energy & Work', 'Electricity'] },
  ],
  'English Language': [
    { strand: 'Reading & Writing', subs: ['Comprehension Passages', 'Essay Writing', 'Summary Writing'] },
    { strand: 'Grammar & Usage', subs: ['Parts of Speech', 'Tenses & Concord', 'Sentence Construction'] },
    { strand: 'Oral & Listening', subs: ['Pronunciation', 'Listening Comprehension', 'Discussions'] },
  ],
  'Social Studies': [
    { strand: 'Our Nation Ghana', subs: ['Traditional Governance', 'Independence & Democracy', 'Natural Resources'] },
    { strand: 'Global Citizenship', subs: ['African Union', 'United Nations', 'Climate Change'] },
    { strand: 'Economic Life', subs: ['Production & Consumption', 'Trade & Commerce', 'Banking & Finance'] },
  ],
}
