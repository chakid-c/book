import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/index.dto';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource
  ) { }

  async findByEmail(email: string) {
    try {
      const userRepository = this.dataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { email: email },
      });
      if (!user) {
        return null;
      };
      return user;
    } catch (e) {
      throw e;
    }
  }

  async store(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userRepository = queryRunner.manager.getRepository(User);
      const userData = await userRepository.findOne({
        where: { email: createUserDto.email }
      });
      if (userData) {
        throw new UnauthorizedException('Email already exists');
      }
      const user = await userRepository.create(createUserDto);
      await queryRunner.manager.save(user);
      const withOutPassword = { ...user, password: undefined };
      await queryRunner.commitTransaction();
      return withOutPassword;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
