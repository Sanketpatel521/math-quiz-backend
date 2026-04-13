import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  expression: string;

  @Prop({ required: true })
  answer: number;

  @Prop({ default: "medium" })
  difficulty: string;

  @Prop({ default: null })
  winnerId: string;

  @Prop({ default: null })
  winnerName: string;

  @Prop({ default: null })
  solvedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
