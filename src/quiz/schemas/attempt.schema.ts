import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Attempt extends Document {
  @Prop({ type: Types.ObjectId, ref: "Question", required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  answer: number;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ required: true })
  receivedAt: Date;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
