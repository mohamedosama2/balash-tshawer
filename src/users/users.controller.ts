import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Inject,
  UseFilters,
  UploadedFiles,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpCode,
  Query,
  CacheInterceptor,
  CacheKey,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { request } from 'http';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User, UserDocument, UserRole } from './models/_user.model';
import { UsersService } from './users.service';
import { REQUEST } from '@nestjs/core';
import { AuthUser } from 'src/auth/decorators/me.decorator';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { PaginationParams } from 'src/utils/pagination/paginationParams.dto';
import ParamsWithId from 'src/utils/paramsWithId.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { FilterQuery, PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseGeneral } from 'src/utils/pagination/apiOkResponseGeneral';

import { FilterQueryOptionsUser } from './dto/filterQueryOptions.dto';
import { UserRepository } from './users.repository';
import { Constants } from 'src/utils/constants';
import { UpdateCustomerDto, UpdateDriverDto } from './dto/update-user.dto';

@ApiBearerAuth()
@ApiTags('USERS')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly UserRepository: UserRepository,
    @Inject(REQUEST) private readonly req: Record<string, unknown>,
  ) {}

  // @Roles(UserRole.STUDENT)
  // @CacheKey(Constants.GET_POSTS_CACHE_KEY)
  @Public()
  @ApiOkResponseGeneral(User)
  @Get()
  async findAll(
    @Query() queryFiltersAndOptions: FilterQueryOptionsUser,
  ): Promise<PaginateResult<UserDocument> | UserDocument[]> {
    return await this.usersService.findAll(
      queryFiltersAndOptions as FilterQueryOptionsUser,
    );
  }

  @Get('profile')
  async getProfile(): Promise<UserDocument> {
    return await this.usersService.getProfile(this.req.me as UserDocument);
  }

  @Roles(UserRole.DRIVER)
  @Patch('/profile/driver')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'head_license_self', maxCount: 1 },
      { name: 'back_license_self', maxCount: 1 },
      { name: 'head_license_car', maxCount: 1 },
      { name: 'back_license_car', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  async updateProfileDriver(
    @UploadedFiles()
    files,
    @Body() updateUserData: UpdateDriverDto,
  ): Promise<UserDocument> {
    if (files && files.photo) updateUserData.photo = files.photo[0].secure_url;
    if (files && files.head_license_self)
      updateUserData.head_license_self = files.head_license_self[0].secure_url;
    if (files && files.back_license_self)
      updateUserData.back_license_self = files.back_license_self[0].secure_url;
    if (files && files.head_license_car)
      updateUserData.head_license_car = files.head_license_car[0].secure_url;
    if (files && files.back_license_car)
      updateUserData.back_license_car = files.back_license_car[0].secure_url;

    delete updateUserData.enabled;

/*     console.log(updateUserData)
 */
    return await this.usersService.update(
      { _id: this.req.me } as FilterQuery<UserDocument>,
      updateUserData,
    );
  }

  @Roles(UserRole.CUSTOMER)
  @Patch('/profile/customer')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photo', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  async updateProfileCustomer(
    @UploadedFiles()
    files,
    @Body() updateUserData: UpdateCustomerDto,
  ): Promise<UserDocument> {
    if (files && files.photo) updateUserData.photo = files.photo[0].secure_url;

    delete updateUserData.enabled;
    console.log(updateUserData);

    return await this.usersService.update(
      { _id: this.req.me } as FilterQuery<UserDocument>,
      updateUserData,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('/change-password')
  async changePassword(
    @Body() { oldPassword, newPassword }: ChangePasswordDto,
    @AuthUser() me: UserDocument,
  ): Promise<UserDocument> {
    return await this.usersService.changePassword(
      { oldPassword, newPassword },
      me,
    );
  }

  @Get('get-my-markers')
  async getMyStrictMarkers(@AuthUser() me: User) {
      console.log("get my markers ")
    return this.usersService.getMyStrictMarkers(me);
  }

  @Public()
  @Get(':id')
  async fetchUserById(@Param() { id }: ParamsWithId): Promise<UserDocument> {
    return await this.usersService.findOne({
      _id: id,
    } as FilterQuery<UserDocument>);
  }
}
