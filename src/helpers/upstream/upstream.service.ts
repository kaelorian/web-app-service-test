import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable, throwError } from 'rxjs';
import { EnvKey } from '@enums/env-key';
import { UpstreamRequest } from './upstream-request';
import { shouldLog } from 'src/helpers/should-log';

@Injectable()
export class UpstreamService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  request<T>(request: UpstreamRequest): Observable<T> {
    const baseApiPath = this.configService.get(EnvKey.apiBasePath) as string;
    if (baseApiPath) {
      return this.httpService
        .request({
          url: request.path,
          baseURL: baseApiPath,
          method: request.method,
          data: request.body,
          timeout: 3000,
          responseType: 'json',
        })
        .pipe(map((response) => response.data));
    }
    if (shouldLog(this.configService)) {
      Logger.error('Base API path does not exist');
    }
    return throwError(() => new InternalServerErrorException());
  }
}
