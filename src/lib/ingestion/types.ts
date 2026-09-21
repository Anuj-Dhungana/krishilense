export interface RawFetchResult {
  sourceAdapter: 'AMPIS_PORTAL' | 'KALIMATI_PORTAL' | 'OPEN_DATA_NEPAL_CSV';
  fetchedAt: Date;
  payloadChecksumSha256: string;
  rawPayload: string; // The exact, unaltered string received from the server
  httpStatus: number;
}

export interface DataSourceAdapter {
  readonly adapterName: string;
  fetchLatestDailyPayload(): Promise<RawFetchResult>;
}