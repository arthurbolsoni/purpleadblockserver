import { Injectable, NotFoundException } from '@nestjs/common';
import { TwitchService } from './twitch/twitch.service';

@Injectable()
export class AppService {
  constructor(private twitchService: TwitchService) { }
  getHello(): string {
    return 'Hello World :)';
  }

  async getStream(channelName: string): Promise<string> {
    const dataAccess = await this.twitchService.playBackAccessToken(
      channelName,
    );
    if (!dataAccess.data.streamPlaybackAccessToken)
      throw new NotFoundException();

    const dataFlow = await this.twitchService.getFlow(
      channelName,
      dataAccess.data.streamPlaybackAccessToken.value,
      dataAccess.data.streamPlaybackAccessToken.signature,
    );

    const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

    let captureArray: RegExpExecArray | null = REGEX.exec(dataFlow);
    const a = await this.twitchService.HLSWatch(captureArray[2])
    const b = await this.twitchService.HLSWatch(captureArray[2])

    return dataFlow;
  }

  async firstHLSRequest(serverName: string, id: string): Promise<boolean> {
    await this.twitchService.HLSRequest(serverName, id);
    return true;
  }
}
