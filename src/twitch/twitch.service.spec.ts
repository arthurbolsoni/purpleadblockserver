import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { TwitchService } from './twitch.service';

describe('TwitchService', () => {
  let service: TwitchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useFactory: () => ({
            timeout: 5000,
            maxRedirects: 0,
          }),
        }),
      ],
      providers: [TwitchService],
    }).compile();

    service = module.get<TwitchService>(TwitchService);
  });

  it('should be defined', async () => {
    const data = await service.playBackAccessToken('yoda');
    expect(data).toMatchObject({ data: { streamPlaybackAccessToken: {} } });
  });
});
