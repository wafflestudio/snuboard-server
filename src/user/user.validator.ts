import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { User } from './user.entity';

@ValidatorConstraint({ async: true })
export class UniqueUsernameValidator implements ValidatorConstraintInterface {
  async validate(username: string): Promise<boolean> {
    return !(await User.findOne({ username }));
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Duplicate Username Error';
  }
}

@ValidatorConstraint({ async: true })
export class UniqueNicknameValidator implements ValidatorConstraintInterface {
  async validate(nickname: string): Promise<boolean> {
    return !(await User.findOne({ nickname }));
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Duplicate Nickname Error';
  }
}

@ValidatorConstraint()
export class NotDefinedValidator implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    return value === undefined || value === null;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Should not be defined';
  }
}
