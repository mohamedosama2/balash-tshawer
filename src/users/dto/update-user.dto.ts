import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  photo?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  district_start: string;
  @IsString()
  @IsNotEmpty()
  district_end: string;

  @IsBoolean()
  @Transform(({ obj }) => {
    return [true, 'true'].indexOf(obj.isAvailable) > -1;
  })
  isAvailable: boolean;
}

export class UpdateDriverDto extends UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  head_license_self?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  back_license_self?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  head_license_car?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  back_license_car?: string;
}

export class UpdateCustomerDto extends UpdateUserDto {}
