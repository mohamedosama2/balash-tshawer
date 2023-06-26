import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User, UserRole } from './_user.model';

export type DriverDocument = Driver & Document;

@Schema()
export class Driver {
  role: UserRole;

  @Prop({ type: String })
  head_license_self: string;

  @Prop({ type: String })
  back_license_self: string;

  @Prop({ type: String })
  head_license_car: string;

  @Prop({ type: String })
  back_license_car: string;
}

const DriverSchema = SchemaFactory.createForClass(Driver);

export { DriverSchema };
