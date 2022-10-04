import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('channel/:channel')
  getStream(@Param() channel: any) {
    return this.appService.getStream(channel.channel);
  }

  @Get('hls/v2/sig/:serverName/:id')
  firstHLSRequest(@Param() param: any) {
    return this.appService.firstHLSRequest(param.serverName, param.id);
  }
}
