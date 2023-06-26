import { IsEnum, IsMongoId, IsNumber } from 'class-validator';
import { TransactionType } from '../models/wallet.model';

export class CreateWalletDto {
  

  @IsMongoId()
  to: string;

  @IsNumber()
  fees: number;

  @IsEnum(TransactionType)
  type: TransactionType;
}
