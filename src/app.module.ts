import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { QuizModule } from "./quiz/quiz.module";
import { ScoreModule } from "./score/score.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get("MONGODB_URI", "mongodb://localhost:27017/math-quiz"),
      }),
    }),
    QuizModule,
    ScoreModule,
  ],
})
export class AppModule {}
