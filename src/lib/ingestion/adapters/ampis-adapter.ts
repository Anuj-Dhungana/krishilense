import { createHash } from "crypto";
import { DataSourceAdapter, RawFetchResult } from "../types";

export class AmpisPortalAdapter implements DataSourceAdapter {
  readonly adapterName = "AMPIS_PORTAL" as const;

  // Primary URL for AMPIS daily commodity prices
  private readonly targetUrl = "https://ampis.gov.np";

  async fetchLatestDailyPayload(): Promise<RawFetchResult> {
    console.log(`🌐 [AMPIS Adapter] Requesting daily data from ${this.targetUrl}...`);

    const response = await fetch(this.targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "KrishiLens-Nepal/1.0 (+https://krishilens.gov.np-research)",
        "Accept": "text/html,application/xhtml+xml,application/json",
      },
      // Timeout after 20 seconds to prevent hanging
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`AMPIS portal returned HTTP ${response.status}: ${response.statusText}`);
    }

    const rawPayload = await response.text();

    // Generate SHA-256 checksum of the canonical raw text
    const payloadChecksumSha256 = createHash("sha256")
      .update(rawPayload.trim())
      .digest("hex");

    console.log(`📦 [AMPIS Adapter] Received ${rawPayload.length} bytes (SHA-256: ${payloadChecksumSha256.slice(0, 12)}...)`);

    return {
      sourceAdapter: this.adapterName,
      fetchedAt: new Date(),
      payloadChecksumSha256,
      rawPayload,
      httpStatus: response.status,
    };
  }
}