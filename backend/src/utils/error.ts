interface AwsCognitoError extends Error {
    code?: string;
    [key: string]: any; // Allows for additional props
}