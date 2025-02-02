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

interface IUserTableDetails {
    profile_picture: string
    name: string
    username: string
    email: string
    last_online?: string | null
    premium?: boolean
    check_mark?: boolean
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

interface IReportStats {
    total_reports: number,
    total_user_reports: number,
    total_post_reports: number,
    total_echo_reports: number,
    total_live_stream_reports: number,
    total_marketplace_reports: number,
    total_comment_reports: number
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

interface IMarketSquareStats {
    total_products: number,
    today_products: number,
    total_shops: number,
    reported_products: number
}

interface IEchoStats {
    total_echoes: number,
    new_echoes: number,
    live_echoes: number,
    total_participants: number,
    total_comments: number
}

interface ILivestreamStats {
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

interface IUser {
    user_details: {
        profile: {
            id: string,
            username: string,
            name: string,
            email: string,
            phone: string | null,
            address: {
                city: string,
                country: string,
                address: string,
                timezone: string
            },
            gender: string,
            date_of_birth: string,
            profession: string,
            bio: string,
            last_online: string | null,
            status: 'active' | 'suspended' | 'inactive',
            verified: number,
            profile_picture: string,
            profile_banner: string,
            followers: number,
            following: number,
            posts_count: number,
            is_private: boolean,
            check_mark: boolean,
            premium: boolean,
            account_type: string,
            registration_type: string,
            created_at: string
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

interface IUsersResponse extends IPaginatedResponse<IUser[]> { }

interface IMedia {
    thumbnail: string,
    url: string,
    type: 'image' | 'video'
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

interface ILivestreams {
    uuid: string,
    title: string,
    users: number,
    gifts: number,
    duration: number,
    cover: string,
    created_at: string,
    host: {
        uuid: string,
        name: string,
        username: string,
        email: string,
        registration_type: string,
        account_type: string,
        phone_number: string | null,
        profile_picture: string,
        cover_photo: string | null,
        gender: string | null,
        dob: string | null,
        country: string | null,
        city: string | null,
        profession: string | null,
        bio: string | null,
        timezone: string,
        verified_status: number,
        online: boolean,
        last_online: string | null,
        is_private: boolean,
        has_two_factor_auth: boolean,
        status: string,
        address: string,
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
    category: {
        id: number,
        name: string,
        created_at: string,
        updated_at: string
    }
    actions?: any
}

interface ILivestreamResponse extends IPaginatedResponse<ILivestreams[]> { }

interface IEchoes {
    uuid: string,
    title: string,
    users: number,
    gifts: number,
    duration: number,
    cover: string,
    status: 'ended' | 'live',
    created_at: string,
    host: {
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
    category: {
        id: number,
        name: string,
        created_at: string,
        updated_at: string
    },
    actions?: any
}

interface IEchosResponse extends IPaginatedResponse<IEchoes[]> { }

interface IMarketProduct {
    uuid: string,
    name: string,
    price: number,
    description: string,
    created_at: string,
    updated_at: string
}

interface IMarketSquareShops {
    uuid: string,
    name: string,
    logo: string,
    tagline: string | null,
    website: string | null,
    location: string | null,
    address: string | null,
    created_at: string,
    updated_at: string,
    products: IMarketProduct[]
    actions?: any
}

interface IMarketSquareShopsResponse extends IPaginatedResponse<IMarketSquareShops[]> { }

interface ITickerUser {
    name: string,
    username: string,
    email: string,
    profile_picture: string
}

interface ITicketstat {
    total: number,
    open: number,
    in_progress: number,
    resolved: number,
    closed: number
}

interface ITicket {
    title: string,
    description: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed',
    user: ITickerUser,
    actions?: any
}

interface ITicketResponse extends IPaginatedResponse<ITicket[]> { }

interface IComment {
    text: string,
    user: {
        name: string,
        profile_picture: string,
        created_at: string,
        updated_at: string
    },
    likes: number,
    created_at: string,
    updated_at: string
}

interface ISinglePost {
    post_details: {
        metrics: {
            likes: number,
            comments: number,
            shares: number,
            views: number,
            address: string,
            privacy: string,
            created_at: string,
            updated_at: string
        },
        user: {
            name: string,
            profile_picture: string,
            created_at: string,
            updated_at: string
        },
        content: {
            caption: string,
            media: IMedia[]
        },
        comments: IComment[]
    }
}

interface IReportUser {
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
    dob: string,
    country: string,
    city: string,
    profession: string,
    bio: string | null,
    timezone: string,
    verified_status: number,
    online: boolean,
    last_online: string | null,
    is_private: boolean,
    has_two_factor_auth: boolean,
    status: string,
    address: string,
    latitude: string,
    longitude: string,
    referrer: string | null,
    referral_code: string,
    referral_count: number,
    can_reset_password: boolean,
    checkmark_verification_status: boolean,
    premium_verification_status: boolean,
    created_at: string,
    updated_at: string,
    deleted_at: string | null
}

interface IReport {
    id: string,
    reporter_id: string,
    reported_user_id: string,
    reason: string,
    report_type: string,
    reported_service_id: string,
    report_service_type: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
    reporter: IReportUser,
    reported_user: IReportUser
}

interface IReportResponse extends IPaginatedResponse<IReport[]> { }