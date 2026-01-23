import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../../middle-layer/types/UserStatus';

export class ChangeRoleBody {
  user!: {   
    userId: string,
    position: UserStatus,
    email: string 
  };
  groupName!: UserStatus;
  requestedBy!: {   
    userId: string,
    position: UserStatus,
    email: string 
  };
}

export class DeleteUserBody {
  user!: {   
    userId: string,
    position: UserStatus,
    email: string 
  };
  requestedBy!: {   
    userId: string,
    position: UserStatus,
    email: string 
  };
}