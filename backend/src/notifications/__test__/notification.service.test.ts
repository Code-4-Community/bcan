import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '../../../../middle-layer/types/Notification';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TDateISO } from '../../utils/date';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

vi.mock('../../guards/auth.guard', () => ({
  VerifyUserGuard: vi.fn(class MockVerifyUserGuard {
    canActivate = vi.fn().mockResolvedValue(true);
  }),
  VerifyAdminRoleGuard: vi.fn(class MockVerifyAdminRoleGuard {
    canActivate = vi.fn().mockResolvedValue(true);
  }),
}));

const mockPromise = vi.fn();
const mockScan = vi.fn();
const mockGet = vi.fn();
const mockSend = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockQuery = vi.fn();
const mockSendEmail = vi.fn();
const mockUpdate = vi.fn();

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  put: mockPut,
  query: mockQuery,
  update: mockUpdate,
  delete: mockDelete,
};

const mockSES = {
  send: mockSend,
  sendEmail: mockSendEmail
};

vi.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: vi.fn(function() {
      return mockDocumentClient;
    })
  },
  SES: vi.fn(function() {
    return mockSES;
  })
}));

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;
  let mockNotification_id1_user1: Notification;
  let mockNotification_id1_user2: Notification;
  let mockNotification_id2_user1: Notification;
  let mockNotification_id2_user2: Notification;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockScan.mockReturnValue({ promise: mockPromise });
    mockGet.mockReturnValue({ promise: mockPromise });
    mockDelete.mockReturnValue({ promise: mockPromise });
    mockUpdate.mockReturnValue({ promise: mockPromise });
    mockPut.mockReturnValue({ promise: mockPromise });
    mockQuery.mockReturnValue({ promise: mockPromise });
    mockSendEmail.mockReturnValue({ promise: mockPromise });
    mockSend.mockReturnValue({ promise: mockPromise });

    const originalEnv = process.env;
    process.env = { ...originalEnv };
    process.env.NOTIFICATION_EMAIL_SENDER = 'kummer.j@northeastern.edu';
    process.env.DYNAMODB_NOTIFICATION_TABLE_NAME = 'BCANNotifications';
    process.env.COGNITO_USER_POOL_ID = "test-user-pool-id";

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);

    mockPromise.mockResolvedValue({
      MessageId: 'test-message-id-123',
      ResponseMetadata: { RequestId: 'test-request-id' }
    });

    // All notifications now use userEmail instead of userId
    mockNotification_id1_user1 = {
      notificationId: '1',
      userEmail: 'user1@example.com',
      message: 'New Grant Created 🎉 ',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false,
      grantId: 100,
    } as Notification;

    mockNotification_id1_user2 = {
      notificationId: '1',
      userEmail: 'user2@example.com',
      message: 'New Grant Created',
      alertTime: '2025-01-15T10:30:00.000Z',
      sent: false,
      grantId: 100,
    } as Notification;

    mockNotification_id2_user1 = {
      notificationId: '2',
      userEmail: 'user1@example.com',
      message: 'New Grant Created',
      alertTime: '2025-01-15T10:30:00.000Z',
      sent: false,
      grantId: 200,
    } as Notification;

    mockNotification_id2_user2 = {
      notificationId: '2',
      userEmail: 'user2@example.com',
      message: 'New Grant Created',
      alertTime: '2025-01-15T10:30:00.000Z',
      sent: false,
      grantId: 200,
    } as Notification;

    mockPut.mockReturnValue({ promise: mockPromise });
    mockPromise.mockResolvedValue({});
  });

  it('getNotificationByUserEmail mock query called with correct parameters', async () => {
    const mockQueryResponse = {
      Items: [mockNotification_id1_user1, mockNotification_id1_user2, mockNotification_id2_user1, mockNotification_id2_user2]
    };

    mockQuery.mockReturnValue({ promise: vi.fn().mockResolvedValue(mockQueryResponse) });

    const result = await notificationService.getNotificationByUserEmail('user1@example.com');

    // Index and key should now use userEmail
    expect(mockQuery).toHaveBeenCalledWith({
      TableName: 'BCANNotifications',
      IndexName: 'userEmail-alertTime-index',
      KeyConditionExpression: 'userEmail = :userEmail',
      ExpressionAttributeValues: {
        ':userEmail': 'user1@example.com',
      },
      ScanIndexForward: false
    });
  });

  describe('getNotificationByNotificationId', () => {
    it('should throw NotFoundException when notification does not exist', async () => {
      mockQuery.mockReturnValue({
        promise: vi.fn().mockResolvedValueOnce({ Items: null })
      });

      await expect(notificationService.getNotificationByNotificationId('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException when DynamoDB query fails', async () => {
      mockPromise.mockRejectedValueOnce(new Error('DynamoDB query failed'));

      await expect(notificationService.getNotificationByNotificationId('123')).rejects.toThrow(InternalServerErrorException);
    });
  });

  it('should send email successfully with valid parameters', async () => {
    const to = 'user@example.com';
    const subject = 'Test Notification';
    const body = 'This is a test notification email.';

    const result = await notificationService.sendEmailNotification(to, subject, body);

    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: 'Test Notification' },
        Body: { Text: { Charset: 'UTF-8', Data: 'This is a test notification email.' } },
      },
    });

    expect(mockPromise).toHaveBeenCalled();
  });

  it('should use fallback email when NOTIFICATION_EMAIL_SENDER is not set', async () => {
    delete process.env.NOTIFICATION_EMAIL_SENDER;

    await notificationService.sendEmailNotification('user@example.com', 'Test Subject', 'Test Body');

    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'u&@nveR1ified-failure@dont-send.com',
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: 'Test Subject' },
        Body: { Text: { Charset: 'UTF-8', Data: 'Test Body' } },
      },
    });
  });

  it('should handle special characters in email content', async () => {
    const to = 'user@example.com';
    const subject = 'Émoji Test: 🎉 Special chars: àáâãäå';
    const body = 'Body with special chars: ñóôõö and symbols: €£¥ and emojis: 🚀📧';

    await notificationService.sendEmailNotification(to, subject, body);

    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: { Text: { Charset: 'UTF-8', Data: body } },
      },
    });
  });

  it('should throw error when SES sendEmail fails', async () => {
    mockPromise.mockRejectedValue(new Error('SES service unavailable'));

    await expect(notificationService.sendEmailNotification(
      'user@example.com', 'Test Subject', 'Test Body'
    )).rejects.toThrow(InternalServerErrorException);

    expect(mockSendEmail).toHaveBeenCalled();
  });

  it('should send an email that is an empty string', async () => {
    await notificationService.sendEmailNotification('user@example.com', '', '');

    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: '' },
        Body: { Text: { Charset: 'UTF-8', Data: '' } },
      },
    });
  });

  it('should send very long email content', async () => {
    const subject = 'A'.repeat(1000);
    const body = 'B'.repeat(10000);

    await notificationService.sendEmailNotification('user@example.com', subject, body);

    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: { Text: { Charset: 'UTF-8', Data: body } },
      },
    });
  });

  it('should return empty array when no notifications found', async () => {
    const mockQueryResponse = { Items: [] };
    mockQuery.mockReturnValue({ promise: vi.fn().mockResolvedValue(mockQueryResponse) });

    const result = await notificationService.getNotificationByUserEmail('nonexistent-user@example.com');
    expect(result).toEqual([]);
  });

  it('should throw InternalServerError when DynamoDB query fails', async () => {
    mockPromise.mockRejectedValueOnce(new Error('DynamoDB connection failed'));

    await expect(notificationService.getCurrentNotificationsByEmail('user1@example.com')).rejects.toThrow(InternalServerErrorException);
  });

  it('should create notification with valid data in the set table', async () => {
    const mockNotification: Notification = {
      notificationId: '123',
      userEmail: 'user@example.com',
      message: 'Test notification',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false,
      grantId: 42,
    };

    const result = await notificationService.createNotification(mockNotification);

    // Service spreads the notification object so userEmail stays as userEmail
    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'BCANNotifications',
      Item: {
        notificationId: '123',
        userEmail: 'user@example.com',
        message: 'Test notification',
        alertTime: '2024-01-15T10:30:00.000Z',
        sent: false,
        grantId: 42,
      },
    });
    expect(result).toEqual(mockNotification);
  });

  it('should create notification with fallback table name when environment variable is not set', async () => {
    delete process.env.DYNAMODB_NOTIFICATION_TABLE_NAME;

    const mockNotification: Notification = {
      notificationId: '123',
      userEmail: 'user@example.com',
      message: 'Test notification',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false,
      grantId: 42,
    };

    const result = await notificationService.createNotification(mockNotification);
    expect(result).toEqual(mockNotification);

    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'TABLE_FAILURE',
      Item: {
        notificationId: '123',
        userEmail: 'user@example.com',
        message: 'Test notification',
        alertTime: '2024-01-15T10:30:00.000Z',
        sent: false,
        grantId: 42,
      },
    });
  });

  it('should throw BadRequestException when userEmail is missing', async () => {
    const invalidNotification: Notification = {
      notificationId: '123',
      userEmail: '',
      message: 'Test',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false,
      grantId: 1,
    };

    await expect(notificationService.createNotification(invalidNotification)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when notificationId is missing', async () => {
    const invalidNotification: Notification = {
      notificationId: '',
      userEmail: 'user@example.com',
      message: 'Test',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false,
      grantId: 1,
    };

    await expect(notificationService.createNotification(invalidNotification)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid alertTime', async () => {
    const invalidNotification: Notification = {
      notificationId: '123',
      userEmail: 'user@example.com',
      message: 'Test',
      alertTime: 'not-a-valid-date' as any,
      sent: false,
      grantId: 1,
    };

    await expect(notificationService.createNotification(invalidNotification)).rejects.toThrow(BadRequestException);
  });

  it('should throw InternalServerErrorException when DynamoDB fails on create', async () => {
    const validNotification: Notification = {
      notificationId: '123',
      userEmail: 'user@example.com',
      message: 'Test',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false,
      grantId: 1,
    };

    mockPromise.mockRejectedValueOnce(new Error('DynamoDB service unavailable'));

    await expect(notificationService.createNotification(validNotification)).rejects.toThrow(InternalServerErrorException);
  });

  it('should update a notification successfully with multiple fields', async () => {
    const notificationId = 'notif-123';
    const updates = {
      message: 'Updated message',
      alertTime: '2025-01-01T00:00:00.000Z' as unknown as TDateISO
    };

    const mockUpdateResponse = {
      Attributes: {
        message: 'Updated message',
        alertTime: '2025-01-01T00:00:00.000Z',
      },
    };

    mockUpdate.mockReturnValue({ promise: mockPromise });
    mockPromise.mockResolvedValue(mockUpdateResponse);

    const result = await notificationService.updateNotification(notificationId, updates);

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: 'BCANNotifications',
      Key: { notificationId },
      UpdateExpression: 'SET #message = :message, #alertTime = :alertTime',
      ExpressionAttributeNames: { '#message': 'message', '#alertTime': 'alertTime' },
      ExpressionAttributeValues: {
        ':message': 'Updated message',
        ':alertTime': '2025-01-01T00:00:00.000Z',
      },
      ReturnValues: 'UPDATED_NEW',
    });

    expect(result).toEqual(JSON.stringify(mockUpdateResponse));
  });

  it('should throw error when DynamoDB update fails', async () => {
    mockPromise.mockRejectedValueOnce(new Error('DynamoDB update failed'));

    await expect(notificationService.updateNotification('notif-fail', { message: 'Failure test' }))
      .rejects.toThrow(InternalServerErrorException);

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should correctly update a single field', async () => {
    const mockUpdateResponse = { Attributes: { message: 'Single field update' } };
    mockPromise.mockResolvedValueOnce(mockUpdateResponse);

    const result = await notificationService.updateNotification('notif-single', { message: 'Single field update' });

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: 'BCANNotifications',
      Key: { notificationId: 'notif-single' },
      UpdateExpression: 'SET #message = :message',
      ExpressionAttributeNames: { '#message': 'message' },
      ExpressionAttributeValues: { ':message': 'Single field update' },
      ReturnValues: 'UPDATED_NEW',
    });

    expect(result).toEqual(JSON.stringify(mockUpdateResponse));
  });

  describe('deleteNotification', () => {
    it('should successfully delete a notification given a valid id', async () => {
      mockPromise.mockResolvedValueOnce({});

      const result = await notificationService.deleteNotification('0');

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith({
        TableName: 'BCANNotifications',
        Key: { notificationId: '0' },
        ConditionExpression: 'attribute_exists(notificationId)'
      });

      expect(result).toEqual('Notification with id 0 successfully deleted');
    });

    it('uses the fallback table when the environment variable is not set', async () => {
      delete process.env.DYNAMODB_NOTIFICATION_TABLE_NAME;
      mockPromise.mockResolvedValueOnce({});

      await notificationService.deleteNotification('0');

      expect(mockDelete).toHaveBeenCalledWith({
        TableName: 'TABLE_FAILURE',
        Key: { notificationId: '0' },
        ConditionExpression: 'attribute_exists(notificationId)'
      });
    });

    it('throws NotFoundException when the given notification id does not exist', async () => {
      mockPromise.mockRejectedValueOnce({
        code: 'ConditionalCheckFailedException',
        message: 'The item does not exist'
      });

      await expect(notificationService.deleteNotification('999')).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when DynamoDB fails unexpectedly', async () => {
      mockPromise.mockRejectedValueOnce(new Error('DynamoDB service unavailable'));

      await expect(notificationService.deleteNotification('123')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getNotificationsByGrantId', () => {
    it('should return notifications matching the given grantId', async () => {
      const matchingNotifications = [mockNotification_id1_user1, mockNotification_id1_user2];
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockResolvedValue({ Items: matchingNotifications }) });

      const result = await notificationService.getNotificationsByGrantId(100);

      expect(mockScan).toHaveBeenCalledWith({
        TableName: 'BCANNotifications',
        FilterExpression: 'grantId = :grantId',
        ExpressionAttributeValues: { ':grantId': 100 },
      });
      expect(result).toEqual(matchingNotifications);
    });

    it('should return empty array when no notifications match', async () => {
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockResolvedValue({ Items: [] }) });

      const result = await notificationService.getNotificationsByGrantId(999);

      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when DynamoDB scan fails', async () => {
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockRejectedValue(new Error('scan failed')) });

      await expect(notificationService.getNotificationsByGrantId(100)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateNotificationsEmailAndOrgByGrantId', () => {
    const notifWithOrg = (overrides: Partial<typeof mockNotification_id1_user1>) => ({
      ...mockNotification_id1_user1,
      message: 'Application due in 30 days for OldOrg',
      ...overrides,
    });

    it('should update userEmail when it differs from new email', async () => {
      const notifications = [notifWithOrg({ userEmail: 'old@example.com', notificationId: '1' })];
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockResolvedValue({ Items: notifications }) });
      mockUpdate.mockReturnValue({ promise: vi.fn().mockResolvedValue({ Attributes: {} }) });

      await notificationService.updateNotificationsEmailAndOrgByGrantId(100, 'new@example.com', 'OldOrg');

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: { notificationId: '1' },
          ExpressionAttributeValues: expect.objectContaining({ ':userEmail': 'new@example.com' }),
        })
      );
    });

    it('should update message when org differs', async () => {
      const notifications = [notifWithOrg({ userEmail: 'same@example.com', notificationId: '1' })];
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockResolvedValue({ Items: notifications }) });
      mockUpdate.mockReturnValue({ promise: vi.fn().mockResolvedValue({ Attributes: {} }) });

      await notificationService.updateNotificationsEmailAndOrgByGrantId(100, 'same@example.com', 'NewOrg');

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: { notificationId: '1' },
          ExpressionAttributeValues: expect.objectContaining({ ':message': 'Application due in 30 days for NewOrg' }),
        })
      );
    });

    it('should update both fields when both differ', async () => {
      const notifications = [notifWithOrg({ userEmail: 'old@example.com', notificationId: '1' })];
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockResolvedValue({ Items: notifications }) });
      mockUpdate.mockReturnValue({ promise: vi.fn().mockResolvedValue({ Attributes: {} }) });

      await notificationService.updateNotificationsEmailAndOrgByGrantId(100, 'new@example.com', 'NewOrg');

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: { notificationId: '1' },
          ExpressionAttributeValues: expect.objectContaining({
            ':userEmail': 'new@example.com',
            ':message': 'Application due in 30 days for NewOrg',
          }),
        })
      );
    });

    it('should skip update when neither email nor org changed', async () => {
      const notifications = [notifWithOrg({ userEmail: 'same@example.com', notificationId: '1' })];
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockResolvedValue({ Items: notifications }) });

      await notificationService.updateNotificationsEmailAndOrgByGrantId(100, 'same@example.com', 'OldOrg');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should do nothing when no notifications exist for the grantId', async () => {
      mockScan.mockReturnValueOnce({ promise: vi.fn().mockResolvedValue({ Items: [] }) });

      await notificationService.updateNotificationsEmailAndOrgByGrantId(999, 'new@example.com', 'NewOrg');

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});