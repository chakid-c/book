import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateBookDto, IndexBookDto, UpdateBookDto } from './dto/index.dto';
import { DataSource, Not } from 'typeorm';
import { Book } from './entities/book.entity';
@Injectable()
export class BookService {
  constructor(
    private dataSource: DataSource
  ) { }

  async store(createBookDto: CreateBookDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookRepository = queryRunner.manager.getRepository(Book);
      const book = await bookRepository.create(createBookDto);
      await queryRunner.manager.save(book);
      await queryRunner.commitTransaction();
      return {
        message: 'Book created successfully',
        result: book
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(param: IndexBookDto) {
    try {
      const { page = 1, limit = 10 } = param;
      const bookRepository = this.dataSource.getRepository(Book);
      const [result, total] = await bookRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit
      });
      return {
        result: result,
        total: total,
        Math: Math.ceil(total / limit),
        page: page,
        limit: limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const bookRepository = this.dataSource.getRepository(Book);
      const result = await bookRepository.findOne({
        where: { id: id }
      });
      if (!result) {
        throw new NotFoundException('Book not found');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookRepository = queryRunner.manager.getRepository(Book);
      const book = await bookRepository.findOne({
        where: { id: id }
      });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      bookRepository.merge(book, updateBookDto);
      await bookRepository.save(book);
      await queryRunner.commitTransaction();
      return {
        message: 'Book updated successfully',
        result: book
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookRepository = queryRunner.manager.getRepository(Book);
      const book = await bookRepository.findOne({
        where: { id: id }
      });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      await bookRepository.remove(book);
      await queryRunner.commitTransaction();
      return {
        message: 'Book deleted successfully',
        result: book
      };
    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
