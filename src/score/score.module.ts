import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserScore, UserScoreSchema } from "./schemas/user-score.schema";
import { ScoreService } from "./score.service";
import { ScoreController } from "./score.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserScore.name, schema: UserScoreSchema },
    ]),
  ],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
