import { EnvKey } from '@enums/env-key';
import { HttpMethod } from '@enums/http-method';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { UpstreamService } from './upstream.service';

describe('UpstreamService', () => {
  let service: UpstreamService;
  let configService: ConfigService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpstreamService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === EnvKey.apiBasePath) {
                return 'http://test';
              }
              return null;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            request: jest.fn(() =>
              of({
                data: 'test',
                headers: {},
                config: { url: 'http://test/test' },
                status: HttpStatus.OK,
                statusText: 'OK',
              }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<UpstreamService>(UpstreamService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
    expect(service).toBeDefined();
  });

  it('should execute request successfully and return correct data when api base path exists', (done) => {
    service
      .request<string>({
        path: 'test',
        method: HttpMethod.get,
      })
      .subscribe({
        next: (data) => {
          expect(data).toEqual('test');
          expect(httpService.request).toBeCalled();
          done();
        },
        error: (error) => {
          expect(error).toBeUndefined();
        },
      });
  });

  it('should execute request successfully and return correct error when api base path exists', (done) => {
    jest
      .spyOn(httpService, 'request')
      .mockReturnValue(throwError(() => new BadRequestException()));
    service
      .request<string>({
        path: 'test',
        method: HttpMethod.get,
      })
      .subscribe({
        next: (data) => {
          expect(data).toBeUndefined();
        },
        error: (error: HttpException) => {
          expect(error).toBeDefined();
          expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(httpService.request).toBeCalled();
          done();
        },
      });
  });

  it('should not execute request when api base path does not exist', (done) => {
    jest.spyOn(configService, 'get').mockReturnValue(null);
    service
      .request<string>({
        path: 'test',
        method: HttpMethod.get,
      })
      .subscribe({
        next: (data) => {
          expect(data).toBeUndefined();
        },
        error: (error: HttpException) => {
          expect(error).toBeDefined();
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(httpService.request).not.toBeCalled();
          done();
        },
      });
  });
});
