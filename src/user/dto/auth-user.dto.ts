import { IsIn, IsString, Validate, ValidateIf } from 'class-validator';
import { NotDefinedValidator } from '../user.validator';

export class AuthDto {
  @IsIn(['password', 'refresh_token'])
  grant_type!: string;

  @ValidateIf((o) => o.grant_type === 'refresh_token')
  @Validate(NotDefinedValidator, {
    message: 'only refresh_token should be given to the header, not username',
  })
  username!: string;

  @ValidateIf((o) => o.grant_type === 'refresh_token')
  @Validate(NotDefinedValidator, {
    message: 'only refresh_token should be given to the header, not password',
  })
  password!: string;
}
