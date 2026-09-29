# Xinobi TypeScript API istemcisi

Bu paket, ASP.NET Core API'nin build sırasında ürettiği `packages/contracts/openapi/v1.json` belgesinden türetilir. `src/schema.d.ts` elle değiştirilmez.

Kök dizinden üretim:

```text
pnpm contracts:generate
```

Sözleşme veya üretilen tipler commit ile farklıysa başarısız olan CI kontrolü:

```text
pnpm contracts:check
```

Kullanım:

```ts
import { createXinobiApiClient } from "@xinobi/api-client";

const api = createXinobiApiClient("https://api.example.invalid");
const { data, error } = await api.GET("/api/v1/health");
```

Gerçek servis adresi ortam yapılandırmasından verilir; pakete bağlantı bilgisi veya sır yazılmaz.
