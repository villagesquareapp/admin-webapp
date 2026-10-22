interface IMeetingPerson {
  uuid: string | null;
  name: string | null;
  username: string | null;
  email: string | null;
  profile_picture: string | null;
}

interface IMeetingPmUsage {
  calls: number;
  failed: number;
  tts_chars: number;
  stt_seconds: number;
  llm_tokens: number;
  est_cost_usd: number;
}

interface IMeetingAssistantSettings {
  enabled: boolean;
  default_grace_min: number;
}

interface IMeetingsOverview {
  live_now: number;
  meetings_7_days: number;
  meetings_30_days: number;
  avg_duration_sec_30_days: number;
  attendees_30_days: number;
  latecomers_30_days: number;
  hosts: number;
  live: { uuid: string; code: string; title: string; started_at: string; host: IMeetingPerson; here_now: number }[];
  assistant: IMeetingAssistantSettings & { last_30_days: IMeetingPmUsage };
}

interface IMeetingListItem {
  uuid: string;
  code: string;
  title: string;
  status: "live" | "ended";
  started_at: string;
  ended_at: string | null;
  ended_by: "host" | "admin" | "system" | "replaced" | null;
  latecomer_check_in: boolean;
  duration_sec: number;
  host: IMeetingPerson;
  participant_count: number;
  late_count: number;
}

interface IMeetingParticipant {
  identity: string;
  display_name: string;
  role: "host" | "guest";
  user_id: string | null;
  joined_at: string;
  left_at: string | null;
  late: boolean;
  late_reason: string | null;
  pm_reply: string | null;
  duration_sec: number;
}

interface IMeetingDetail extends Omit<IMeetingListItem, "participant_count" | "late_count"> {
  host_id: string;
  starts_at: string | null;
  grace_min: number;
  participants: IMeetingParticipant[];
  assistant_usage: IMeetingPmUsage;
}

interface IMeetingHost {
  user_id: string;
  granted_by: string | null;
  granted_at: string;
  user: IMeetingPerson;
  meetings_count: number;
  live_meeting: string | null;
}

interface IMeetingAssistantUsage {
  days: number;
  by_day: (IMeetingPmUsage & { day: string; meetings: number })[];
  totals: IMeetingPmUsage;
}
