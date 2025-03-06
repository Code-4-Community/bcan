/**
 * User Model Object
 * TODO: Consider userID changes (might need display_name)
 * TODO: Based on 1st part, might need UUID generator
 * TODO: Implement email or position changes
 */
export interface User {
    userId: string,
    position_or_role: string,
    email: string
}