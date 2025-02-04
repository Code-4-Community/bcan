import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
    validate,
  } from 'class-validator';
  
  // Custom validator logic
  @ValidatorConstraint({ name: 'isEmailOrPhoneFormat', async: false })
  export class IsEmailOrPhoneFormatConstraint implements ValidatorConstraintInterface {
    private async isEmail(value: string): Promise<boolean> {
      // Use the built-in IsEmail validator as a function
      const errors = await validate({ email: value.replace('Email: ', '') }, { skipMissingProperties: true });
      return errors.length === 0; // No errors means the email is valid
    }
  
    private isPhoneNumber(value: string): boolean {
      // Simple check for "Phone Number: " prefix and a valid phone number format
      if (!value.startsWith('Phone Number: ')) return false;
      const phoneNumber = value.replace('Phone Number: ', '');
      // Example: Validate phone number format (adjust as needed)
      return /^\+\d{1,3} \d{3,14}$/.test(phoneNumber); // Example: +1 1234567890
    }
  
    async validate(value: string, args: ValidationArguments) {
      if (value.startsWith('Email: ')) {
        return this.isEmail(value);
      } else if (value.startsWith('Phone Number: ')) {
        return this.isPhoneNumber(value);
      }
      return false; // Invalid format
    }
  
    defaultMessage(args: ValidationArguments) {
      return `The value must be in the format "Email: <email>" or "Phone Number: <phone number>"`;
    }
  }
  
  // Decorator for easier use
  export function IsPointOfContact(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsEmailOrPhoneFormatConstraint,
      });
    };
  }