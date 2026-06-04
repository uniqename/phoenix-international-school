import type { InterventionPlan, InterventionStep } from "@/lib/types";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface QuizAssessment {
  step_id: string;
  quiz_score: number; // 0-100
  attempt_date: string;
  time_spent_seconds: number;
  incorrect_topics?: string[];
}

export type AdaptiveAction = "advance" | "continue" | "review";

export interface AdaptiveRecommendation {
  action: AdaptiveAction;
  message: string;
  nextDifficulty?: Difficulty;
  reviewTopics?: string[];
  insertReviewStep?: boolean;
  newDifficulty?: Difficulty;
}

// Core adaptive learning algorithm
export function assessAndRecommend(
  assessment: QuizAssessment,
  currentDifficulty: Difficulty = "beginner",
  recentScores: number[] = []
): AdaptiveRecommendation {
  const score = assessment.quiz_score;
  const avgRecentScore = recentScores.length > 0
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    : score;

  // Check if student is improving
  const isImproving =
    recentScores.length >= 2 &&
    recentScores[recentScores.length - 1] > recentScores[0];

  // Algorithm
  if (score >= 80) {
    const nextDifficulty = getNextDifficulty(currentDifficulty);
    return {
      action: "advance",
      message: `Excellent work! You scored ${score}%. You're ready for ${nextDifficulty} material. 🚀`,
      nextDifficulty,
      newDifficulty: nextDifficulty,
    };
  }

  if (score >= 60 && score < 80) {
    const reviewTopics = assessment.incorrect_topics || getWeakTopics(score);
    return {
      action: "continue",
      message: `Good effort (${score}%)! Let's strengthen these areas: ${reviewTopics.join(", ")} before moving on.`,
      reviewTopics,
    };
  }

  if (score < 60) {
    return {
      action: "review",
      message: `You scored ${score}%. Let's review this concept together. A quick refresher will help! 📚`,
      insertReviewStep: true,
      newDifficulty: getPreviousDifficulty(currentDifficulty),
    };
  }

  return {
    action: "continue",
    message: `Keep practicing! Your current score is ${score}%.`,
  };
}

// Get next difficulty level
function getNextDifficulty(current: Difficulty): Difficulty {
  const progression: Record<Difficulty, Difficulty> = {
    beginner: "intermediate",
    intermediate: "advanced",
    advanced: "advanced", // Cap at advanced
  };
  return progression[current];
}

// Get previous difficulty level
function getPreviousDifficulty(current: Difficulty): Difficulty {
  const regression: Record<Difficulty, Difficulty> = {
    beginner: "beginner", // Floor at beginner
    intermediate: "beginner",
    advanced: "intermediate",
  };
  return regression[current];
}

// Identify weak topics from quiz performance
function getWeakTopics(score: number): string[] {
  const topicsMap: Record<string, number> = {
    fractions: score < 50 ? 1 : 0,
    decimals: score < 60 ? 1 : 0,
    percentages: score < 55 ? 1 : 0,
    algebra: score < 65 ? 1 : 0,
    geometry: score < 70 ? 1 : 0,
  };

  return Object.entries(topicsMap)
    .filter(([, weight]) => weight > 0)
    .map(([topic]) => topic);
}

// Check for inactivity (3+ days without activity)
export function checkInactivity(
  lastActivityDate: string,
  daysThreshold: number = 3
): boolean {
  const lastActivity = new Date(lastActivityDate);
  const today = new Date();
  const daysDiff = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDiff >= daysThreshold;
}

// Generate next recommended steps based on performance
export function generateNextRecommendations(
  plan: InterventionPlan,
  assessments: QuizAssessment[]
): string[] {
  if (assessments.length === 0) return [];

  const lastAssessment = assessments[assessments.length - 1];
  const recommendation = assessAndRecommend(lastAssessment, "beginner", assessments.map((a) => a.quiz_score));

  const recommendations: string[] = [];

  if (recommendation.action === "advance") {
    recommendations.push(
      `You're ready for ${recommendation.nextDifficulty} material in ${plan.subject}!`
    );
  } else if (recommendation.action === "review") {
    recommendations.push(`Review recommended for: ${recommendation.reviewTopics?.join(", ") || "foundational concepts"}`);
  } else {
    recommendations.push(`Continue practicing ${plan.subject}. You're making progress!`);
  }

  return recommendations;
}

// Predict if student will struggle with next level
export function predictNextLevelSuccess(
  recentScores: number[],
  targetDifficulty: Difficulty
): number {
  if (recentScores.length === 0) return 50; // Default 50% confidence

  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  // Simple heuristic: score above 75% = 80% confidence for next level
  // score 60-75% = 50% confidence
  // below 60% = 20% confidence
  if (avgScore >= 75) return 80;
  if (avgScore >= 60) return 50;
  return 20;
}

// Calculate engagement score (0-100) based on video watch time and quiz attempts
export function calculateEngagementScore(
  videoWatchPercent: number,
  quizAttempts: number,
  timeSpentMinutes: number
): number {
  const videoScore = videoWatchPercent; // 0-100
  const attemptScore = Math.min(quizAttempts * 20, 100); // 20 points per attempt, max 100
  const timeScore = Math.min(timeSpentMinutes * 2, 100); // 2 points per minute, max 100

  return Math.round((videoScore + attemptScore + timeScore) / 3);
}

// Get motivational message based on progress
export function getMotivationalMessage(
  engagementScore: number,
  trend: "improving" | "stable" | "declining"
): string {
  if (trend === "improving") {
    if (engagementScore >= 80) {
      return "🔥 You're crushing it! Keep up the amazing momentum!";
    }
    return "📈 Great work! You're making solid progress!";
  }

  if (trend === "declining") {
    return "📍 Let's get back on track! You've got this!";
  }

  if (engagementScore >= 70) {
    return "⭐ Consistent effort! Keep it up!";
  }

  return "💪 Every bit of effort counts. You're doing great!";
}

// Difficulty badge with visual indicator
export function getDifficultyBadge(difficulty: Difficulty): string {
  const badges: Record<Difficulty, string> = {
    beginner: "🌱 Beginner",
    intermediate: "⭐ Intermediate",
    advanced: "🚀 Advanced",
  };
  return badges[difficulty];
}
