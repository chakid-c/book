import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, IndexBookDto, UpdateBookDto } from './dto/index.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) { }

  @Post()
  store(@Body() createBookDto: CreateBookDto) {
    return this.bookService.store(createBookDto);
  }

  @Get()
  findAll(@Query() param: IndexBookDto) {
    return this.bookService.findAll(param);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.bookService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.bookService.remove(id);
  }
}
