import { HttpModule, HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { catchError, firstValueFrom, map } from 'rxjs';
import { TwitchService } from './twitch.service';

describe('TwitchService', () => {
  const channel = '';

  let service: TwitchService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useFactory: () => ({
            timeout: 15000,
            maxRedirects: 0,
          }),
        }),
      ],
      providers: [TwitchService],
    }).compile();

    service = module.get<TwitchService>(TwitchService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should return token', async () => {
    const data = await service.playBackAccessToken(channel);
    expect(data).toMatchObject({ data: { streamPlaybackAccessToken: {} } });
  });

  it('should return playlist', async () => {
    const dataAccess = await service.playBackAccessToken(channel);
    const data = await service.getFlow(
      channel,
      dataAccess.data.streamPlaybackAccessToken.value,
      dataAccess.data.streamPlaybackAccessToken.signature,
    );

    expect(data).toMatch('.m3u8');
  });

  const testAds = () => {
    for (var i = 0, len = 10; i < len; i++) {
      it('should return withot ads', async () => {
        const dataAccess = await service.playBackAccessToken(channel);
        const data = await service.getFlow(
          channel,
          dataAccess.data.streamPlaybackAccessToken.value,
          dataAccess.data.streamPlaybackAccessToken.signature,
        );

        const REGEX =
          /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;
        const match: RegExpExecArray | null = REGEX.exec(data);
        const url = match[0];

        const stream = await firstValueFrom(
          await httpService
            .get('https://' + url)
            .pipe(map((response) => response.data)),
        );

        expect(stream).not.toMatch('stitched');
      });
    }
  };

  testAds();
});
