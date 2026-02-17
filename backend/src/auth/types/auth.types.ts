export class RegisterBody {
  password!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
}

export class LoginBody {
  email!: string;
  password!: string;
}

export class SetPasswordBody {
  newPassword!: string;
  session!: string;
  username!: string;
  email?: string;
  
}

export class UpdateProfileBody {
  username!: string;
  email!: string;
  position_or_role!: string;
}