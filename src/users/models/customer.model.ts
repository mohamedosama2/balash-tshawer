import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from './_user.model';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  role: UserRole;

  
  
}

const CustomerSchema = SchemaFactory.createForClass(Customer);

export { CustomerSchema };
