import type { InterventionPlan } from '@/lib/types'

export type MessageType = 'intervention_assigned' | 'step_progress' | 'grade_update' | 'motivational' | 'reminder'

export interface ParentMessage {
  id: string
  parent_id: string
  student_id: string
  type: MessageType
  title: string
  body: string
  action_url?: string
  metadata?: Record<string, any>
  sent_at: string
  read_at?: string
}

export const parentMessageTemplates: Record<MessageType, (data: any) => { title: string; body: string }> = {
  intervention_assigned: (data) => ({
    title: `New Learning Plan: ${data.subject}`,
    body: `${data.student_name} has been assigned a personalized ${data.subject} plan to strengthen ${data.gap}. Estimated completion: ${data.estimated_catchup}. Monitor progress in your dashboard.`,
  }),
  step_progress: (data) => ({
    title: `Progress Update: ${data.step_number}/${data.total_steps} Complete`,
    body: `Great work! ${data.student_name} completed "${data.step_title}" in ${data.subject}. They're ${data.progress_percent}% through the plan.`,
  }),
  grade_update: (data) => ({
    title: `Grade Improvement! 📈`,
    body: `Wonderful news! ${data.student_name}'s ${data.subject} grade improved from ${data.old_grade}% to ${data.new_grade}%. The intervention is working!`,
  }),
  motivational: (data) => ({
    title: `Keep Going! 💪`,
    body: `${data.student_name} is doing great with the ${data.subject} plan. Encourage them to complete the remaining ${data.remaining_steps} steps this week.`,
  }),
  reminder: (data) => ({
    title: `Time to Study!`,
    body: `Reminder: ${data.student_name} hasn't worked on the ${data.subject} plan in ${data.days_since} days. A little practice today would help!`,
  }),
}

export function generateParentMessage(
  type: MessageType,
  parentId: string,
  studentId: string,
  data: any
): ParentMessage {
  const template = parentMessageTemplates[type]
  const { title, body } = template(data)

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    parent_id: parentId,
    student_id: studentId,
    type,
    title,
    body,
    sent_at: new Date().toISOString(),
    metadata: data,
  }
}

export function generateInterventionMessages(
  plan: InterventionPlan,
  parentId: string
): ParentMessage[] {
  const messages: ParentMessage[] = []

  // Assignment notification
  messages.push(
    generateParentMessage('intervention_assigned', parentId, plan.student_id, {
      subject: plan.subject,
      student_name: plan.student_name,
      gap: plan.gap,
      estimated_catchup: plan.estimated_catchup,
    })
  )

  return messages
}

export function generateProgressMessages(
  plan: InterventionPlan,
  parentId: string,
  completedSteps: number
): ParentMessage[] {
  const progress = Math.round((completedSteps / plan.steps.length) * 100)

  if (completedSteps > 0) {
    return [
      generateParentMessage('step_progress', parentId, plan.student_id, {
        student_name: plan.student_name,
        step_number: completedSteps,
        total_steps: plan.steps.length,
        step_title: plan.steps[completedSteps - 1]?.title || 'a step',
        subject: plan.subject,
        progress_percent: progress,
      }),
    ]
  }

  return []
}

export function generateMotivationalMessages(
  plan: InterventionPlan,
  parentId: string,
  completedSteps: number
): ParentMessage[] {
  const remainingSteps = plan.steps.length - completedSteps

  if (remainingSteps > 0 && completedSteps > 0 && completedSteps % 3 === 0) {
    return [
      generateParentMessage('motivational', parentId, plan.student_id, {
        student_name: plan.student_name,
        subject: plan.subject,
        remaining_steps: remainingSteps,
      }),
    ]
  }

  return []
}

export function generateReminderMessage(
  plan: InterventionPlan,
  parentId: string,
  daysSince: number
): ParentMessage | null {
  if (daysSince >= 3) {
    return generateParentMessage('reminder', parentId, plan.student_id, {
      student_name: plan.student_name,
      subject: plan.subject,
      days_since: daysSince,
    })
  }

  return null
}
