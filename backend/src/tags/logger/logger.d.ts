export declare class LoggerService {
    private readonly logger;
    log(message: string, context?: string): void;
    error(message: string, trace: string, context?: string): void;
}
