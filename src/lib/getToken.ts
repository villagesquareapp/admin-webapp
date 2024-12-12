import { authOptions } from "@/app/api/auth/authOptions"
import { getServerSession } from "next-auth"

export const getToken = async () => {
    const session = await getServerSession(authOptions)
    const token = session?.token
    return token
}