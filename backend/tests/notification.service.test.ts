import { describe, it, expect, beforeAll } from 'vitest';
import { NotificationService } from '../src/notifications/notifcation.service';

// For now, we just instantiate the service directly.
describe(
  'NotificationService Tests',
  () => {
    let notificationService: NotificationService;

    beforeAll(() => {
      // Create instances
      notificationService = new NotificationService();
    });

    describe('Something truthy and falsy', () => {
      it('true to be true', () => {
        expect(true).toBe(true);
      });

      it('false to be false', () => {
        expect(false).toBe(false);
      });
    });

    describe('sendEmailNotification', () => {
      it('should send an email via AWS SES', async () => {
        // PLEASE CHANGE THIS EMAIL if you don't have access to it or if not verified in your AWS sandbox
        const toEmail = 'N/A'; // CHANGE THIS TO AN EMAIL WHOSE INBOX YOU CAN RECEIVE THE TEST EMAIL WITH
        const subject = 'Test Email from BCANs Vitest';
        const body = 'Hello from the emailing notification test file!';

        const result = await notificationService.sendEmailNotification(toEmail, subject, body);

        // We expect SES to return an object with a MessageId
        expect(result.MessageId).toBeDefined();
      }, 15000); // Test timeout of 15 seconds
    });
  },
  // Optional but: Test timeout globally for this entire describe block:
  { timeout: 15000 }
);
