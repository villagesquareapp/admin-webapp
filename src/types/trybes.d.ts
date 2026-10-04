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
