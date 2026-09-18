interface IApiMessage {
  error?: string;
}

interface ApiResponse<T = any> {
  success?: boolean;
  status?: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

// interface IUser {
//   id: string;
//   email: string;
// }

interface IJsonSettingsValue {
  [key: string]: any;
}

interface ISettings {
  uuid: string;
  name: string;
  value_type: "boolean" | "string" | "json";
  value: boolean | string | IJsonSettingsValue;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ISettingsResponse extends ApiResponse<ISettings> {}

interface IUserTableDetails {
  profile_picture: string;
  name: string;
  username: string;
  email: string;
  last_online?: string | null;
  premium?: boolean;
  check_mark?: boolean;
}

interface IAuthResponse {
  accessToken: string;
  user: IUser;
}

interface IGifts {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface IUserWithToken {
  token: string;
  user: IUser;
}

interface IUserstat {
  total_users: number;
  today_new_users: number;
  today_active_users: number;
  logged_in_users: number;
  reported_users: number;
  verified_users: number;
}
interface IVerifiedUserstat {
  total_verified_users: number;
  total_active_subscribers: number;
  greencheck_verified_users: number;
  greencheck_active_subscribers: number;
  premium_verified_users: number;
  premium_active_subscribers: number;
}

interface IReportStats {
  total_reports: number;
  total_user_reports: number;
  total_post_reports: number;
  total_echo_reports: number;
  total_live_stream_reports: number;
  total_marketplace_reports: number;
  total_comment_reports: number;
}

interface IPostStats {
  total_posts: number;
  total_image_posts: number;
  today_posts: number;
  reported_posts: number;
  total_likes: number;
  ios_posts: number;
  android_posts: number;
}

interface IPostOverview {
  kpis: {
    total: number;
    active: number;
    taken_down: number;
    shadow_limited: number;
    open_reports: number;
    in_review: number;
    today: number;
  };
  by_status: Record<string, number>;
  by_reason: { reason: string; count: number }[];
  trends: { date: string; posts: number; reports: number }[];
  engagement: { likes: number; replies: number; shares: number; views: number };
  media_mix: { image: number; video: number; text: number };
  funnel: { received: number; open: number; in_review: number; resolved: number; dismissed: number };
  top_posts: IPosts[];
  reported_posts: IPosts[];
  recent_actions: IEnforcementAction[];
}

interface IAuthorRisk {
  uuid: string;
  name: string;
  username: string;
  profile_picture: string;
  status: string;
  strike_count: number;
  suspended_until: string | null;
  created_at: string;
}

interface IPostQueueRow extends IPosts {
  author_risk: IAuthorRisk | null;
  report_count: number;
  first_reported: string;
  last_reported: string;
  top_reason: string;
  priority: number;
}

interface IPostQueueResponse extends IPaginatedResponse<IPostQueueRow> {}

interface IEnforcementAction {
  uuid: string;
  action: string;
  service_type?: string;
  target_id: string | null;
  target_user_id: string | null;
  report_id?: string | null;
  admin_id?: string | null;
  reason: string | null;
  result: string;
  created_at: string;
}

interface IEnforcementResponse extends IPaginatedResponse<IEnforcementAction> {}

interface IPostDetailReport {
  uuid: string;
  status: string;
  reason: string;
  note?: string | null;
  reporter: { uuid: string; name: string; username: string } | null;
  created_at: string;
}

interface IPostDetailHistory {
  uuid: string;
  action: string;
  scope: "content" | "author";
  reason: string | null;
  result: string;
  admin_id: string | null;
  created_at: string;
}

interface IPostSnapshot {
  uuid: string;
  caption: string;
  status: string;
  is_duplicate: boolean;
  deleted_at: string | null;
  created_at: string;
  media: IMedia[];
  user: { uuid: string; name: string; username: string; profile_picture: string } | null;
  is_current?: boolean;
}

interface IPostThread {
  root_id: string;
  is_root: boolean;
  part_count: number;
  reply_count: number;
  parts: IPostSnapshot[];
}

interface IPostReply extends IPostSnapshot {
  likes_count: number;
  replies_count: number;
}

interface IPostDetail {
  // NOTE: the Admin API deep-snake-cases response keys, so this is post_details
  // (not postDetails) and nested dates are created_at / updated_at.
  post_details: {
    uuid: string;
    status: string;
    is_duplicate: boolean;
    deleted_at: string | null;
    trybe_id: string | null;
    post_type: "single" | "thread" | "reply" | "quote";
    is_reply: boolean;
    is_quote: boolean;
    thread: IPostThread;
    parent: IPostSnapshot | null;
    quoted: IPostSnapshot | null;
    metrics: {
      likes: number;
      replies: number;
      shares: number;
      views: number;
      impressions: number;
      unique_views: number;
      clicks: number;
      engagements: number;
      report_count: number;
      open_report_count: number;
      address: string;
      privacy: string;
      created_at: string;
      updated_at: string;
    };
    author: IAuthorRisk | null;
    content: { caption: string; media: IMedia[] };
    reports: IPostDetailReport[];
    history: IPostDetailHistory[];
    replies: IPostReply[];
  };
}

interface IAtcStats {
  episodes: {
    total: number;
    active: number;
  };
  applications: {
    overall: {
      total: number;
      pending: number;
      approved: number;
      declined: number;
    };
    period: {
      label: string;
      total: number;
      pending: number;
      approved: number;
      declined: number;
    };
  };
  engagement: {
    total_votes: number;
    total_likes: number;
    total_comments: number;
  };
}

interface ISuggestion {
  uuid: string;
  name: string;
  description: string;
  status: string;
  target_month: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface IKeyInformation {
  icon: string;
  text: string;
}

interface IRequirement {
  icon: string;
  text: string;
}

interface ITimeline {
  title: string;
  date: string;
}

interface IEpisode {
  uuid: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "completed";
}

interface IATCChallengeInfo {
  period: string;
  episode: IEpisode;
  key_information: IKeyInformation[];
  requirements: IRequirement[];
  timelines: ITimeline[];
}

interface IATCChallengeInfoResponse {
  status: boolean;
  message: string;
  data: IATCChallengeInfo;
}

interface IATCData {
  approved: boolean;
  current_month: {
    value: string;
    label: string;
  };
  suggestion: ISuggestion;
}

interface IMarketSquareStats {
  total_products: number;
  today_products: number;
  total_shops: number;
  reported_products: number;
}

interface IEchoStats {
  total_echoes: number;
  new_echoes: number;
  live_echoes: number;
  total_participants: number;
  total_gifts: number;
}

interface ILivestreamCategory {
  id: number;
  name: string;
  icon: string;
  icon_id: string;
  description: string;
  status?: boolean;
  streams_count?: number;
  created_at: string;
  updated_at: string;
}

interface ITopPerformanceCategory {
  id: number;
  name: string;
  icon: string;
  icon_id: string;
  description: string;
  streams_count: number;
}

interface ILivestreamCategoryResponse {
  categories: ILivestreamCategory[];
}

interface ILivestreamStats {
  total_livestreams: number;
  new_livestreams: number;
  currently_live: number;
  total_gifts?: number;
}

interface IOverviewData {
  total: number;
  icon: string;
  bgcolor: string;
  shape: StaticImageData;
  title: string;
  link?: string;
  activeSubscribers?: number;
}

interface IPaginatedResponse<T> {
  current_page?: string;
  data: T[];
  per_page?: number;
  total?: number;
  last_page?: number;
}

interface IUserPost {
  caption: string;
  likes_count: string;
  comments_count: string;
  shares_count: string;
  views_count: string;
  created_at: string;
}

interface IUserWallet {
  balance: string;
  new_gifts_count: number;
  status: string;
}

interface IGetExchangeRate {
  usd_value: string;
  cowry_value: string;
}

interface IGetCowryTopupMetadata {
  payment_event: string;
  payment_user_id: string;
}

interface IUserSummary {
  uuid: string;
  name: string;
  username: string;
  email: string;
  verified_status: number;
  checkmark_verification_status: boolean;
  premium_verification_status: boolean;
  profile_picture: string;
  online: boolean;
  verification_badge: string;
}

interface IUser {
  user_details: {
    profile: {
      id: string;
      username: string;
      name: string;
      email: string;
      phone: string | null;
      address: {
        city: string;
        country: string;
        address: string;
        timezone: string;
      };
      gender: string;
      date_of_birth: string;
      profession: string;
      bio: string;
      last_online: string | null;
      status:
        | "active"
        | "suspended"
        | "disabled"
        | "reported"
        | "flagged"
        | "banned"
        | "shadow_hidden"
        | "archived";
      verified_status: number;
      profile_picture: string;
      profile_banner: string;
      followers: number;
      following: number;
      posts_count: number;
      is_private: boolean;
      check_mark: boolean;
      premium: boolean;
      online: boolean;
      verification_badge: string;
      account_type: string;
      registration_type: string;
      referral_code?: string;
      referral_count?: number;
      created_at: string;
    };
    shop: {
      logo: string;
      number_of_products: number;
      number_of_orders: number;
    };
    posts: IUserPost[];
    wallet: IUserWallet[];
  };
  actions?: any;
}

interface IUsersResponse extends IPaginatedResponse<IUser> {}

interface IUserLite {
  uuid: string;
  name: string;
  username: string;
  email: string;
  profile_picture: string;
  status: string;
  account_type: string;
  registration_type: string;
  verification_badge: string;
  online: boolean;
  created_at: string;
  report_count?: number;
}

interface IUserOverview {
  kpis: {
    total: number;
    active: number;
    new_7d: number;
    verified: number;
    online: number;
    suspended: number;
    banned: number;
    flagged: number;
    open_reports: number;
  };
  by_status: Record<string, number>;
  by_account_type: Record<string, number>;
  recent_signups: IUserLite[];
  reported_users: IUserLite[];
}

interface IUserDetail {
  user_details: {
    profile: IUser["user_details"]["profile"];
    content_counts: {
      posts: number;
      echoes: number;
      livestreams: number;
      followers: number;
      following: number;
    };
    moderation: {
      status: string;
      strike_count: number;
      suspended_until: string | null;
      moderation_reason: string | null;
      moderated_by: string | null;
      moderated_at: string | null;
      report_count: number;
      open_report_count: number;
    };
    reports: IPostDetailReport[];
    history: {
      uuid: string;
      action: string;
      service_type?: string;
      scope: "account" | "content";
      reason: string | null;
      result: string;
      admin_id: string | null;
      created_at: string;
    }[];
    shop: null | { logo?: string };
    coin_wallet: { balance: number; newGiftsCount?: number; status?: string }[];
    cowry_wallet: { balance: number; newGiftsCount?: number; status?: string; currency?: string }[];
  };
}

interface IVerifiedUsers {
  uuid: string;
  name: string;
  username: string;
  email: string;
  registration_type: string;
  account_type: string;
  phone_number: string | null;
  profile_picture: string;
  cover_photo: string;
  gender: string;
  dob: string;
  country: string;
  city: string;
  profession: string;
  bio: string;
  timezone: string;
  verified_status: number;
  checkmark_verification_status: boolean;
  premium_verification_status: boolean;
  verification_badge: string;
  online: boolean;
  last_online: string | null;
  is_private: boolean;
  has_two_factor_auth: boolean;
  status:
    | "active"
    | "suspended"
    | "disabled"
    | "reported"
    | "flagged"
    | "banned"
    | "shadow_hidden"
    | "archived";
  address: string;
  latitude: string;
  longitude: string;
  referrer: string | null;
  websocket_url: string;
  referral_code: string;
  referral_count: number;
  can_reset_password: boolean;
  has_received_reg_bonus_from_vs: boolean;
  has_rated_ios: boolean;
  has_rated_android: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IVerifiedUsersResponse extends IPaginatedResponse<IVerifiedUsers> {}

interface IAdminUsers {
  uuid: string;
  email: string;
  name: string;
  is_active: boolean;
  is_super_admin: boolean;
  role: string;
  status:
    | "active"
    | "suspended"
    | "disabled"
    | "reported"
    | "flagged"
    | "banned"
    | "shadow_hidden"
    | "archived";
  created_at: string;
  updated_at: string;
}

interface IRandomUsers {
  uuid: string;
  name: string;
  username: string;
  email: string;
  registration_type: string;
  account_type: string;
  phone_number: string | null;
  profile_picture: string;
  cover_photo: string | null;
  gender: string | null;
  dob: string | null;
  country: string | null;
  city: string | null;
  profession: string | null;
  bio: string | null;
  timezone: string;
  verified_status: 0;
  checkmark_verification_status: boolean;
  premium_verification_status: boolean;
  online: boolean;
  last_online: string | null;
  is_private: boolean;
  has_two_factor_auth: boolean;
  status: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  referrer: string | null;
  websocket_url: string;
  referral_code: string;
  referral_count: number;
  can_reset_password: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IRandomUsersResponse extends IPaginatedResponse<IRandomUsers> {}

interface IBillingPlan {
  uuid: string;
  code: string;
  name: string;
  description: string;
  benefits: string[];
  requirements: string[];
  type: string;
  price: string;
  currency: string;
  duration_days: number;
  badge_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IUserStatusList {
  name: string;
  value: string;
}
interface IPostStatusList {
  name: string;
  value: string;
}

interface IUserStatusListResponse extends IPaginatedResponse<IUserStatusList> {}

interface IMedia {
  thumbnail: string;
  url: string;
  type: "image" | "video";
}

interface IPosts {
  uuid: string;
  caption: string;
  parent_post_id: string | number;
  root_post_id: string;
  quote_post_id: string | null;
  thread_id: string;
  status:
    | "active"
    | "suspended"
    | "disabled"
    | "reported"
    | "flagged"
    | "banned"
    | "shadow_hidden"
    | "archived";
  views_count: number;
  shares_count: number;
  likes_count: number;
  replies_count: number;
  is_duplicate?: boolean;
  report_count?: number;
  is_reply?: boolean;
  is_quote?: boolean;
  in_thread?: boolean;
  thread_part_count?: number;
  post_type?: "single" | "thread" | "reply" | "quote";
  created_at: string;
  user: {
    uuid: string;
    name: string;
    username: string;
    email: string;
    registration_type: string;
    account_type: string;
    phone_number: string | null;
    profile_picture: string;
    cover_photo: string;
    gender: string;
    dob: string | null;
    country: string;
    city: string;
    profession: string;
    bio: string;
    timezone: string;
    verified_status: number;
    online: boolean;
    last_online: string | null;
    is_private: boolean;
    has_two_factor_auth: boolean;
    status: string;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    referrer: string | null;
    referral_code: string;
    referral_count: number;
    can_reset_password: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  media: IMedia[];
  actions?: any;
}

interface IPostResponse extends IPaginatedResponse<IPosts> {}

interface ILivestreams {
  uuid: string;
  title: string;
  cover: string;
  status: EchoStatus;
  privacy: string;
  orientation: string;
  users: number;
  gifts: number;
  likes: number;
  diamonds: number;
  cowries_earned: number;
  comments_count: number;
  shares_count: number;
  duration: number;
  created_at: string;
  host: IEchoHostLite | null;
  category: IEchoCategoryLite | null;
  report_count?: number;
  actions?: any;
}

interface ILivestreamStatusList {
  name: string;
  value: string;
}

interface ILivestreamOverview {
  kpis: {
    total: number;
    live: number;
    scheduled: number;
    ended: number;
    total_viewers: number;
    total_gifts: number;
    open_reports: number;
    today: number;
  };
  by_status: Record<string, number>;
  by_category: { name: string; count: number }[];
  engagement: { viewers: number; gifts: number; likes: number; comments: number; shares: number; diamonds: number; cowries: number };
  live_now: ILivestreams[];
  top_streams: ILivestreams[];
  reported_streams: ILivestreams[];
}

interface ILivestreamDetail {
  stream_details: {
    uuid: string;
    title: string;
    cover: string;
    status: EchoStatus;
    privacy: string;
    orientation: string;
    category: IEchoCategoryLite | null;
    settings: {
      comments_enabled: boolean;
      questions_enabled: boolean;
      gifting_enabled: boolean;
      requests_enabled: boolean;
    };
    timing: {
      start_datetime: number;
      end_datetime: number;
      start_date: string;
      start_time: string;
      duration_minutes: number;
      created_at: string;
    };
    metrics: {
      viewers: number;
      gifts: number;
      likes: number;
      diamonds: number;
      cowries_earned: number;
      comments_count: number;
      shares_count: number;
      avg_watch_time_seconds: number;
      new_followers: number;
      report_count: number;
      open_report_count: number;
    };
    host: IEchoHostLite | null;
    reports: IPostDetailReport[];
    actions: { can_force_end: boolean };
  };
}

interface ILivestreamResponse extends IPaginatedResponse<ILivestreams> {}

interface IEchoHostLite {
  uuid: string;
  name: string;
  username: string;
  profile_picture: string;
}

interface IEchoCategoryLite {
  id: number;
  name: string;
}

type EchoStatus = "live" | "scheduled" | "ended" | "saved";

interface IEchoes {
  uuid: string;
  title: string;
  cover: string;
  status: EchoStatus;
  privacy: string;
  is_recurring: boolean;
  users: number;
  peak_listener_count: number;
  total_listeners_ever: number;
  total_gifts: number;
  total_likes: number;
  total_reactions: number;
  duration: number;
  duration_seconds: number;
  has_replay: boolean;
  start_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  host: IEchoHostLite | null;
  category: IEchoCategoryLite | null;
  report_count?: number;
  actions?: any;
}

interface IEchosResponse extends IPaginatedResponse<IEchoes> {}

interface IEchoStatusList {
  name: string;
  value: string;
}

interface IEchoCategory {
  id: number;
  name: string;
  icon?: string;
  echoes_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface IEchoOverview {
  kpis: {
    total: number;
    live: number;
    scheduled: number;
    ended: number;
    total_listeners: number;
    total_gifts: number;
    open_reports: number;
    today: number;
  };
  by_status: Record<string, number>;
  by_category: { name: string; count: number }[];
  engagement: { listeners: number; gifts: number; reactions: number; likes: number; chat: number };
  live_now: IEchoes[];
  top_echoes: IEchoes[];
  reported_echoes: IEchoes[];
}

interface IEchoParticipant {
  uuid: string;
  name: string;
  username: string;
  profile_picture: string;
  role: string;
  status: string;
}

interface IEchoDetail {
  echo_details: {
    uuid: string;
    title: string;
    description: string | null;
    cover: string;
    status: EchoStatus;
    privacy: string;
    is_recurring: boolean;
    recurrence_pattern: string | null;
    category: IEchoCategoryLite | null;
    settings: {
      chat_enabled: boolean;
      request_to_speak_enabled: boolean;
      questions_enabled: boolean;
      gifting_enabled: boolean;
      recording_enabled: boolean;
    };
    timing: {
      start_at: string | null;
      started_at: string | null;
      ended_at: string | null;
      duration_seconds: number;
      created_at: string;
    };
    metrics: {
      peak_listener_count: number;
      unique_listener_count: number;
      total_listeners_ever: number;
      average_listen_time_seconds: number;
      total_reactions: number;
      total_chat_messages: number;
      total_gifts: number;
      gift_revenue_ngn: number;
      total_likes: number;
      report_count: number;
      open_report_count: number;
    };
    replay: { url: string; duration_seconds: number; views: number; hours_watched: number } | null;
    host: IEchoHostLite | null;
    speakers: IEchoParticipant[];
    listeners: IEchoParticipant[];
    room_bans: {
      user: { uuid: string; name: string; username: string } | null;
      banned_by: { uuid: string; name: string } | null;
      reason: string | null;
      created_at: string;
    }[];
    reports: IPostDetailReport[];
    actions: { can_force_end: boolean };
  };
}

interface IMarketProduct {
  uuid: string;
  name: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface IMarketSquareShops {
  uuid: string;
  name: string;
  logo: string;
  tagline: string | null;
  website: string | null;
  location: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  products: IMarketProduct[];
  actions?: any;
}

interface IMarketSquareShopsResponse extends IPaginatedResponse<IMarketSquareShops> {}

interface ITickerUser {
  name: string;
  username: string;
  email: string;
  profile_picture: string;
}

interface ITicketstat {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

interface ITicket {
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  user: ITickerUser;
  actions?: any;
}

interface ITicketResponse extends IPaginatedResponse<ITicket> {}

interface IGifting {
  uuid: string;
  name: string;
  icon: string | "fewfee";
  value: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IGiftingResponse extends IPaginatedResponse<IGifting> {}

interface ICoins {
  uuid: string;
  name: string;
  amount: string;
  price: string;
  in_app_purchase_id: string;
  tag: string | null;
  description: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ICoinsResponse extends IPaginatedResponse<ICoins> {}

interface IComment {
  text: string;
  user: {
    name: string;
    profile_picture: string;
    created_at: string;
    updated_at: string;
  };
  likes: number;
  created_at: string;
  updated_at: string;
}

interface ISinglePost {
  post_details: {
    metrics: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
      address: string;
      privacy: string;
      created_at: string;
      updated_at: string;
    };
    user: {
      name: string;
      profile_picture: string;
      created_at: string;
      updated_at: string;
    };
    content: {
      caption: string;
      media: IMedia[];
    };
    comments: IComment[];
  };
}

interface IReportUser {
  uuid: string;
  name: string;
  username: string;
  email: string;
  registration_type: string;
  account_type: string;
  phone_number: string | null;
  profile_picture: string;
  cover_photo: string;
  gender: string;
  dob: string;
  country: string;
  city: string;
  profession: string;
  bio: string | null;
  timezone: string;
  verified_status: number;
  online: boolean;
  last_online: string | null;
  is_private: boolean;
  has_two_factor_auth: boolean;
  status: string;
  address: string;
  latitude: string;
  longitude: string;
  referrer: string | null;
  referral_code: string;
  referral_count: number;
  can_reset_password: boolean;
  checkmark_verification_status: boolean;
  premium_verification_status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IReportActionDetails {
  resolved_at?: string;
  resolved_by?: string;
  resolved_reason?: string;
  resolution_methods?: string[];
  dismissed_at?: string;
  dismissed_by?: string;
  dismissed_reason?: string;
}

interface IReport {
  id: string;
  reporter_id: string;
  reported_id?: string;
  reason: string;
  report_service_type: string;
  status?: "open" | "in_review" | "resolved" | "dismissed";
  handled_by?: string | null;
  action_details?: IReportActionDetails | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  reporter?: IReportUser;
  reported_user?: IReportUser;
  reason_ref?: { title: string; description?: string } | null;
}

interface IReportResponse extends IPaginatedResponse<IReport> {}

interface IWithdrawalUser {
  uuid: string;
  name: string;
  username: string;
  email: string;
  profile_picture: string;
}

interface IPaystackBalance {
  usd_value: {
    balance: string;
  };
  ngn_value: {
    balance: string;
  };
}

interface ICowryBalance {
  cowry_value: {
    balance: string;
  };
  usd_value: {
    balance: string;
  };
  ngn_value: {
    balance: string;
  };
}

interface IRecentTransfer {
  fullname: string;
  username: string;
  email: string;
  amount: string;
  date_transferred: string;
}

interface IRecentTransferResponse extends IPaginatedResponse<IRecentTransfer> {}

interface IPendingWithdrawals {
  uuid: string;
  amount: number;
  transaction_type: string;
  transaction_category: string;
  transaction_status: string;
  payment_provider: string;
  description: string;
  reference_id: string;
  created_at: string;
  metadata: {
    fee_cowry: number;
    amount_usd: number;
    amount_cowry: number;
    withdrawal_id: string;
    payment_provider: string;
    withdrawal_method: string;
    withdrawal_init_data: {
      payout_kobo: number;
      naira_amount: string;
      payout_naira: string;
      fixed_fee_naira: string;
      overall_fee_usd: string;
      overall_fee_cowry: string;
      overall_fee_naira: string;
      total_spread_fee_naira: string;
      original_rate_naira_per_usd: string;
      discounted_rate_naira_per_usd: string;
    };
  };
  fees: {
    overall_fee_cowry: string;
    payout_kobo: number;
  };
  user: {
    uuid: string;
    email: string;
    username: string;
    profile_picture: string;
    name: string;
  };
  cowry_balance: number;
  last_withdrawal: {
    amount: number;
    date: string;
  };
}

interface IPendingWithdrawalsResponse extends IPaginatedResponse<IPendingWithdrawals> {}

interface IPendingVerification {
  uuid: string;
  user_id: string;
  subscription_id: string;
  status: string;
  admin_comments: string;
  current_stage: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: {
    uuid: string;
    name: string;
    username: string;
    email: string;
    verified_status: number;
    checkmark_verification_status: boolean;
    premium_verification_status: boolean;
    profile_picture: string;
    online: boolean;
    verification_badge: string;
  };
  subscription: {
    uuid: string;
    user_id: string;
    plan_id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    payment_channel: string;
    payment_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    plan: {
      uuid: string;
      code: string;
      name: string;
      description: string;
      benefits: string[];
      requirements: string[];
      type: string;
      price: string;
      currency: string;
      duration_days: number;
      badge_type: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
  };
  duration_since_joining: string;
}

interface IPendingVerificationResponse extends IPaginatedResponse<IPendingVerification> {}

interface IVerificationDocument {
  uuid: string;
  user_id: string;
  document_type: string;
  document_url: string;
  rejection_reason: string | null;
  verification_request_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IVerificationRequested {
  uuid: string;
  user_id: string;
  subscription_id: string;
  status: string;
  admin_comments: string;
  current_stage: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  user: {
    uuid: string;
    name: string;
    username: string;
    email: string;
    verified_status: number;
    checkmark_verification_status: boolean;
    premium_verification_status: boolean;
    profile_picture: string;
    online: boolean;
    verification_badge: string;
  };
  subscription: {
    uuid: string;
    user_id: string;
    plan_id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    payment_channel: string;
    payment_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    plan: {
      uuid: string;
      code: string;
      name: string;
      description: string;
      benefits: string[];
      requirements: string[];
      type: string;
      price: string;
      currency: string;
      duration_days: number;
      badge_type: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    payment: {
      uuid: string;
      user_id: string;
      amount: string;
      status: string;
      fee: string;
      net_amount: string;
      currency: string;
      metadata: {
        plan_id: string;
        payment_data: {
          fee: number;
          total: number;
          base_amount: number;
          total_in_kobo: number;
        };
        payment_event: string;
        payment_user_id: string;
        subscription_id: string;
      };
      provider: string;
      provider_reference: string;
      category: string;
      provider_response: {
        id: number;
        log: {
          input: [];
          errors: number;
          mobile: boolean;
          history: [
            {
              time: number;
              type: string;
              message: string;
            },
            {
              time: number;
              type: string;
              message: string;
            },
            {
              time: number;
              type: string;
              message: string;
            },
          ];
          success: boolean;
          attempts: number;
          start_time: number;
          time_spent: number;
        };
        fees: number;
        plan: string | null;
        split: {};
        amount: number;
        domain: string;
        paid_at: string;
        source: string | null;
        status: string;
        channel: string;
        connect: string | null;
        message: string | null;
        currency: string;
        customer: {
          id: number;
          email: string;
          phone: string | null;
          metadata: string | null;
          last_name: string | null;
          first_name: string | null;
          risk_action: string;
          customer_code: string;
          international_format_phone: string | null;
        };
        metadata: {
          plan_id: string;
          payment_data: {
            fee: string;
            total: string;
            base_amount: string;
            total_in_kobo: string;
          };
          payment_event: string;
          payment_user_id: string;
          subscription_id: string;
        };
        order_id: string | null;
        created_at: string;
        reference: string;
        fees_split: string | null;
        ip_address: string;
        subaccount: {};
        plan_object: {};
        authorization: {
          bin: string;
          bank: string;
          brand: string;
          last4: string;
          channel: string;
          exp_year: string;
          reusable: boolean;
          card_type: string;
          exp_month: string;
          signature: string;
          account_name: string | null;
          country_code: string;
          receiver_bank: string | null;
          authorization_code: string;
          receiver_bank_account_number: string | null;
        };
        fees_breakdown: string | null;
        receipt_number: string | null;
        gateway_response: string;
        requested_amount: number;
        transaction_date: string;
        pos_transaction_data: null;
      };
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
  };
  documents: IVerificationDocument[];
  social_metrics: {
    followers_count: number;
    following_count: number;
    date_joined: string;
    duration_since_joining: string;
  };
}

interface IPushNotifications {
  uuid: string;
  title: string;
  body: string;
  category: string;
  target: string[];
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface IPushNotificationResponse extends IPaginatedResponse<IPushNotifications> {}

interface IVerificationRequestedResponse extends IPaginatedResponse<IVerificationRequested> {}

/* =========================================================================
 * VFlix — short-form vertical video management
 * Contract source: vflix-admin-management-guide.md (§4, §6)
 * Status values are identical to PostStatus, so status chips are shared.
 * ========================================================================= */

type VflixStatus =
  | "active"
  | "disabled"
  | "reported"
  | "flagged"
  | "banned"
  | "shadow_hidden"
  | "archived";

type VflixContentType = "video" | "carousel";

type VflixReportType = "spam" | "nudity" | "parody";

type VflixReportStatus = "open" | "in_review" | "resolved" | "dismissed";

interface IVflixMedia {
  uuid: string;
  media_url: string;
  transcoded_media_url: string | null;
  thumbnail: string;
  media_type: "video" | "image";
  duration: number; // seconds
  is_transcode_complete: boolean;
}

interface IVflixCreator {
  uuid: string;
  name: string;
  username: string;
  profile_picture: string;
}

interface IVflixVideo {
  uuid: string;
  caption: string;
  privacy: string;
  content_type: VflixContentType;
  status: VflixStatus;
  is_featured: boolean;
  is_duplicate: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  gifts_count: number;
  created_at: string;
  deleted_at: string | null;
  moderated_at: string | null;
  media: IVflixMedia[];
  creator: IVflixCreator;
  // present on moderation-queue items only
  report_count?: number;
}

interface IVflixReport {
  id: string;
  reporter_id: string;
  type: VflixReportType;
  reason: string;
  status: VflixReportStatus;
  action_details?: IReportActionDetails | null;
  created_at: string;
}

interface IVflixVideoDetail extends IVflixVideo {
  moderated_by: string | null;
  moderation_reason: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  language: string | null;
  culture_tag: string | null;
  series_id: string | null;
  episode_number: number | null;
  audio_id: string | null;
  filter_id: string | null;
  template_id: string | null;
  reports: IVflixReport[];
}

interface IVflixListResponse {
  data: IVflixVideo[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

interface IVflixStats {
  total: number;
  by_status: Partial<Record<VflixStatus, number>>;
  featured: number;
  removed: number;
  created_last_7d: number;
}

interface IVflixCreatorSummary {
  total: number;
  by_status: Partial<Record<VflixStatus, number>>;
  total_views: number;
  total_likes: number;
  strikes: number;
}

interface IVflixCreatorView {
  creator: IVflixCreator;
  summary: IVflixCreatorSummary;
  videos: {
    data: IVflixVideo[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
  };
}

interface IVflixUploadPoint {
  label: string;
  count: number;
}

interface IVflixTopCreator {
  creator: IVflixCreator;
  videos: number;
  views: number;
  strikes: number;
}

interface IVflixTopSound {
  id: string;
  name: string;
  tag: string;
  uses: number;
}

interface IVflixCatalogCounts {
  sounds: number;
  filters: number;
  templates: number;
  stickers: number;
  fonts: number;
  colours: number;
  pending_templates: number;
}

// Cross-segment summary for the VFlix landing dashboard (GET /vflix/overview).
interface IVflixOverview {
  kpis: {
    total: number;
    active: number;
    in_moderation: number;
    featured: number;
    removed: number;
    views_30d: number;
  };
  by_status: Partial<Record<VflixStatus, number>>;
  uploads: IVflixUploadPoint[];
  uploads_total: number;
  uploads_delta_pct: number;
  moderation: {
    open: number;
    reported: number;
    flagged: number;
    items: IVflixVideo[];
  };
  transcode: { complete: number; pending: number; failed: number };
  top_creators: IVflixTopCreator[];
  top_videos: IVflixVideo[];
  top_sounds: IVflixTopSound[];
  catalog: IVflixCatalogCounts;
}

// ---- Catalog / Studio assets ----
type VflixAssetKind = "sound" | "filter" | "template" | "sticker" | "font" | "colour";

interface IVflixSound {
  id: string;
  name: string;
  artist: string;
  category: string;
  mood_tags: string[];
  duration: number;
  uses_count: number;
  is_featured: boolean;
  created_at: string;
}

interface IVflixFilter {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  intensity: number;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

interface IVflixTemplate {
  id: string;
  name: string;
  cover: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  submitted_by: string;
  uses_count: number;
  created_at: string;
}

interface IVflixSticker {
  id: string;
  name: string;
  image: string;
  pack: string;
  is_active: boolean;
  uses_count: number;
}

interface IVflixFont {
  id: string;
  name: string;
  family: string;
  is_active: boolean;
  uses_count: number;
}

interface IVflixColour {
  id: string;
  name: string;
  hex: string;
  is_active: boolean;
  uses_count: number;
}

interface IVflixCatalogSummary {
  sounds: number;
  filters: number;
  templates: number;
  stickers: number;
  fonts: number;
  colours: number;
  pending_templates: number;
  featured_sounds: number;
  active_filters: number;
}

interface IVflixPaged<T> {
  data: T[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

interface IVflixStatusOption {
  name: string;
  value: string;
}

interface IVflixCreatorListItem {
  creator: IVflixCreator;
  videos: number;
  views: number;
  likes: number;
  strikes: number;
  status: "active" | "suspended" | "banned";
  featured_count: number;
  joined: string;
}

interface IVflixReportRow {
  id: string;
  video: { uuid: string; caption: string; thumbnail: string };
  reported_user: IVflixCreator;
  reporter_id: string;
  type: VflixReportType;
  reason: string;
  status: VflixReportStatus;
  action_details?: IReportActionDetails | null;
  created_at: string;
}

// ---- Insights / Ops / Settings ----
interface IVflixNamed {
  name: string;
  value: number;
}

interface IVflixTimePoint {
  label: string;
  views: number;
  uploads: number;
  engagement: number;
}

interface IVflixAnalytics {
  kpis: {
    views: number;
    watch_through: number;
    avg_watch_seconds: number;
    engagement_rate: number;
  };
  trend: IVflixTimePoint[];
  content_mix: { video: number; carousel: number };
  top_videos: IVflixVideo[];
  top_creators: IVflixTopCreator[];
  top_sounds: IVflixTopSound[];
  geography: IVflixNamed[];
  retention: IVflixNamed[];
}

interface IVflixTrendItem {
  rank: number;
  video: IVflixVideo;
  velocity: number;
  boosted: boolean;
  suppressed: boolean;
}

interface IVflixTrending {
  trending: IVflixTrendItem[];
  hot: IVflixTrendItem[];
}

interface IVflixSeries {
  id: string;
  title: string;
  creator: IVflixCreator;
  episodes: number;
  views: number;
  status: "ongoing" | "completed";
  cover: string;
  updated_at: string;
}

interface IVflixPipelineJob {
  id: string;
  video: { uuid: string; caption: string; thumbnail: string };
  status: "queued" | "processing" | "complete" | "failed";
  attempts: number;
  duration_sec: number | null;
  created_at: string;
}

interface IVflixPipeline {
  kpis: { queued: number; processing: number; complete_24h: number; failed_24h: number };
  throughput: IVflixNamed[];
  jobs: IVflixPipelineJob[];
}

interface IVflixEarner {
  creator: IVflixCreator;
  gifts: number;
  coins: number;
}

interface IVflixEarningVideo {
  video: IVflixVideo;
  gifts: number;
  coins: number;
}

interface IVflixMonetization {
  kpis: { total_gifts: number; coin_value: number; paid_out: number; top_earner: string };
  gifts_trend: IVflixNamed[];
  top_earning_videos: IVflixEarningVideo[];
  top_earners: IVflixEarner[];
}

interface IVflixSettings {
  uploads_enabled: boolean;
  comments_default_on: boolean;
  auto_moderation: boolean;
  max_duration_sec: number;
  auto_flag_reports: number;
  weight_engagement: number;
  weight_freshness: number;
  weight_affinity: number;
}
