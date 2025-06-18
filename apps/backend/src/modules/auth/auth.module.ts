import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/configs/jwt.config';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategy/jwt.strategy';
@Module({
  imports: [
    JwtModule.register(jwtConstants),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
