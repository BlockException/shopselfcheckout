import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  aggregateId: string;

  @Prop({ required: true })
  aggregateType: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true, default: 0 })
  version: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Object })
  payload: any;
}

export const EventSchema = SchemaFactory.createForClass(Event);
