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

  generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return result;
  }
  
  playBackAccessToken(
    login: string,
    options: accessTokenOptions = new accessTokenOptions(),
  ): Promise<gqlResponse> {
    const query =
    "query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: \"web\", playerBackend: \"mediaplayer\", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: \"web\", playerBackend: \"mediaplayer\", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}"

    const data = {
      operationName: 'PlaybackAccessToken_Template',
      "variables": {
        "isLive": true,
        "login": login,
        "isVod": false,
        "vodID": "",
        "playerType": "site",
      },
      query: query,
    };

    // const query = {
    //   "operationName": "PlaybackAccessToken",
    //   "variables": {
    //     "isLive": true,
    //     "login": login,
    //     "isVod": false,
    //     "vodID": "",
    //     "playerType": options.playerType
    //   },
    //   "extensions": {
    //     "persistedQuery": {
    //       "version": 1,
    //       "sha256Hash": "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"
    //     }
    //   }
    // }

    const headers = {
      'Client-ID': this.API_CLIENT_ID,
      'Device-ID': this.generateRandomString(32),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
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
      'https://usher.ttvnw.net/api/channel/hls/' + login + '.m3u8?' +
      'acmb=e30%3D&allow_source=true&fast_bread=true&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&supported_codecs=avc1&cdm=wv&player_version=1.16.0' +
      '&sig=' + signature +
      '&token=' + token


    return firstValueFrom(
      await this.httpService.get(url).pipe(
        catchError((e) => {
          throw new HttpException("", 404);
        }),
        map((response) => response.data),
      ),
    );
  }

  async HLSWatch(url: string): Promise<boolean> {
    return firstValueFrom(
      await this.httpService.get(url).pipe(
        catchError((e) => {
          throw new HttpException("", 404);
        }),
        map((response) => response.data),
      )
    )
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
