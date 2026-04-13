import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Question } from "./schemas/question.schema";
import { Attempt } from "./schemas/attempt.schema";
import { QuestionGeneratorService } from "./question-generator.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private activeQuestionId: string | null = null;

  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Attempt.name) private attemptModel: Model<Attempt>,
    private questionGenerator: QuestionGeneratorService,
    private config: ConfigService,
  ) {}

  async createNewQuestion(): Promise<Question> {
    const generated = this.questionGenerator.generate();
    const question = await this.questionModel.create(generated);
    this.activeQuestionId = question._id.toString();
    this.logger.log(
      `New question: ${generated.expression} = ${generated.answer}`,
    );
    return question;
  }

  getActiveQuestionId(): string | null {
    return this.activeQuestionId;
  }

  async getActiveQuestion(): Promise<Question | null> {
    if (!this.activeQuestionId) return null;
    return this.questionModel.findById(this.activeQuestionId);
  }

  async submitAnswer(
    questionId: string,
    answer: number,
    username: string,
  ): Promise<{ correct: boolean; won: boolean }> {
    const isCorrect = await this.checkAnswer(questionId, answer);

    await this.attemptModel.create({
      questionId,
      username,
      answer,
      isCorrect,
      receivedAt: new Date(),
    });

    if (!isCorrect) {
      return { correct: false, won: false };
    }

    const updated = await this.questionModel.findOneAndUpdate(
      { _id: questionId, winnerId: null },
      {
        winnerId: username,
        solvedAt: new Date(),
      },
      { new: true },
    );

    const won = updated !== null;
    return { correct: true, won };
  }

  private async checkAnswer(
    questionId: string,
    answer: number,
  ): Promise<boolean> {
    const question = await this.questionModel.findById(questionId);
    if (!question) return false;
    return question.answer === answer;
  }

  getCooldownMs(): number {
    return this.config.get<number>("QUESTION_COOLDOWN_MS", 5000);
  }
}
