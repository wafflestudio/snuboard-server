import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [AuthModule, FirebaseModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
