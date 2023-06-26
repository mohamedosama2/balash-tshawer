import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseAbstractRepository } from 'src/utils/base.abstract.repository';
import { Wallet, WalletDocument } from './models/wallet.model';
import * as mongoose from 'mongoose';

@Injectable()
export class WalletRepository extends BaseAbstractRepository<Wallet> {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {
    super(walletModel);
  }

  async moneyUserHave(user: string): Promise<
    {
      money: number;
    }[]
  > {
    
    return await this.walletModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(user) } },
      { $group: { _id: { user: '$user' }, money: { $sum: '$fees' } } },
      { $project: { _id: 0 } },
    ]);
  }

  async findPayments(user: string) {
    return await this.walletModel.find(
      { user },
      { fees: 1, createdAt: 1, _id: 0 },
    );
  }
}
