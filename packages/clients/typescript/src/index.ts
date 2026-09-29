import createClient from "openapi-fetch";

import type { paths } from "./schema.js";

export type XinobiApiClient = ReturnType<typeof createClient<paths>>;

export function createXinobiApiClient(baseUrl: string): XinobiApiClient {
  return createClient<paths>({ baseUrl });
}
