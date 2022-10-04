import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TwitchService } from './twitch.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 0,
      }),
    }),
  ],
  exports: [TwitchService],
  providers: [TwitchService],
})
export class TwitchModule {}
