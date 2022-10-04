import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwitchModule } from './twitch/twitch.module';

@Module({
  imports: [TwitchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
