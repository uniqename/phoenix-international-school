// Phase 15g — AI report-card narrative drafting.
//
// Two flows supported:
//
//  1. **Free / default**: build a ready-to-paste prompt from the student's
//     grades and let the head copy it into the free claude.ai web chat (or
//     ChatGPT, Gemini, etc.). No API key, no monthly bill, no per-token cost.
//     This is what Phoenix uses — a Ghana school doesn't need a paid API key
//     to draft 200 remarks once a term.
//
//  2. **Optional / paid**: if an Anthropic API key is configured in
//     /admin/settings, the same prompt is sent to the Anthropic Messages API
//     directly from the browser and the response is pasted into the remark
//     box for the head to edit. This is for schools with budget who want
//     one-tap drafting at scale.

export interface ReportCardDraftInput {
  schoolName: string
  studentName: string
  className: string
  term: 1 | 2 | 3
  academicYear: string
  // Per-marker grades or per-subject scores. Both shapes accepted; the AI is
  // told to use whichever is supplied.
  markers?: Array<{ name: string; grade?: string | null }>
  subjectScores?: Array<{ subject: string; score: number; gesGrade?: number }>
  attendancePct?: number
  position?: number
  classSize?: number
  // Role drafting the remark
  voice: 'teacher' | 'headmaster'
}

export interface ReportCardDraftResult {
  ok: boolean
  text?: string
  error?: string
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-opus-4-7'

const SYSTEM_PROMPT = `You are drafting a school report-card remark for a Ghanaian basic / JHS school. Output ONLY the remark text — no preamble, no quotes, no markdown, no salutation lines like "Dear parent". 2 to 4 sentences, max ~60 words. Use the student's first name once. Be warm but honest; avoid hollow praise. Never invent grades, scores or facts not provided.`

function buildFacts(input: ReportCardDraftInput): string[] {
  const facts: string[] = []
  facts.push(`Student: ${input.studentName}`)
  facts.push(`Class: ${input.className}`)
  facts.push(`Term ${input.term}, ${input.academicYear}`)
  if (typeof input.attendancePct === 'number') {
    facts.push(`Attendance: ${input.attendancePct}%`)
  }
  if (input.position && input.classSize) {
    facts.push(`Position: ${input.position} out of ${input.classSize}`)
  }
  if (input.markers?.length) {
    facts.push('Marker grades:')
    for (const m of input.markers) {
      facts.push(`  - ${m.name}: ${m.grade ?? 'not graded'}`)
    }
  }
  if (input.subjectScores?.length) {
    facts.push('Subject scores:')
    for (const s of input.subjectScores) {
      facts.push(`  - ${s.subject}: ${s.score}${s.gesGrade ? ` (GES ${s.gesGrade})` : ''}`)
    }
  }
  return facts
}

function buildVoiceGuidance(input: ReportCardDraftInput): string {
  return input.voice === 'headmaster'
    ? `Write in the voice of the headmaster/principal of ${input.schoolName}. Address the student warmly, name one or two specific strengths drawn from the data, gently flag one area to improve if the data warrants it, and close with an encouraging sentence about next term.`
    : `Write in the voice of the class teacher. Be specific about the student's classroom behaviour and effort as suggested by the data, name a concrete strength and a clear area to work on, and end with one actionable suggestion for the parent.`
}

// Build a self-contained prompt the head can paste into the free Claude / ChatGPT / Gemini chat.
export function buildClipboardPrompt(input: ReportCardDraftInput): string {
  const facts = buildFacts(input)
  const voiceGuidance = buildVoiceGuidance(input)
  return `${SYSTEM_PROMPT}\n\n${voiceGuidance}\n\nFacts:\n${facts.join('\n')}`
}

// Paid path: hit the Anthropic API directly. Only used when admin set a key.
export async function draftReportCardRemark(
  apiKey: string,
  input: ReportCardDraftInput,
  model: string = DEFAULT_MODEL,
): Promise<ReportCardDraftResult> {
  if (!apiKey) {
    return { ok: false, error: 'No Anthropic API key configured.' }
  }

  const facts = buildFacts(input)
  const voiceGuidance = buildVoiceGuidance(input)
  const user = `${voiceGuidance}\n\nFacts:\n${facts.join('\n')}`

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return { ok: false, error: `Claude API error ${res.status}: ${errText.slice(0, 200)}` }
    }
    const data = await res.json()
    const text = data?.content?.[0]?.text?.trim()
    if (!text) {
      return { ok: false, error: 'Claude returned no text — try again.' }
    }
    return { ok: true, text }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error contacting Claude' }
  }
}
