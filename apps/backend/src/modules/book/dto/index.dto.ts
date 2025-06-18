import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class IndexBookDto {
    page: number;
    limit: number;
}

export class CreateBookDto {
    @IsString()
    title: string;

    @IsString()
    author: string;

    @IsOptional()
    @IsNumber()
    published_year: number;

    @IsOptional()
    @IsString()
    genre: string;
}


export class UpdateBookDto extends PartialType(CreateBookDto) { }