import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserScore } from "./schemas/user-score.schema";

@Injectable()
export class ScoreService {
  constructor(
    @InjectModel(UserScore.name) private scoreModel: Model<UserScore>,
  ) {}

  async incrementWin(username: string): Promise<void> {
    await this.scoreModel.findOneAndUpdate(
      { username },
      { $inc: { wins: 1 }, $set: { lastActive: new Date() } },
      { upsert: true },
    );
  }

  async getLeaderboard(limit = 10): Promise<UserScore[]> {
    return this.scoreModel.find().sort({ wins: -1 }).limit(limit).exec();
  }
}
