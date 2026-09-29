import { createXinobiApiClient } from "./index.js";

const client = createXinobiApiClient("https://api.example.invalid");

async function verifyGeneratedContractTypes(): Promise<void> {
  const { data, error } = await client.GET("/api/v1/health");

  if (error) {
    return;
  }

  data.service satisfies string;
  data.status satisfies string;
  data.timestampUtc satisfies string;
  data.requestId satisfies string;
}

void verifyGeneratedContractTypes;
