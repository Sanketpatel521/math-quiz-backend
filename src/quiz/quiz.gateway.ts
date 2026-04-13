import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { QuizService } from "./quiz.service";
import { ScoreService } from "../score/score.service";

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL || "http://localhost:3000",
    credentials: true,
  },
})
export class QuizGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);

  // socketId -> username mapping
  private players = new Map<string, string>();

  constructor(
    private quizService: QuizService,
    private scoreService: ScoreService,
  ) {}

  async afterInit() {
    // generate the first question on server startup
    await this.quizService.createNewQuestion();
    this.logger.log("Quiz gateway initialized, first question created");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const username = this.players.get(client.id);
    this.players.delete(client.id);
    this.broadcastPlayerCount();
    this.logger.log(`Client disconnected: ${username || client.id}`);
  }

  @SubscribeMessage("join")
  async handleJoin(client: Socket, payload: { username: string }) {
    this.players.set(client.id, payload.username);
    this.broadcastPlayerCount();
    this.logger.log(`${payload.username} joined the quiz`);

    // send the active question to the new player
    const question = await this.quizService.getActiveQuestion();
    if (question) {
      client.emit("current_question", this.sanitizeQuestion(question));

      // if the question already has a winner (player joined during cooldown),
      // let them know so they see the winner banner
      if (question.winnerId) {
        client.emit("winner", {
          username: question.winnerId,
          questionId: question._id,
        });
      }
    }

    // send current leaderboard
    const scores = await this.scoreService.getLeaderboard();
    client.emit("scores_update", scores);
  }

  @SubscribeMessage("submit_answer")
  async handleSubmitAnswer(
    client: Socket,
    payload: { questionId: string; answer: number },
  ) {
    const username = this.players.get(client.id);
    if (!username) return;

    // parse the answer as a number in case it arrives as a string
    const numAnswer =
      typeof payload.answer === "string"
        ? parseFloat(payload.answer)
        : payload.answer;

    const result = await this.quizService.submitAnswer(
      payload.questionId,
      numAnswer,
      username,
    );

    // tell the submitter their result
    client.emit("answer_result", result);

    if (result.won) {
      // broadcast winner to everyone
      this.server.emit("winner", {
        username,
        questionId: payload.questionId,
      });

      // update the scoreboard
      await this.scoreService.incrementWin(username);
      const scores = await this.scoreService.getLeaderboard();
      this.server.emit("scores_update", scores);

      // schedule next question after cooldown
      const cooldown = this.quizService.getCooldownMs();
      this.logger.log(`${username} won! Next question in ${cooldown / 1000}s`);

      setTimeout(async () => {
        const newQuestion = await this.quizService.createNewQuestion();
        this.server.emit("new_question", this.sanitizeQuestion(newQuestion));
      }, cooldown);
    }
  }

  // never send the answer to clients
  private sanitizeQuestion(question: any) {
    return {
      _id: question._id,
      expression: question.expression,
      difficulty: question.difficulty,
    };
  }

  private broadcastPlayerCount() {
    this.server.emit("player_count", { count: this.players.size });
  }
}
