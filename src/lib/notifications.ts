import toast from "react-hot-toast";

export type NotificationType =
  | "plan_assigned"
  | "step_completed"
  | "plan_completed"
  | "grade_improved"
  | "inactivity_reminder";

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  channels: ("in-app" | "push" | "sms")[];
  read: boolean;
  read_at?: string;
  created_at: string;
  action_url?: string;
}

// Notification templates
const templates: Record<
  NotificationType,
  (metadata?: Record<string, any>) => { title: string; message: string }
> = {
  plan_assigned: (meta) => ({
    title: `New ${meta?.subject || "Learning"} Plan`,
    message: `A new personalized learning plan has been assigned: ${meta?.subject || "subject"}. Knowledge gap: ${meta?.gap || "improvement needed"}.`,
  }),
  step_completed: (meta) => ({
    title: "Step Progress",
    message: `${meta?.student_name || "Your child"} completed step ${meta?.step_number || 0}/${meta?.total_steps || 0} of ${meta?.subject || "the plan"}.`,
  }),
  plan_completed: (meta) => ({
    title: "Plan Completed! 🎉",
    message: `${meta?.student_name || "Your child"} successfully completed the ${meta?.subject || ""} intervention plan!${meta?.grade_improved ? ` Grade improved to ${meta.grade_improved}%.` : ""}`,
  }),
  grade_improved: (meta) => ({
    title: "Grade Improvement",
    message: `Great news! ${meta?.student_name || "Your child"} improved in ${meta?.subject || "a subject"} from ${meta?.old_grade || "—"}% to ${meta?.new_grade || "—"}%.`,
  }),
  inactivity_reminder: (meta) => ({
    title: "Time to Study!",
    message: `${meta?.student_name || "Your child"} hasn't worked on the ${meta?.subject || ""} plan in 3 days. Let's get back on track!`,
  }),
};

export function createNotification(
  type: NotificationType,
  recipientId: string,
  metadata?: Record<string, any>,
  channels: ("in-app" | "push" | "sms")[] = ["in-app"]
): Notification {
  const template = templates[type];
  const { title, message } = template(metadata);

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    recipient_id: recipientId,
    type,
    title,
    message,
    metadata,
    channels,
    read: false,
    created_at: new Date().toISOString(),
  };
}

// In-app toast notification
export function showInAppNotification(notification: Notification) {
  const icon =
    notification.type === "plan_completed"
      ? "🎉"
      : notification.type === "grade_improved"
      ? "📈"
      : notification.type === "step_completed"
      ? "✅"
      : "📢";

  toast.success(`${icon} ${notification.title}\n${notification.message}`, {
    duration: 5000,
    position: "top-right",
  });
}

// Browser push notification (if permitted)
export async function showBrowserPush(notification: Notification) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/logo.png",
    });
  }
}

// SMS notification (via Hubtel - requires backend integration)
export async function sendSMS(
  phoneNumber: string,
  message: string,
  smsBalance: number
): Promise<boolean> {
  if (smsBalance < 1) {
    console.warn("Insufficient SMS credit");
    return false;
  }

  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        message,
        provider: "hubtel",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("SMS send failed:", error);
    return false;
  }
}

// Request browser push permission
export function requestPushPermission() {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }

  return Notification.permission === "granted";
}

// Debounce rapid notifications (e.g., multiple step completions)
const notificationQueue: Map<string, Notification> = new Map();
const debounceTimer: Map<string, NodeJS.Timeout> = new Map();

export function debounceNotification(
  notification: Notification,
  delayMs: number = 3000
) {
  const key = `${notification.recipient_id}-${notification.type}`;

  if (debounceTimer.has(key)) {
    clearTimeout(debounceTimer.get(key));
  }

  notificationQueue.set(key, notification);

  const timer = setTimeout(() => {
    const queued = notificationQueue.get(key);
    if (queued) {
      showInAppNotification(queued);
      notificationQueue.delete(key);
      debounceTimer.delete(key);
    }
  }, delayMs);

  debounceTimer.set(key, timer);
}

// Check for inactivity (3+ days without activity)
export function checkInactivity(lastActivityDate: string, daysThreshold: number = 3): boolean {
  const lastActivity = new Date(lastActivityDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff >= daysThreshold;
}
