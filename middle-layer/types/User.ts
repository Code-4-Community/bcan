/**
 * User Model Object
 * TODO: Consider userID changes (might need display_name)
 * TODO: Based on 1st part, might need UUID generator
 */

import { UserStatus } from "./UserStatus";
export interface User {
    position: UserStatus,
    email: string,
    firstName: string,
    lastName: string,
    profilePicUrl?: string | null
}