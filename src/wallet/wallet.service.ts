import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletRepository } from './wallet.repository';
import { TransactionType } from './models/wallet.model';
import { User } from 'src/users/models/_user.model';

@Injectable()
export class WalletService {
  constructor(private readonly WalletRepositary: WalletRepository) {}
  isSameUser(from: string, to: string): boolean {
    return from === to;
  }
  async createPayment(transaction: {
    fees: number;
    user: string;
    type: TransactionType;
  }) {
    await this.WalletRepositary.create(transaction);
  }

  async moneyUserHave(user: string) {
    return await this.WalletRepositary.moneyUserHave(user);
  }
  async create({ fees, to, type }: CreateWalletDto, from: string) {
    const isSame = this.isSameUser(from, to);
    if (isSame) {
      console.log("here")
      // charge wallet
      return await this.createPayment({ fees, type, user: to });
    }
    // not same one : payment
    const userWallet = await this.moneyUserHave(from);
    console.log(userWallet);

    // check if the money is enough to pay

    // if (userWallet[0].money < fees)
    //   throw new BadRequestException(
    //     `you have in your wallet ${userWallet} and you want to pay ${fees}`,
    //   );
    // check the wallet if it has enough

    await this.createPayment({ user: to, type: TransactionType.ADD, fees });
    await this.createPayment({
      user: from,
      type: TransactionType.DELETE,
      fees: -fees,
    });

    return 'payment succedd';
  }

  async findAll(me: User) {
    const myMoney = await this.WalletRepositary.moneyUserHave(me.id);
    const myTransactions = await this.WalletRepositary.findPayments(me.id);
    return {
      myMoney,
      myTransactions,// dev reasons
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} wallet`;
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}
