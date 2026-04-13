import { Injectable } from "@nestjs/common";

interface GeneratedQuestion {
  expression: string;
  answer: number;
  difficulty: string;
}

@Injectable()
export class QuestionGeneratorService {
  generate(): GeneratedQuestion {
    const difficulties = ["easy", "easy", "medium", "medium", "hard"];
    const difficulty =
      difficulties[Math.floor(Math.random() * difficulties.length)];

    switch (difficulty) {
      case "easy":
        return this.generateEasy();
      case "hard":
        return this.generateHard();
      default:
        return this.generateMedium();
    }
  }

  private generateEasy(): GeneratedQuestion {
    const ops = ["+", "-"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = this.rand(10, 50);
    const b = this.rand(1, 30);

    const expression = `${a} ${op} ${b}`;
    const answer = op === "+" ? a + b : a - b;
    return { expression, answer, difficulty: "easy" };
  }

  private generateMedium(): GeneratedQuestion {
    const useDivision = Math.random() > 0.5;

    if (useDivision) {
      const b = this.rand(2, 12);
      const answer = this.rand(2, 15);
      const a = b * answer;
      return { expression: `${a} ÷ ${b}`, answer, difficulty: "medium" };
    }

    const a = this.rand(2, 15);
    const b = this.rand(2, 12);
    return { expression: `${a} × ${b}`, answer: a * b, difficulty: "medium" };
  }

  private generateHard(): GeneratedQuestion {
    const type = Math.floor(Math.random() * 3);

    if (type === 0) {
      const base = this.rand(2, 9);
      const exp = this.rand(2, 3);
      return {
        expression: `${base}^${exp}`,
        answer: Math.pow(base, exp),
        difficulty: "hard",
      };
    }

    if (type === 1) {
      const a = this.rand(2, 10);
      const b = this.rand(2, 10);
      const c = this.rand(1, 20);
      return {
        expression: `${a} × ${b} + ${c}`,
        answer: a * b + c,
        difficulty: "hard",
      };
    }

    const a = this.rand(3, 12);
    const b = this.rand(1, 20);
    return {
      expression: `${a}² - ${b}`,
      answer: a * a - b,
      difficulty: "hard",
    };
  }

  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
