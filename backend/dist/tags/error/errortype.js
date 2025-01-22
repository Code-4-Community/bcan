"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["Authentication"] = "AuthenticationError";
    ErrorType["Validation"] = "ValidationError";
    ErrorType["Unknown"] = "UnknownError";
    ErrorType["InternalServer"] = "InternalServerError";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
