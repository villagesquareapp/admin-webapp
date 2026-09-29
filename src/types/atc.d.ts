
interface IATCApplication {
    uuid: string;
    fullname: string;
    about: string;
    occupation: string;
    occupation_duration: string;
    address: string;
    application_type: string;
    profile_picture_url: string;
    id_card_front_url: string;
    id_card_back_url: string;
    video_url: string;
    thumbnail_url: string | null;
    status: string;
    votes_count: number;
    likes_count: number;
    comments_count: number;
    gifts_count: number;
    shares_count?: number;
    profile_visits_count?: number;
    user_id: string;
    user: {
        uuid: string;
        name: string;
        username: string;
        profile_picture: string;
    };
    episode: {
        uuid: string;
        name: string;
        status: string;
    };
    created_at: string;
    updated_at?: string;
}



interface IATCApplicationsResponse {
    period: string;
    current_page: number;
    data: IATCApplication[];
    per_page: number;
    total: number;
    last_page: number;
}

interface IActiveEpisode {
    uuid: string;
    name: string;
    start_date: string;
    end_date: string;
}

interface ILeaderboardParticipant {
    rank: number;
    uuid: string;
    fullname: string;
    profile_picture: string;
    talent: string;
    thumbnail_url: string;
    video_url: string;
    votes_count: number;
    likes_count: number;
    comments_count: number;
    gifts_count: number;
    user_id: string;
    episode: {
        uuid: string;
        name: string;
    };
}

interface ILeaderboardResponse {
    period: string;
    participants_count: number;
    active_episode: IActiveEpisode;
    leaderboard: ILeaderboardParticipant[];
}

interface IATCPeriod {
    value: string;
    label: string;
}

interface IATCPeriodsResponse {
    periods: IATCPeriod[];
}

type ATCEpisodeStatus = "draft" | "active" | "completed" | "cancelled";

interface IATCEpisode {
    uuid: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: ATCEpisodeStatus;
    winner_id: string | null;
    applications_count?: number;
    created_at: string;
    updated_at?: string;
    deleted_at?: string | null;
}

interface IATCEpisodesResponse {
    current_page: number;
    data: IATCEpisode[];
    per_page: number;
    total: number;
    last_page: number;
}

interface IATCEpisodePayload {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status?: ATCEpisodeStatus;
}

interface IATCSettingsItem {
    icon: string;
    text: string;
}

interface IATCSettings {
    uuid?: string;
    setting_key?: string | null;
    key_information: IATCSettingsItem[];
    requirements: IATCSettingsItem[];
    application_start_day: number | null;
    application_end_day: number | null;
    selection_start_day: number | null;
    selection_end_day: number | null;
    voting_start_day: number | null;
    voting_end_day: number | null;
}
