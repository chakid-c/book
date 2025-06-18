import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/index.dto';
import { jwtConstants } from 'src/configs/jwt.config';
import { User } from '../user/entities/user.entity';
@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) { }

    async validateUser(body: LoginDto) {
        const user = await this.userService.findByEmail(body.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const passwordHash = await bcrypt.compare(body.password, user.password);
        if (!passwordHash) {
            throw new UnauthorizedException('Invalid password');
        }
        const { password, ...result } = user;
        return result as User;
    }

    async login(body: User) {
        const user = await this.userService.findByEmail(body.email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const payload = {
            id: body.id,
            email: body.email,
            name: body.name,
        };

        const access_token = this.jwtService.sign(payload, {
            secret: jwtConstants.secret,
            expiresIn: jwtConstants.expiresIn,
        });

        return {
            userInfo: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            access_token: access_token,
        };
    }
}
