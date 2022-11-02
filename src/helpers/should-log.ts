import { ConfigService } from '@nestjs/config';
import { EnvKey } from '@enums/env-key';
import { EnvType } from '@enums/env-type';

export function shouldLog(configService: ConfigService): boolean {
  const env = configService.get(EnvKey.environment) as string;
  if (env) {
    return env !== EnvType.testing && env !== EnvType.production;
  }
  return false;
}
