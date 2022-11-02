import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { HttpModule } from '@nestjs/axios';
import { UpstreamService } from '@upstream/upstream.service';
import { HealthModule } from '@modules/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(
        process.cwd(),
        'env',
        !ENV ? '.env' : `.env.${ENV}`,
      ),
    }),
    HttpModule,
    HealthModule,
    AuthModule,
  ],
  providers: [UpstreamService],
})
export class AppModule {}
