interface ITrybeType {
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_enabled: boolean;
  join_form: "campus" | "none";
  required_documents: ("id_front" | "id_back" | "selfie")[];
  poll_label: string | null;
  trybe_count?: number;
  created_at: string;
}

interface ITrybeListItem {
  uuid: string;
  name: string;
  slug: string;
  subtitle: string | null;
  tagline: string | null;
  avatar: string | null;
  status: "active" | "suspended" | "archived";
  member_count: number;
  post_count: number;
  pending_requests: number;
  created_at: string;
  type: { uuid: string; name: string; slug: string; join_form?: string; is_enabled?: boolean; poll_label?: string | null };
  institution: ITrybeInstitutionRef | null;
}

interface ITrybeInstitutionRef {
  uuid: string;
  name: string;
  short_name: string | null;
  kind: InstitutionKind;
  state: string | null;
  logo: string | null;
  is_active: boolean;
}

interface ITrybeAdminMember {
  uuid: string;
  name: string | null;
  username: string | null;
  profile_picture: string | null;
  role: "owner" | "admin" | "moderator" | "member";
  joined_at: string;
  intro: string | null;
}

interface ITrybeDetail extends ITrybeListItem {
  type_id: string;
  about: string | null;
  topics: string[];
  rules: string[];
  levels: string[];
  // What the join form offers: the institution kind's levels, or levels
  // while no institution is linked.
  levels_offered: string[];
  institution_id: string | null;
  cover: string | null;
  created_by_name: string | null;
  admins: ITrybeAdminMember[];
  featured_title: string | null;
  featured_body: string | null;
  featured_image: string | null;
  featured_by: string | null;
  featured_at: string | null;
}

interface ITrybePersonRef {
  uuid: string | null;
  name: string | null;
  username: string | null;
}

interface ITrybeEvent {
  uuid: string;
  title: string;
  cover: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  host_name: string;
  event_type: "physical" | "online";
  online_platform: "echo" | "livestream" | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  description: string | null;
  status: "active" | "cancelled";
  state: "upcoming" | "live" | "ended" | "cancelled";
  going_count: number;
  created_at: string;
  created_by: ITrybePersonRef;
}

interface ITrybeFile {
  uuid: string;
  deleted_at?: string | null;
  // Removed links can come back; a stored file's copy is deleted on removal.
  restorable?: boolean;
  kind: "document" | "image" | "video" | "link";
  name: string;
  url: string | null;
  thumbnail: string | null;
  link_url: string | null;
  mime: string | null;
  size_bytes: string | number | null;
  created_at: string;
  uploaded_by: ITrybePersonRef;
}

interface ITrybePoll {
  uuid: string;
  deleted_at?: string | null;
  question: string;
  options: { index: number; text: string; votes: number }[];
  total_votes: number;
  closes_at: string;
  is_open: boolean;
  created_at: string;
  created_by: ITrybePersonRef;
}

interface ICampusAnswers {
  full_name: string;
  matric_no: string;
  department: string;
  level: string;
}

interface ITrybeMember {
  uuid: string;
  name: string | null;
  username: string | null;
  email: string | null;
  profile_picture: string | null;
  role: ITrybeAdminMember["role"];
  status: "active" | "banned" | "left" | "removed";
  joined_at: string;
  ended_at: string | null;
  campus: ICampusAnswers | null;
  join_request_id: string | null;
  ended_by: { uuid: string; name: string | null; kind: "staff" | "trybe_admin" } | null;
  intro: string | null;
  last_seen_at: string | null;
  notifications_enabled: boolean;
  joined_via: "request" | "staff";
}

interface ITrybeMemberDetail extends Omit<ITrybeMember, "campus" | "join_request_id"> {
  account_status: string;
  requests: {
    uuid: string;
    status: ITrybeJoinRequest["status"];
    answers: ICampusAnswers;
    created_at: string;
    reviewed_at: string | null;
    reviewer_kind: "staff" | "trybe_admin" | null;
    rejection_reason: string | null;
  }[];
  posts: {
    total: number;
    top_level: number;
    recent: {
      uuid: string;
      caption: string | null;
      is_anonymous: boolean;
      status: string;
      parent_post_id: string | null;
      likes_count: number;
      replies_count: number;
      created_at: string;
    }[];
  };
  reports: {
    total: number;
    open: number;
    recent: { uuid: string; service_type: string; target_id: string; status: string; reason: string | null; created_at: string }[];
  };
}

interface ITrybeJoinRequest {
  uuid: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  answers: ICampusAnswers;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  code_accepted_at: string;
  documents_deleted_at: string | null;
  has_documents: boolean;
  trybe: { uuid: string; name: string; subtitle: string | null };
  // The list entry the typed department matched, if any.
  department: { uuid: string; name: string; field: string | null } | null;
  // Whether the matric number fits the institution's pattern (a hint only).
  matric_check: "ok" | "mismatch" | null;
  matric_example: string | null;
  user: {
    uuid: string;
    name: string | null;
    username: string | null;
    email: string | null;
    profile_picture: string | null;
    status: string;
  };
  reviewer: { uuid: string; name: string | null; kind: "staff" | "trybe_admin" } | null;
}

interface ITrybeJoinRequestDetail extends ITrybeJoinRequest {
  same_matric_no: {
    uuid: string;
    status: ITrybeJoinRequest["status"];
    created_at: string;
    user: { uuid: string; name: string | null; username: string | null };
  }[];
  other_requests: {
    uuid: string;
    status: ITrybeJoinRequest["status"];
    created_at: string;
    rejection_reason: string | null;
  }[];
  document_views: { viewed_at: string; viewer_kind: string; viewer_name: string | null }[];
}

interface ITrybeDocumentLinks {
  id_front: string | null;
  id_back: string | null;
  selfie: string | null;
  expires_in: number;
}

type InstitutionKind =
  | "university"
  | "polytechnic"
  | "college_of_education"
  | "college_of_health"
  | "college_of_nursing"
  | "monotechnic"
  | "other";

interface IInstitution {
  uuid: string;
  name: string;
  short_name: string | null;
  slug: string;
  kind: InstitutionKind;
  ownership: "federal" | "state" | "private" | null;
  country: string;
  state: string | null;
  city: string | null;
  lga: string | null;
  address: string | null;
  website: string | null;
  year_founded: number | null;
  email_domains: string[];
  logo: string | null;
  matric_example: string | null;
  matric_pattern: string | null;
  regulator: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trybe: { uuid: string; name: string; status: ITrybeListItem["status"]; avatar: string | null; member_count: number } | null;
  pending_requests: number | null;
}

interface IInstitutionDetail extends IInstitution {
  levels: string[];
  created_by_name: string | null;
}

interface IInstitutionSummary {
  total: number;
  active: number;
  linked: number;
  by_kind: { kind: InstitutionKind; total: number; linked: number }[];
  by_state: { state: string | null; total: number }[];
}

interface IDepartment {
  uuid: string;
  name: string;
  field: string | null;
  aliases: string[];
  applies_to: InstitutionKind[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  request_count: number;
}

interface IDepartmentDetail extends IDepartment {
  typed: { answer: string; requests: number }[];
}

interface IUnmatchedDepartment {
  key: string;
  answer: string;
  requests: number;
  trybes: number;
  last_seen_at: string;
  suggestions: { uuid: string; name: string; score: number }[];
}

interface ILevel {
  uuid: string;
  name: string;
  group: string;
  applies_to: InstitutionKind[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  request_count?: number;
  trybe_count?: number;
}

interface ITrybeCodeItem {
  title: string;
  body: string;
}

interface ITrybeCode {
  items: ITrybeCodeItem[];
  is_default: boolean;
  updated_at: string | null;
}

interface ITrybePersonCard {
  uuid: string;
  name: string | null;
  username: string | null;
  profile_picture: string | null;
}

// A post, video, live session or product in a Trybe, as staff see it.
interface ITrybeModerationItem {
  uuid: string;
  // live only: which kind of session
  kind?: "echo" | "livestream";
  caption?: string | null;
  title?: string | null;
  status?: string;
  created_at: string;
  deleted_at?: string | null;
  author?: ITrybePersonCard;
  host?: ITrybePersonCard;
  seller?: ITrybePersonCard;
  thumbnail?: string | null;
  image?: string | null;
  cover?: string | null;
  is_anonymous?: boolean;
  parent_post_id?: string | null;
  category?: { id: number; name: string } | null;
  likes_count?: number;
  replies_count?: number;
  views_count?: number;
  comments_count?: number;
  audience?: number;
  started_at?: string | null;
  scheduled_for?: string | null;
  price?: string | number;
  currency?: string | null;
  currency_symbol?: string | null;
  shop?: { uuid: string; name: string } | null;
  open_reports: number;
  moderation: { action: "remove_content" | "restore_content"; at: string; reason: string | null; by: string | null } | null;
  state: "active" | "taken_down" | "deleted" | "limited";
}

interface ITrybeCount {
  total: number;
  last_7_days: number;
}

interface ITrybeOverview {
  members: {
    active: number;
    joined_7_days: number;
    joined_30_days: number;
    left_7_days: number;
    left_30_days: number;
    visited_7_days: number;
    bell_on: number;
    banned: number;
    last_joined_at: string | null;
  };
  requests: {
    pending: number;
    oldest_pending_at: string | null;
    approved_30_days: number;
    rejected_30_days: number;
    median_review_hours: number | null;
  };
  content: Record<"posts" | "videos" | "echoes" | "livestreams" | "products" | "events" | "files" | "polls", ITrybeCount>;
  open_reports: number;
  last_post_at: string | null;
  most_active_members: { user: ITrybePersonCard; posts: number; last_post_at: string }[];
}

interface ITrybeBrief {
  uuid: string;
  name: string;
  avatar: string | null;
  member_count: number;
}

interface ITrybesOverview {
  members: number;
  joined_7_days: number;
  pending_requests: number;
  oldest_pending_at: string | null;
  open_reports: number;
  campus_without_institution: number;
  posts_7_days: number;
  trybes_by_status: { status: string; total: number }[];
  most_active: (ITrybeBrief & { posts_7_days: number })[];
  biggest: ITrybeBrief[];
  most_waiting: { uuid: string; name: string; avatar: string | null; pending: number; oldest_at: string }[];
}

type TrybeAuditCategory = "staff" | "content" | "requests" | "people" | "photos";

interface ITrybeAuditEntry {
  at: string;
  category: TrybeAuditCategory;
  action: string;
  reason: string | null;
  metadata: Record<string, any> | null;
  actor: { kind: "staff" | "trybe_admin"; uuid: string | null; name: string | null };
  subject: { uuid: string; name: string | null; username: string | null } | null;
}

interface ITrybePushSent {
  sent_at: string;
  sent_by: string | null;
  kind: "message" | "announcement";
  title: string | null;
  body: string | null;
  recipients: number;
}

interface ITrybeBroadcasts {
  allowed: boolean;
  sent_last_day: number;
  per_day: number;
  per_hour: number;
  next_allowed_at: string | null;
  // How many members would get a push now (bell on).
  recipients: number;
  sent: ITrybePushSent[];
}
