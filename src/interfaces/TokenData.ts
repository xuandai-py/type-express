export interface TokenData {
    token: string
    expiresIn: number
    refreshToken: string
}

export interface DataStoredInToken {
    _id: string
    userEmail: string
}