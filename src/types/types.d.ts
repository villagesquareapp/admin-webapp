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

interface IPosts {
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
}