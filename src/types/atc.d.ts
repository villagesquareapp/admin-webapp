
interface IATCApplication {
    uuid: string;
    fullname: string;
    about: string;
    occupation: string;
    occupation_duration: string;
    address: string;
    application_type: string;
    profile_picture_url: string;
    video_url: string;
    thumbnail_url: string | null;
    status: string;
    votes_count: number;
    likes_count: number;
    comments_count: number;
    gifts_count: number;
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
