/* =========================================================================
 * Product analytics — Admin API /v2/analytics (admin-api PR #95)
 * Rates are 0–1 floats. Days are Lagos calendar days (YYYY-MM-DD).
 * ========================================================================= */

type AnalyticsSection =
  | "app"
  | "social"
  | "vflix"
  | "live"
  | "echo"
  | "atc"
  | "trybes"
  | "marketsquare"
  | "messages"
  | "wallet"
  | "meetings"
  | "profile";

type RetentionCohortKind = "signup" | "first_use";
type RetentionGrain = "week" | "month";

interface IAnalyticsTracking {
  ready: boolean;
  visits_since: string | null;
  backfill_done_at: string | null;
}

interface IAnalyticsRange {
  from: string;
  to: string;
  days: number;
}

interface IAnalyticsTotals {
  users_total: number;
  signups: number;
  active_users: number;
  dau_avg: number;
  dau_today: number;
  wau: number;
  mau: number;
  stickiness: number;
  new_active: number;
  returning_active: number;
}

interface IAnalyticsDay {
  day: string;
  active: number;
  new: number;
  returning: number;
}

interface IAnalyticsSectionStats {
  section: Exclude<AnalyticsSection, "app">;
  active_users: number;
  previous_active_users: number;
  dau_avg: number;
  wau: number;
  mau: number;
  share_of_active: number;
  d1: number | null;
  d7: number | null;
  d30: number | null;
  daily: { day: string; active: number }[];
}

interface IAnalyticsOverview {
  tracking: IAnalyticsTracking;
  range: IAnalyticsRange;
  totals: IAnalyticsTotals;
  previous: IAnalyticsTotals;
  daily: IAnalyticsDay[];
  sections: IAnalyticsSectionStats[];
}

interface IRetentionCohort {
  start: string;
  size: number;
  // One value per period that has started; the last one is still running.
  counts: number[];
  rates: number[];
}

interface IAnalyticsRetention {
  tracking: IAnalyticsTracking;
  section: AnalyticsSection;
  cohort: RetentionCohortKind;
  grain: RetentionGrain;
  periods: number;
  cohorts: IRetentionCohort[];
}

interface IFunnelStep {
  key: "signed_up" | "set_up_profile" | "followed_someone" | "took_action" | "came_back_day_1" | "came_back_week_1" | string;
  label: string;
  users: number;
  eligible: number;
}

interface IAnalyticsFunnel {
  tracking: IAnalyticsTracking;
  range: IAnalyticsRange;
  steps: IFunnelStep[];
}

type CountMap = Record<string, number>;

interface IAudienceBreakdown {
  generated_at: string;
  accounts: {
    total: number;
    deleted_accounts: number;
    by_status: CountMap;
    by_signup_method: CountMap;
    by_account_type: CountMap;
    by_badge: CountMap;
  };
  reachability: {
    email: number;
    email_is_apple_private_relay: number;
    phone: number;
    push_token_any: number;
    push_token_refreshed_last_270d: number;
    push_token_ios: number;
    push_token_android: number;
    email_or_fresh_push: number;
    no_way_to_reach: number;
  };
  // a_ to f_ are cumulative (last 7 days ⊂ last 30 days ⊂ …).
  last_active: {
    a_last_7_days: number;
    b_last_30_days: number;
    c_last_90_days: number;
    d_last_6_months: number;
    e_last_year: number;
    f_last_2_years: number;
    g_older: number;
    h_no_signal: number;
  };
  engagement_depth_days_with_any_action: {
    a_none: number;
    b_1_day: number;
    c_2_to_4_days: number;
    d_5_to_19_days: number;
    e_20_plus_days: number;
  };
  sections_users_ever: CountMap;
  sections_users_last_90_days: CountMap;
  sections_users_last_30_days: CountMap;
  signups_by_month: Record<string, { signed_up: number; did_anything: number; active_last_90_days: number; reachable_email_or_push: number }>;
  top_countries: { country: string; users: number; active_last_90_days: number }[];
  top_cities: { city: string; users: number; active_last_90_days: number }[];
  gender: CountMap;
  age_bands: { under_18: number; "18_24": number; "25_34": number; "35_44": number; "45_plus": number; not_set: number };
  social_graph: { follow_someone: number; have_a_follower: number; have_10_plus_followers: number; have_100_plus_followers: number };
  creators: {
    posted_5_plus: number;
    vflix_3_plus: number;
    hosted_echo: number;
    hosted_live: number;
    listed_on_marketsquare: number;
    applied_to_atc: number;
  };
  payments_users_by_status: CountMap;
  win_back_segments_reachable_by_email_or_push: CountMap;
}

interface IAnalyticsSegment {
  key: string;
  label: string;
  description: string;
  size: number;
  push_reachable: number;
  email_reachable: number;
}

interface ISegmentPushPayload {
  title: string;
  body: string;
  image_url?: string;
  scheduled_at?: string;
}
