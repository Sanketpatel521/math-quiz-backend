import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Question, QuestionSchema } from "./schemas/question.schema";
import { Attempt, AttemptSchema } from "./schemas/attempt.schema";
import { QuizGateway } from "./quiz.gateway";
import { QuizService } from "./quiz.service";
import { QuestionGeneratorService } from "./question-generator.service";
import { ScoreModule } from "../score/score.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
    ScoreModule,
  ],
  providers: [QuizGateway, QuizService, QuestionGeneratorService],
})
export class QuizModule {}
