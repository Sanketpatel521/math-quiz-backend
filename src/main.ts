import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get("WEB_URL", "http://localhost:3000"),
    credentials: true,
  });

  const port = config.get("PORT", 3001);
  await app.listen(port);
}
bootstrap();
