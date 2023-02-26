import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { gqlResponse } from './types/gqlResponse.types';
import { accessTokenOptions } from './types/hlsRequest.types';
const zlib = require('zlib');

@Injectable()
export class TwitchService {
  constructor(private httpService: HttpService) { }

  private API_URL = 'https://gql.twitch.tv/gql';
  private API_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

  generateToken(length: number): string {
    const characters = 'abcdef0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters.charAt(randomIndex);
      token += randomCharacter;
    }
    return token;
  }

  async playBackAccessToken(
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

    //random device id
    const deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const headers = {
      'Client-ID': this.API_CLIENT_ID,
      'Device-ID': deviceId,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.twitch.tv/',
      'Content-Type': 'text/plain; charset=UTF-8',
      'Origin': 'https://www.twitch.tv',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
    };

    const value = await firstValueFrom(
      this.httpService
        .post(this.API_URL, data, { headers: headers, responseType: 'arraybuffer' })
        .pipe(map((response) => {

          const contentEncoding = response.headers['content-encoding'];
          let data = response.data;

          // Verifique se a resposta está codificada com gzip, deflate ou br
          if (contentEncoding === 'gzip') {
            data = zlib.gunzipSync(data);
          } else if (contentEncoding === 'deflate') {
            data = zlib.inflateRawSync(data);
          } else if (contentEncoding === 'br') {
            data = zlib.brotliDecompressSync(data);
          }

          return JSON.parse(data.toString()) as gqlResponse;
        }
        )),
    );

    return value;
  }

  async getFlow(
    login: string,
    token: string,
    signature: string,
  ): Promise<string> {
    const url =
      'https://usher.ttvnw.net/api/channel/hls/' +
      login +
      '.m3u8?allow_source=true&fast_bread=true' +
      '&p=' + Math.floor(Math.random() * 1e7) +
      '&play_session_id=' + this.generateToken(32) +
      '&cdm=wv' +
      '&player_version=1.17.0' +
      '&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&sig=' +
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
    return firstValueFrom(
      await this.httpService.get(url).pipe(
        catchError((e) => {
          throw new NotFoundException();
        }),
        map((response) => response.data),
      ),
    ) ? true : false;

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
