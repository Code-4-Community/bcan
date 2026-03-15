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
  email!: string;
  
}

export class ChangePasswordBody {
  currentPassword!: string;
  newPassword!: string;
}

export class UpdateProfileBody {
  email!: string;
  firstName!: string;
  lastName!: string;
}