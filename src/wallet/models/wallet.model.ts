import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/models/_user.model';
export type WalletDocument = Wallet & mongoose.Document;

export enum TransactionType {
  ADD = 'ADD',
  DELETE = 'DELETE',
}

@Schema({ timestamps: true })
export class Wallet {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: string;

  @Prop(Number)
  fees: number;

  @Prop({ type: String, required: true, enum: Object.values(TransactionType) })
  type: TransactionType;
}
const WalletSchema = SchemaFactory.createForClass(Wallet);

export { WalletSchema };
