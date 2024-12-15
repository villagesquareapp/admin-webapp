interface IApiMessage {
    error?: string
}

interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    [key: string]: any
}

interface IUser {
    id: string
    email: string
}

interface IAuthResponse {
    accessToken: string
    user: IUser
}

interface IUserWithToken {
    token: string
    user: IUser
}

interface IUserstat {
    total_users: number
    today_new_users: number
    today_active_users: number
    logged_in_users: number
    reported_users: number
}

interface IUsers {
    total_users: number
    today_new_users: number
    today_active_users: number
    logged_in_users: number
    reported_users: number
}

interface IPostStats {
    total_posts: number,
    total_image_posts: number,
    today_posts: number,
    reported_posts: number,
    total_likes: number,
    ios_posts: number,
    android_posts: number
}

interface IMarketSquares {
    total_products: number,
    today_products: number,
    reported_products: number
}

interface IEchos {
    total_echoes: number,
    new_echoes: number,
    live_echoes: number,
    total_participants: number,
    total_comments: number
}

interface ILivestreams {
    total_livestreams: number,
    new_livestreams: number,
    currently_live: number
}

interface IOverviewData {
    total: number,
    icon: string,
    bgcolor: string,
    shape: StaticImageData,
    title: string,
    link?: string
}


interface IPaginatedResponse<T> {
    current_page: string
    data: T[]
    per_page: number
    total: number
    last_page: number
}

interface IUserPost {
    caption: string,
    likes_count: string,
    comments_count: string,
    shares_count: string,
    views_count: string,
    created_at: string
}

interface IUsers {
    user_details: {
        profile: {
            username: string,
            profile_picture: string,
            profile_banner: string,
            followers: number
        },
        shop: {
            logo: string,
            number_of_products: number,
            number_of_orders: number
        },
        posts: IUserPost[]
    }
    actions?: any
}

interface IUsersResponse extends IPaginatedResponse<IUsers[]> { }

interface IMedia {
    uuid: string,
    post_id: string,
    media_filename: string,
    media_url: string,
    transcoded_media_url: string | null,
    media_type: string,
    media_size: string,
    media_thumbnail: string,
    is_transcode_complete: boolean,
    media_duration: string | null,
    created_at: string,
    updated_at: string,
    deleted_at: string | null
}


interface IPosts {
    uuid: string,
    caption: string,
    views_count: number,
    shares_count: number,
    likes_count: number,
    comments_count: number,
    created_at: string,
    user: {
        uuid: string,
        name: string,
        username: string,
        email: string,
        registration_type: string,
        account_type: string,
        phone_number: string | null,
        profile_picture: string,
        cover_photo: string,
        gender: string,
        dob: string | null,
        country: string,
        city: string,
        profession: string,
        bio: string,
        timezone: string,
        verified_status: number,
        online: boolean,
        last_online: string | null,
        is_private: boolean,
        has_two_factor_auth: boolean,
        status: string,
        address: string | null,
        latitude: string | null,
        longitude: string | null,
        referrer: string | null,
        referral_code: string,
        referral_count: number,
        can_reset_password: boolean,
        created_at: string,
        updated_at: string,
        deleted_at: string | null
    },
    media: IMedia[]
    actions?: any
}

interface IPostResponse extends IPaginatedResponse<IPosts[]> { }