/**
 * User Model Object
 * TODO: Consider userID changes (might need display_name)
 * TODO: Based on 1st part, might need UUID generator
 */
export interface User {
    userId: string,
    position: string,
    email: string,
    name: string,
}