import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class UserScore extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ default: 0 })
  wins: number;

  @Prop({ default: 0 })
  totalAttempts: number;

  @Prop({ default: Date.now })
  lastActive: Date;
}

export const UserScoreSchema = SchemaFactory.createForClass(UserScore);
