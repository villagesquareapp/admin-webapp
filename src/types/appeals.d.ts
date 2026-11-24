interface IGuidelineReason {
    code: string;
    label: string;
}

interface IAppeal {
    uuid: string;
    status: "pending" | "upheld" | "overturned";
    message: string;
    created_at: string;
    sanction: "suspended" | "banned";
    sanction_at: string;
    suspended_until: string | null;
    reason: { code: string; label: string | null } | null;
    staff_reason: string | null;
    decided_at: string | null;
    decided_by_name: string | null;
    decision_note: string | null;
    user: {
        uuid: string;
        name: string;
        username: string;
        email: string;
        profile_picture: string | null;
        status: string;
        suspended_until: string | null;
        moderated_at: string | null;
    };
}

interface IAppealsPage {
    data: IAppeal[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    pending: number;
}
