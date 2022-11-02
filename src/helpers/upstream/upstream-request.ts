import { HttpMethod } from '@enums/http-method';

export interface UpstreamRequest {
  path: string;
  method: HttpMethod;
  body?: unknown | null;
}
