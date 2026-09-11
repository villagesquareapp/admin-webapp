/**
 * VFlix mock fixtures + query helpers.
 *
 * TEMPORARY: the VFlix admin endpoints (§4 of the guide) aren't live yet.
 * These fixtures let the whole UI render and behave realistically (filtering,
 * pagination, status/feature mutations) until the backend ships. Everything
 * here matches the documented response shapes exactly, so once the real API
 * is available we flip VFLIX_USE_MOCK off in api/vflix.ts and delete this file.
 */

import type { ApiResponse } from "@/lib/api";

const STATUSES: VflixStatus[] = [
  "active",
  "disabled",
  "reported",
  "flagged",
  "banned",
  "shadow_hidden",
  "archived",
];

const REPORT_TYPES: VflixReportType[] = ["spam", "nudity", "parody"];

// Public sample streams for playback in the mock (any host is allowed by next.config).
const SAMPLE_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const SAMPLE_MP4 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const CREATORS: IVflixCreator[] = [
  { uuid: "usr-ada", name: "Ada Obi", username: "ada", profile_picture: "https://i.pravatar.cc/150?img=47" },
  { uuid: "usr-emeka", name: "Emeka Nwosu", username: "emeka", profile_picture: "https://i.pravatar.cc/150?img=12" },
  { uuid: "usr-zainab", name: "Zainab Bello", username: "zaib", profile_picture: "https://i.pravatar.cc/150?img=32" },
  { uuid: "usr-tunde", name: "Tunde Bakare", username: "tundeb", profile_picture: "https://i.pravatar.cc/150?img=15" },
  { uuid: "usr-chioma", name: "Chioma Eze", username: "chichi", profile_picture: "https://i.pravatar.cc/150?img=45" },
  { uuid: "usr-musa", name: "Musa Ibrahim", username: "musa_i", profile_picture: "https://i.pravatar.cc/150?img=68" },
];

const CAPTIONS = [
  "Sunset timelapse over Lagos 🌇 #vflix",
  "Trying the new jollof recipe, tell me what you think 🍚🔥",
  "Dance challenge — who did it better?",
  "POV: Monday morning in traffic 🚗😩",
  "Behind the scenes of our latest shoot 🎬",
  "3 quick tips to grow on VillageSquare 📈",
  "This filter is unreal ✨ (link in bio)",
  "Street food tour part 4 🌶️",
  "Guitar cover — Afrobeats edition 🎸",
  "My skincare routine that actually works",
  "Prank on my roommate 😂 (he wasn't happy)",
  "Morning run around the city 🏃🏾‍♀️",
  "Unboxing the new studio mic 🎙️",
  "How I edit my VFlix videos in 60 seconds",
  "Puppy's first day home 🐶❤️",
];

function seeded(i: number, mod: number) {
  // deterministic pseudo-random so the mock is stable across reloads
  return Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1 * mod;
}

function makeMedia(i: number, isCarousel: boolean): IVflixMedia[] {
  const count = isCarousel ? 2 + Math.floor(seeded(i, 3)) : 1;
  return Array.from({ length: count }).map((_, m) => {
    const transcodeDone = seeded(i + m, 10) > 2; // ~80% complete
    return {
      uuid: `media-${i}-${m}`,
      media_url: SAMPLE_MP4,
      transcoded_media_url: transcodeDone ? SAMPLE_HLS : null,
      thumbnail: `https://picsum.photos/seed/vflix-${i}-${m}/360/640`,
      media_type: "video",
      duration: 8 + Math.floor(seeded(i + m, 52)),
      is_transcode_complete: transcodeDone,
    };
  });
}

function makeVideo(i: number): IVflixVideo {
  const status = STATUSES[Math.floor(seeded(i, STATUSES.length))];
  const isCarousel = seeded(i, 10) > 7.5;
  const removed = status === "banned" || status === "disabled";
  const moderated = removed || status === "reported" || status === "flagged" || status === "shadow_hidden";
  const createdDaysAgo = Math.floor(seeded(i, 40));
  const created = new Date(Date.now() - createdDaysAgo * 86400000).toISOString();

  return {
    uuid: `vflix-${String(i).padStart(4, "0")}`,
    caption: CAPTIONS[i % CAPTIONS.length],
    privacy: "everyone",
    content_type: isCarousel ? "carousel" : "video",
    status,
    is_featured: seeded(i, 10) > 8.2,
    is_duplicate: status === "shadow_hidden",
    views_count: Math.floor(seeded(i, 250000)),
    likes_count: Math.floor(seeded(i, 40000)),
    comments_count: Math.floor(seeded(i, 1500)),
    shares_count: Math.floor(seeded(i, 800)),
    gifts_count: Math.floor(seeded(i, 120)),
    created_at: created,
    deleted_at: removed ? created : null,
    moderated_at: moderated ? created : null,
    media: makeMedia(i, isCarousel),
    creator: CREATORS[i % CREATORS.length],
  };
}

// Stable dataset for the whole session.
const ALL_VIDEOS: IVflixVideo[] = Array.from({ length: 47 }).map((_, i) => makeVideo(i + 1));

// open report counts, keyed by video uuid (drives moderation queue)
const REPORT_COUNTS: Record<string, number> = {};
ALL_VIDEOS.forEach((v, i) => {
  if (v.status === "reported" || v.status === "flagged") {
    REPORT_COUNTS[v.uuid] = 1 + Math.floor(seeded(i + 100, 6));
  } else if (seeded(i + 200, 10) > 8.5) {
    REPORT_COUNTS[v.uuid] = 1 + Math.floor(seeded(i + 300, 4));
  }
});

const ok = <T>(data: T, message = "OK"): ApiResponse<T> => ({
  status: true,
  message,
  data,
});

function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages,
  };
}

export interface MockVideoFilters {
  status?: string;
  user_id?: string;
  search?: string;
  content_type?: string;
  is_featured?: string;
}

export function mockListVideos(
  page: number,
  limit: number,
  filters: MockVideoFilters = {}
): ApiResponse<IVflixListResponse> {
  let items = [...ALL_VIDEOS];

  if (filters.status) items = items.filter((v) => v.status === filters.status);
  if (filters.user_id) items = items.filter((v) => v.creator.uuid === filters.user_id);
  if (filters.content_type) items = items.filter((v) => v.content_type === filters.content_type);
  if (filters.is_featured != null && filters.is_featured !== "") {
    const want = filters.is_featured === "true";
    items = items.filter((v) => v.is_featured === want);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((v) => v.caption.toLowerCase().includes(q));
  }

  return ok(paginate(items, page, limit));
}

export function mockStats(): ApiResponse<IVflixStats> {
  const by_status = STATUSES.reduce((acc, s) => {
    acc[s] = ALL_VIDEOS.filter((v) => v.status === s).length;
    return acc;
  }, {} as Partial<Record<VflixStatus, number>>);

  return ok({
    total: ALL_VIDEOS.length,
    by_status,
    featured: ALL_VIDEOS.filter((v) => v.is_featured).length,
    removed: ALL_VIDEOS.filter((v) => v.deleted_at).length,
    created_last_7d: ALL_VIDEOS.filter(
      (v) => Date.now() - new Date(v.created_at).getTime() < 7 * 86400000
    ).length,
  });
}

export function mockStatusList(): ApiResponse<VflixStatus[]> {
  return ok(STATUSES);
}

export function mockModerationQueue(
  page: number,
  limit: number
): ApiResponse<IVflixListResponse> {
  const items = ALL_VIDEOS.filter(
    (v) =>
      v.status === "reported" ||
      v.status === "flagged" ||
      (REPORT_COUNTS[v.uuid] || 0) > 0
  )
    .map((v) => ({ ...v, report_count: REPORT_COUNTS[v.uuid] || 0 }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return ok(paginate(items, page, limit));
}

function makeReports(uuid: string, count: number): IVflixReport[] {
  return Array.from({ length: count }).map((_, i) => ({
    uuid: `rep-${uuid}-${i}`,
    reporter_id: CREATORS[(i + 1) % CREATORS.length].uuid,
    type: REPORT_TYPES[i % REPORT_TYPES.length],
    reason: "Reported for violating community guidelines.",
    status: "open",
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

export function mockVideoDetail(id: string): ApiResponse<IVflixVideoDetail> {
  const base = ALL_VIDEOS.find((v) => v.uuid === id) || ALL_VIDEOS[0];
  const reportCount = REPORT_COUNTS[base.uuid] || 0;
  const moderated = !!base.moderated_at;

  const detail: IVflixVideoDetail = {
    ...base,
    moderated_by: moderated ? "admin@villagesquare.io" : null,
    moderation_reason: moderated ? "Flagged during routine moderation review." : null,
    address: "Lagos, Nigeria",
    latitude: "6.5244",
    longitude: "3.3792",
    language: "en",
    culture_tag: "afrobeats",
    series_id: null,
    episode_number: null,
    audio_id: "sound-102",
    filter_id: "filter-14",
    template_id: null,
    reports: makeReports(base.uuid, reportCount),
  };

  return ok(detail);
}

export function mockUpdateStatus(
  id: string,
  status: string,
  reason?: string
): ApiResponse<IVflixVideoDetail> {
  const idx = ALL_VIDEOS.findIndex((v) => v.uuid === id);
  if (idx >= 0) {
    const v = ALL_VIDEOS[idx];
    v.status = status as VflixStatus;
    v.moderated_at = new Date().toISOString();
    v.deleted_at = status === "banned" || status === "disabled" ? new Date().toISOString() : null;
    v.is_duplicate = status === "shadow_hidden";
    if (status === "active") {
      REPORT_COUNTS[id] = 0;
    }
  }
  const detail = mockVideoDetail(id).data as IVflixVideoDetail;
  return ok({ ...detail, moderation_reason: reason || detail.moderation_reason }, "Status updated");
}

export function mockSetFeatured(id: string, featured: boolean): ApiResponse<IVflixVideo> {
  const v = ALL_VIDEOS.find((x) => x.uuid === id);
  if (v) v.is_featured = featured;
  return ok((v || ALL_VIDEOS[0]) as IVflixVideo, featured ? "Featured" : "Unfeatured");
}

export function mockCreatorView(
  userId: string,
  page: number,
  limit: number
): ApiResponse<IVflixCreatorView> {
  const creator = CREATORS.find((c) => c.uuid === userId) || CREATORS[0];
  const videos = ALL_VIDEOS.filter((v) => v.creator.uuid === creator.uuid);

  const by_status = STATUSES.reduce((acc, s) => {
    const n = videos.filter((v) => v.status === s).length;
    if (n) acc[s] = n;
    return acc;
  }, {} as Partial<Record<VflixStatus, number>>);

  const paged = paginate(videos, page, limit);

  return ok({
    creator,
    summary: {
      total: videos.length,
      by_status,
      total_views: videos.reduce((s, v) => s + v.views_count, 0),
      total_likes: videos.reduce((s, v) => s + v.likes_count, 0),
      strikes: videos.filter((v) => v.status === "banned" || v.status === "disabled").length,
    },
    videos: {
      data: paged.data,
      total: paged.total,
      page: paged.page,
      limit: paged.limit,
    },
  });
}
