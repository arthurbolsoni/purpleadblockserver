import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { gqlResponse } from './types/gqlResponse.types';
import { accessTokenOptions } from './types/hlsRequest.types';
import { flowRequest } from './types/variables.types';

@Injectable()
export class TwitchService {
  constructor(private httpService: HttpService) {}

  private API_URL = 'https://gql.twitch.tv/gql';
  private API_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

  playBackAccessToken(
    login: string,
    options: accessTokenOptions = new accessTokenOptions(),
  ): Promise<gqlResponse> {
    const query =
      'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}';
    const data = {
      operationName: 'PlaybackAccessToken_Template',
      variables: { ...options, login: login },
      query: query,
    };

    const headers = {
      'Client-ID': this.API_CLIENT_ID,
    };

    return firstValueFrom(
      this.httpService
        .post(this.API_URL, data, { headers: headers })
        .pipe(map((response) => response.data)),
    );
  }

  async getFlow(
    login: string,
    token: string,
    signature: string,
    options: flowRequest = new flowRequest(),
  ): Promise<string> {
    const url =
      'https://usher.ttvnw.net/api/channel/hls/' +
      login +
      '.m3u8?allow_source=true&fast_bread=true&p=' +
      Math.floor(Math.random() * 1e7) +
      '&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=' +
      signature +
      '&supported_codecs=avc1&token=' +
      token;

    return firstValueFrom(
      await this.httpService.get(url).pipe(
        catchError((e) => {
          throw new HttpException("", 404);
        }),
        map((response) => response.data),
      ),
    );
  }

  async HLSRequest(serverName: string, id: string): Promise<string> {
    console.log();
    return firstValueFrom(
      await this.httpService
        .get(
          'https://video-weaver.' +
            serverName.slice(0, 5) +
            '.hls.ttvnw.net/v1/playlist/' +
            id +
            '.m3u8',
        )
        .pipe(
          catchError((e) => {
            throw new NotFoundException();
          }),
          map((response) => response.data),
        ),
    );
  }
}
