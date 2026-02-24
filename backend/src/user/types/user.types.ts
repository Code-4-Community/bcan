import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../../middle-layer/types/UserStatus';
import { User } from '../../types/User';

export class ChangeRoleBody {
  user!: User
  groupName!: UserStatus;
}