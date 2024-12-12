export const messageHandler = (message: any[] | string): string => {
    if (Array.isArray(message)) {
        return message[0]
    } else if (typeof message === "string") {
        return message
    }
    return "An unknown error occurred"
}