import type { InterventionStep } from '@/lib/types'

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false' | 'fill_blank'

export interface GeneratedQuestion {
  id: string
  type: QuestionType
  text: string
  options?: string[] // For multiple choice
  correct_answer?: string | number // For answer validation
  explanation?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topic: string
  estimated_time_seconds: number
}

export interface GeneratedQuiz {
  id: string
  step_id: string
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questions: GeneratedQuestion[]
  estimated_duration_minutes: number
  passing_score: number // % required to pass
  generated_at: string
}

export async function generateQuizForTopic(
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  questionCount: number = 5
): Promise<GeneratedQuiz | null> {
  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        difficulty,
        question_count: questionCount,
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return {
      id: `quiz-${Date.now()}`,
      step_id: '',
      topic,
      difficulty,
      questions: data.questions,
      estimated_duration_minutes: data.estimated_duration_minutes || 15,
      passing_score: data.passing_score || 70,
      generated_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Quiz generation failed:', error)
    return null
  }
}

export async function generateAdaptiveQuiz(
  topic: string,
  previousScore: number,
  studentLevel: 'beginner' | 'intermediate' | 'advanced'
): Promise<GeneratedQuiz | null> {
  // Adjust difficulty based on previous score
  let difficulty = studentLevel
  if (previousScore >= 80) {
    difficulty = studentLevel === 'beginner' ? 'intermediate' : 'advanced'
  } else if (previousScore < 60) {
    difficulty = studentLevel === 'advanced' ? 'intermediate' : 'beginner'
  }

  return generateQuizForTopic(topic, difficulty, 5)
}

export function scoreQuiz(
  quiz: GeneratedQuiz,
  answers: Record<string, string | number>
): { score: number; passed: boolean; feedback: string } {
  let correct = 0

  for (const question of quiz.questions) {
    const userAnswer = answers[question.id]
    if (userAnswer === question.correct_answer) {
      correct++
    }
  }

  const score = Math.round((correct / quiz.questions.length) * 100)
  const passed = score >= quiz.passing_score

  const feedback =
    score >= 80
      ? `Excellent! You scored ${score}%. You've mastered this topic!`
      : score >= 60
      ? `Good effort! You scored ${score}%. Review the concepts and try again.`
      : `You scored ${score}%. Let's review the topic and try again.`

  return { score, passed, feedback }
}

export function getWeakAreas(
  quiz: GeneratedQuiz,
  answers: Record<string, string | number>
): string[] {
  const weak: string[] = []

  for (const question of quiz.questions) {
    const userAnswer = answers[question.id]
    if (userAnswer !== question.correct_answer) {
      if (!weak.includes(question.topic)) {
        weak.push(question.topic)
      }
    }
  }

  return weak
}

export function recommendNextTopic(
  quiz: GeneratedQuiz,
  score: number,
  weakAreas: string[]
): { topic: string; reason: string } | null {
  if (score >= 80) {
    return {
      topic: `Advanced ${quiz.topic}`,
      reason: 'You mastered the basics! Ready for advanced concepts.',
    }
  }

  if (weakAreas.length > 0) {
    return {
      topic: weakAreas[0],
      reason: `Let's strengthen your understanding of ${weakAreas[0]}.`,
    }
  }

  return null
}

// Quiz templates for common subjects
export const commonTopics: Record<string, Record<string, string[]>> = {
  Mathematics: {
    Algebra: ['Linear Equations', 'Quadratic Equations', 'Functions', 'Polynomials'],
    Geometry: ['Triangles', 'Circles', 'Angles', 'Area and Volume'],
    Statistics: ['Mean and Median', 'Probability', 'Data Analysis'],
  },
  Science: {
    Biology: ['Cells', 'Photosynthesis', 'Evolution', 'Genetics'],
    Chemistry: ['Atoms', 'Reactions', 'Periodic Table', 'Bonding'],
    Physics: ['Forces', 'Energy', 'Waves', 'Gravity'],
  },
  English: {
    Grammar: ['Tenses', 'Parts of Speech', 'Sentence Structure'],
    Literature: ['Poetry', 'Prose', 'Themes', 'Character Analysis'],
    Writing: ['Essays', 'Persuasion', 'Narrative', 'Description'],
  },
}
