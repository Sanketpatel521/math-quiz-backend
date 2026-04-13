import { Controller, Get } from "@nestjs/common";
import { ScoreService } from "./score.service";

@Controller("scores")
export class ScoreController {
  constructor(private scoreService: ScoreService) {}

  @Get()
  async getLeaderboard() {
    return this.scoreService.getLeaderboard();
  }
}
