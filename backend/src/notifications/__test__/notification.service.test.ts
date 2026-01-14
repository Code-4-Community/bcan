import { Test, TestingModule } from '@nestjs/testing';
import { Notification } from '../../../../middle-layer/types/Notification';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { servicesVersion } from 'typescript';
import { TDateISO } from '../../utils/date';

vi.mock('../../auth/auth.guard', () => ({
  VerifyUserGuard: vi.fn(() => ({
    canActivate: vi.fn().mockResolvedValue(true),
  })),
  VerifyAdminRoleGuard: vi.fn(() => ({
    canActivate: vi.fn().mockResolvedValue(true),
  })),
}));

// Create mock functions that we can reference
const mockPromise = vi.fn();
const mockScan = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();
const mockSend = vi.fn().mockReturnThis(); // for SES
const mockPut = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockQuery = vi.fn().mockReturnThis();
const mockSendEmail = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  put: mockPut,
  query: mockQuery,
  update: mockUpdate,
  delete : mockDelete,
  promise: mockPromise,
};


const mockSES = {
  send: mockSend,
  promise: mockPromise,
  sendEmail : mockSendEmail
};

// Mock AWS SDK - Note the structure here
vi.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: vi.fn(() => mockDocumentClient)
  },
  SES: vi.fn(() => mockSES)
}));

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;
  let mockNotification_id1_user1 : Notification;
  let mockNotification_id1_user2 : Notification;
  let mockNotification_id2_user1: Notification;
  let mockNotification_id2_user2: Notification;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset environment variables
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

    mockSendEmail.mockReturnValue({ promise: mockPromise });
    mockPromise.mockResolvedValue({
      MessageId: 'test-message-id-123',
      ResponseMetadata: {
        RequestId: 'test-request-id'
      }
    });

    mockNotification_id1_user1 = {
      notificationId: '1',
      userId: 'user-1',
      message: 'New Grant Created 🎉 ',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false
    } as Notification;

    mockNotification_id1_user2 = {
      notificationId: '1',
      userId: 'user-2',
      message: 'New Grant Created',
      alertTime: '2025-01-15T10:30:00.000Z',
      sent: false
    } as Notification;

    mockNotification_id2_user1= {
      notificationId: '2',
      userId: 'user-1',
      message: 'New Grant Created',
      alertTime: '2025-01-15T10:30:00.000Z',
      sent: false
    } as Notification;

    mockNotification_id2_user2= {
      notificationId: '2',
      userId: 'user-2',
      message: 'New Grant Created',
      alertTime: '2025-01-15T10:30:00.000Z',
      sent: false
    } as Notification;

    mockPut.mockReturnValue({ promise: mockPromise });
    mockPromise.mockResolvedValue({}); 
  });

  it('getNOtificationByUserId mock query called with correct parameters', async () => {
    // Arrange - Setup query mock to return our test data
    const mockQueryResponse = {
      Items: [mockNotification_id1_user1, mockNotification_id1_user2, mockNotification_id2_user1, mockNotification_id2_user2] 
    };
    
    mockQuery.mockReturnValue({ promise: vi.fn().mockResolvedValue(mockQueryResponse) });

    // Act
    const result = await notificationService.getNotificationByUserId('user-1');

    //Assert
    expect(mockQuery).toHaveBeenCalledWith({
      TableName: 'BCANNotifications',
      IndexName: 'userId-alertTime-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': 'user-1',
      },
      ScanIndexForward: false
    });
    
  });

  it('should send email successfully with valid parameters', async () => {
    // Arrange
    const to = 'user@example.com';
    const subject = 'Test Notification';
    const body = 'This is a test notification email.';

    // Act
    const result = await notificationService.sendEmailNotification(to, subject, body);

    // Assert
    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: {
        ToAddresses: ['user@example.com'],
      },
      Message: {
        Subject: { Charset: 'UTF-8', Data: 'Test Notification' },
        Body: {
          Text: { Charset: 'UTF-8', Data: 'This is a test notification email.' },
        },
      },
    });
    
    expect(mockPromise).toHaveBeenCalled();
  });

  it('should use fallback email when NOTIFICATION_EMAIL_SENDER is not set', async () => {
    // Arrange
    delete process.env.NOTIFICATION_EMAIL_SENDER;
    
    const to = 'user@example.com';
    const subject = 'Test Subject';
    const body = 'Test Body';

    // Act
    await notificationService.sendEmailNotification(to, subject, body);

    // Assert
    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'u&@nveR1ified-failure@dont-send.com',
      Destination: {
        ToAddresses: ['user@example.com'],
      },
      Message: {
        Subject: { Charset: 'UTF-8', Data: 'Test Subject' },
        Body: {
          Text: { Charset: 'UTF-8', Data: 'Test Body' },
        },
      },
    });
  });

  it('should handle special characters in email content', async () => {
    // Arrange
    const to = 'user@example.com';
    const subject = 'Émoji Test: 🎉 Special chars: àáâãäå';
    const body = 'Body with special chars: ñóôõö and symbols: €£¥ and emojis: 🚀📧';

    // Act
    await notificationService.sendEmailNotification(to, subject, body);

    // Assert
    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: {
        ToAddresses: ['user@example.com'],
      },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: {
          Text: { Charset: 'UTF-8', Data: body },
        },
      },
    });
  });

  it('should throw error when SES sendEmail fails', async () => {
    // Arrange
    const sesError = new Error('SES service unavailable');
    mockPromise.mockRejectedValue(sesError);

    // Act & Assert
    await expect(notificationService.sendEmailNotification(
      'user@example.com',
      'Test Subject',
      'Test Body'
    )).rejects.toThrow('Failed to send email: SES service unavailable');

    expect(mockSendEmail).toHaveBeenCalled();
  });

  it('should send an email that is an empty string', async () => {
    // Arrange
    const to = 'user@example.com';
    const subject = '';
    const body = '';

    // Act
    await notificationService.sendEmailNotification(to, subject, body);

    // Assert
    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: {
        ToAddresses: ['user@example.com'],
      },
      Message: {
        Subject: { Charset: 'UTF-8', Data: '' },
        Body: {
          Text: { Charset: 'UTF-8', Data: '' },
        },
      },
    });
  });

  it('should send very long email content', async () => {
    // Arrange
    const to = 'user@example.com';
    const subject = 'A'.repeat(1000); // Very long subject
    const body = 'B'.repeat(10000);   // Very long body

    // Act
    await notificationService.sendEmailNotification(to, subject, body);

    // Assert
    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: 'kummer.j@northeastern.edu',
      Destination: {
        ToAddresses: ['user@example.com'],
      },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: {
          Text: { Charset: 'UTF-8', Data: body },
        },
      },
    });
  });

  

  it('should throw error when notifications is null', async () => {
    // Arrange - Setup query mock to return no items
    const mockQueryResponse = {
      Items: [] // Empty array instead of null
    };
    
    mockQuery.mockReturnValue({ promise: vi.fn().mockResolvedValue(mockQueryResponse) });

    // Act & Assert
    const result = await notificationService.getNotificationByUserId('nonexistent-user');
    expect(result).toEqual([]);
  });

  it('should create notification with valid data in the set table', async () => {
    const mockNotification = {
      notificationId: '123',
      userId : 'user-456',
      message : 'Test notification',
      alertTime : '2024-01-15T10:30:00.000Z',
      sent: false
    } as Notification;
    const result = await notificationService.createNotification(mockNotification);
    expect(mockPut).toHaveBeenCalledWith({
      TableName : 'BCANNotifications',
      Item : {
      notificationId: '123',
      userId : 'user-456',
      message : 'Test notification',
      alertTime : '2024-01-15T10:30:00.000Z',
      sent: false
      },
    });
    expect(result).toEqual(mockNotification);
    
  });

  it('should create notification with fallback table name when environment variable is not set', async () => {
    // Arrange - explicitly delete the environment variable
    delete process.env.DYNAMODB_NOTIFICATION_TABLE_NAME;
    
    const mockNotification = {
      notificationId: '123',
      userId: 'user-456',
      message: 'Test notification',
      alertTime: '2024-01-15T10:30:00.000Z',
      sent: false
    } as Notification;

    // Act
    const result = await notificationService.createNotification(mockNotification);
    expect(result).toEqual(mockNotification);

    // Assert
    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'TABLE_FAILURE',
      Item: {
        notificationId: '123',
        userId: 'user-456',
        message: 'Test notification',
        alertTime: '2024-01-15T10:30:00.000Z',
        sent: false
      },
    });
  });

  it('should update a notification successfully with multiple fields', async () => {
    // Arrange
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
      ExpressionAttributeNames: {
        '#message': 'message',
        '#alertTime': 'alertTime',
      },
      ExpressionAttributeValues: {
        ':message': 'Updated message',
        ':alertTime': '2025-01-01T00:00:00.000Z',
      },
      ReturnValues: 'UPDATED_NEW',
    });
  
    expect(result).toEqual(JSON.stringify(mockUpdateResponse));
  });

  it('should throw error when DynamoDB update fails', async () => {
    // Arrange
    const notificationId = 'notif-fail';
    const updates = { message: 'Failure test' };
    const mockError = new Error('DynamoDB update failed');

    mockDocumentClient.update = vi.fn().mockReturnThis();
    mockPromise.mockRejectedValue(mockError);

    // Act & Assert
    await expect(notificationService.updateNotification(notificationId, updates))
      .rejects.toThrow('Failed to update Notification notif-fail');

    expect(mockDocumentClient.update).toHaveBeenCalled();
  });

  it('should correctly update a single field', async () => {
    // Arrange
    const notificationId = 'notif-single';
    const updates = { message: 'Single field update' };
    const mockUpdateResponse = { Attributes: { message: 'Single field update' } };

    mockDocumentClient.update = vi.fn().mockReturnThis();
    mockPromise.mockResolvedValue(mockUpdateResponse);

    // Act
    const result = await notificationService.updateNotification(notificationId, updates);

    // Assert
    expect(mockDocumentClient.update).toHaveBeenCalledWith({
      TableName: 'BCANNotifications',
      Key: { notificationId },
      UpdateExpression: 'SET #message = :message',
      ExpressionAttributeNames: { '#message': 'message' },
      ExpressionAttributeValues: { ':message': 'Single field update' },
      ReturnValues: 'UPDATED_NEW',
    });

    expect(result).toEqual(JSON.stringify(mockUpdateResponse));
  });


  


  describe('deleteNotification', () => {
    it('should successfully delete a notification given a valid id', async () => {
      mockPromise.mockResolvedValueOnce({})

      const result = await notificationService.deleteNotification('0')

      expect(mockDelete).toHaveBeenCalledTimes(1)

      expect(mockDelete).toHaveBeenCalledWith({
        TableName: 'BCANNotifications',
        Key: {
          notificationId: '0',
        },
        ConditionExpression: 'attribute_exists(notificationId)'
      })

      expect(result).toEqual('Notification with id 0 successfully deleted')
    })

    it('uses the fallback table when the environment variable is not set', async () => {
      delete process.env.DYNAMODB_NOTIFICATION_TABLE_NAME
      mockPromise.mockResolvedValueOnce({})

      const result = await notificationService.deleteNotification('0')

      expect(mockDelete).toHaveBeenCalledWith({
        TableName: 'TABLE_FAILURE',
        Key: {
          notificationId: '0',
        },
        ConditionExpression: 'attribute_exists(notificationId)'
      })
    })

    it('throws an error when the given notification id does not exist', async () => {
      mockPromise.mockRejectedValueOnce({
        code: 'ConditionalCheckFailedException', 
        message: 'The item does not exist' 
      });

      try {
        await notificationService.deleteNotification('999');
        throw new Error('Expected deleteNotification to throw');
      } catch (err: any) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('Notification with id 999 not found');
      }
    })
  })
});