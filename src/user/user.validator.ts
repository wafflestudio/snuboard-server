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
    return '이미 동일한 아이디가 사용중입니다.';
  }
}

@ValidatorConstraint({ async: true })
export class UniqueNicknameValidator implements ValidatorConstraintInterface {
  async validate(nickname: string): Promise<boolean> {
    return !(await User.findOne({ nickname }));
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return '이미 동일한 닉네임이 사용중입니다.';
  }
}

@ValidatorConstraint()
export class NotDefinedValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return value === undefined || value === null;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Should not be defined';
  }
}
