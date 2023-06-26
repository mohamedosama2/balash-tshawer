import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './models/wallet.model';
import { WalletRepository } from './wallet.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        schema: WalletSchema,
        name: Wallet.name,
      },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService,WalletRepository],
})
export class WalletModule {}
