import { Request } from 'express';
import { User } from '../user/user.entity';

export class Payload {
  username: string;
  id: number;
}

export interface UserRequest extends Request {
  user?: User;
}
