import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { gqlResponse } from './types/gqlResponse.types';
import { accessTokenOptions } from './types/hlsRequest.types';
import { flowRequest } from './types/variables.types';

@Injectable()
export class TwitchService {
  constructor(private httpService: HttpService) { }

  private API_URL = 'https://gql.twitch.tv/gql';
  private API_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

  generateRandomString(): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generateRandomNumber(): number {
    return Math.floor(Math.random() * (10000000 - 0)) + 0;
  }


  playBackAccessToken(
    login: string,
    options: accessTokenOptions = new accessTokenOptions(),
  ): Promise<gqlResponse> {
    // const query =
    //   'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}';
    // const data = {
    //   operationName: 'PlaybackAccessToken_Template',
    //   variables: { ...options, login: login },
    //   query: query,
    // };

    const query = {
      "operationName": "PlaybackAccessToken",
      "variables": {
        "isLive": true,
        "login": login,
        "isVod": false,
        "vodID": "",
        "playerType": options.playerType
      },
      "extensions": {
        "persistedQuery": {
          "version": 1,
          "sha256Hash": "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"
        }
      }
    }

    const headers = {
      'Client-ID': this.API_CLIENT_ID,
      'Device-ID': this.generateRandomString(),
    };

    return firstValueFrom(
      this.httpService
        .post(this.API_URL, query, { headers: headers })
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
      '.m3u8?allow_source=true&fast_bread=true&p=' + this.generateRandomNumber() +
      '&play_session_id=' + this.generateRandomString().toLowerCase() +
      '&acmb=e30=' +
      // Math.floor(Math.random() * 1e7) +
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

  async HLSWatch(url: string): Promise<boolean> {
    try {
      return firstValueFrom(
        await this.httpService.get(url).pipe(
          catchError((e) => {
            throw new HttpException("", 404);
          }),
          map((response) => response.data),
        )
      )
    } catch (e) {
      return false;
    }
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
