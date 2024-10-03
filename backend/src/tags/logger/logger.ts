import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, trace, context);
  }
}