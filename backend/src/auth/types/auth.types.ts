export class RegisterBody {
  username!: string;
  password!: string;
  email!: string;
}

export class LoginBody {
  username!: string;
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