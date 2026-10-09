import { 
  pgTable, 
  text, 
  numeric, 
  date, 
  integer, 
  timestamp, 
  boolean, 
  uniqueIndex, 
  index, 
  pgEnum,
  AnyPgColumn 
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// ==============================================================================
// 1. ENUMS & DOMAIN TYPES
// ==============================================================================

export const priceMeasureTypeEnum = pgEnum("price_measure_type", [
  "MIDPOINT",           // (Min + Max) / 2 (AMPIS regional standard)
  "ARITHMETIC_MEAN",    // Sum(P_i) / N (Kalimati multi-observation standard)
  "SINGLE_TRANSACTION", // Individual stall/trader sample
  "MEDIAN",             // Middle observation
  "MODAL"               // Most frequent trading price
]);

export const agroZoneEnum = pgEnum("agro_zone", [
  "TERAI", 
  "MID_HILLS", 
  "HIGH_HILLS"
]);

export const waterRequirementEnum = pgEnum("water_requirement", [
  "LOW_RAINFED", 
  "MODERATE", 
  "HIGH_IRRIGATED"
]);

export const productionSystemEnum = pgEnum("production_system", [
  "OPEN_FIELD", 
  "PLASTIC_TUNNEL", 
  "GREENHOUSE", 
  "POND"
]);

export const municipalityTypeEnum = pgEnum("municipality_type", [
  "METROPOLITAN",
  "SUB_METROPOLITAN",
  "MUNICIPALITY",
  "RURAL_MUNICIPALITY"
]);

// ==============================================================================
// 2. GEOGRAPHIC & ADMINISTRATIVE MASTER DATA
// ==============================================================================

export const provinces = pgTable("provinces", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(), // 'koshi', 'bagmati', etc.
  nameEn: text("name_en").notNull(),
  nameNe: text("name_ne").notNull(),
});

export const administrativeDistricts = pgTable("administrative_districts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  provinceId: integer("province_id").notNull().references(() => provinces.id),
  slug: text("slug").notNull().unique(), // 'jhapa', 'kavrepalanchok'
  nameEn: text("name_en").notNull(),
  nameNe: text("name_ne").notNull(),
  defaultAgroZone: agroZoneEnum("default_agro_zone").notNull(),
  averageElevationMeters: integer("average_elevation_meters").notNull(),
});

export const municipalities = pgTable("municipalities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  districtId: integer("district_id").notNull().references(() => administrativeDistricts.id),
  slug: text("slug").notNull().unique(), // 'shivasatakshi', 'panchkhal'
  nameEn: text("name_en").notNull(),
  nameNe: text("name_ne").notNull(),
  municipalityType: municipalityTypeEnum("municipality_type").notNull(),
  elevationMeters: integer("elevation_meters").notNull(),
});

export const markets = pgTable("markets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  publicSlug: text("public_slug").notNull().unique(), // 'kalimati', 'birtamod'
  nameEn: text("name_en").notNull(),
  nameNe: text("name_ne").notNull(),
  municipalityId: integer("municipality_id").notNull().references(() => municipalities.id),
  elevationMeters: integer("elevation_meters").notNull(),
  latitude: numeric("latitude", { precision: 9, scale: 6 }).notNull(),
  longitude: numeric("longitude", { precision: 9, scale: 6 }).notNull(),
  isFederalHub: boolean("is_federal_hub").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==============================================================================
// 3. AGRONOMIC MASTER DATA (AITC / NARC BASELINE)
// ==============================================================================

export const ampisCommodities = pgTable("ampis_commodities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: text("code").notNull().unique(), // '101.1', '104.1'
  nameEn: text("name_en").notNull(),
  nameNe: text("name_ne").notNull(),
  categoryEn: text("category_en").notNull(),
  categoryNe: text("category_ne").notNull(),
  canonicalUnit: text("canonical_unit").notNull().default("kg"),
  imageUrl: text("image_url"),
  isPriorityTier1: boolean("is_priority_tier1").default(false).notNull(),
}, (t) => ({
  unqNameNe: uniqueIndex("unq_ampis_commodity_name_ne").on(t.nameNe),
}));

export const canonicalCrops = pgTable("canonical_crops", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(), // 'tomato', 'potato'
  nameEn: text("name_en").notNull(),
  nameNe: text("name_ne").notNull(),
  botanicalName: text("botanical_name"),
  baseWaterRequirement: waterRequirementEnum("base_water_requirement").notNull(),
});

export const cropVarieties = pgTable("crop_varieties", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cropId: integer("crop_id").notNull().references(() => canonicalCrops.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameNe: text("name_ne").notNull(),
  maturityDaysMin: integer("maturity_days_min").notNull(),
  maturityDaysMax: integer("maturity_days_max").notNull(),
});

export const cropVarietySystems = pgTable("crop_variety_systems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  varietyId: integer("variety_id").notNull().references(() => cropVarieties.id, { onDelete: "cascade" }),
  productionSystem: productionSystemEnum("production_system").notNull(),
  ampisCommodityId: integer("ampis_commodity_id").notNull().references(() => ampisCommodities.id),
}, (t) => ({
  unqVarietySystemMapping: uniqueIndex("unq_variety_system_mapping").on(
    t.varietyId, 
    t.productionSystem, 
    t.ampisCommodityId
  ),
}));

export const cropCalendars = pgTable("crop_calendars", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  varietySystemId: integer("variety_system_id").notNull().references(() => cropVarietySystems.id, { onDelete: "cascade" }),
  agroZone: agroZoneEnum("agro_zone").notNull(),
  altitudeMinMeters: integer("altitude_min_meters").notNull(),
  altitudeMaxMeters: integer("altitude_max_meters").notNull(),
  sowBsOptimalStartMonth: integer("sow_bs_optimal_start_month").notNull(),
  sowBsOptimalStartDay: integer("sow_bs_optimal_start_day").notNull().default(1),
  sowBsOptimalEndMonth: integer("sow_bs_optimal_end_month").notNull(),
  sowBsOptimalEndDay: integer("sow_bs_optimal_end_day").notNull().default(30),
  sowBsLateGraceDays: integer("sow_bs_late_grace_days").notNull().default(15),
  referenceDocument: text("reference_document").notNull().default("AITC Krishi Diary 2082/2083"),
});

// ==============================================================================
// 4. TIER 0: RAW INGESTION AUDIT STORE (IMMUTABLE FORENSIC LOG)
// ==============================================================================

export const rawIngestionBatches = pgTable("raw_ingestion_batches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sourceAdapter: text("source_adapter").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
  payloadChecksumSha256: text("payload_checksum_sha256").notNull(),
  storageKey: text("storage_key"),
  rawPayload: text("raw_payload").notNull(),
  status: text("status").notNull(),
  recordsExtractedCount: integer("records_extracted_count").notNull().default(0),
  recordsAcceptedCount: integer("records_accepted_count").notNull().default(0),
  recordsQuarantinedCount: integer("records_quarantined_count").notNull().default(0),
  errorLog: text("error_log"),
});

export const quarantinedObservations = pgTable("quarantined_observations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  batchId: integer("batch_id").notNull().references(() => rawIngestionBatches.id),
  rawPayloadSnippet: text("raw_payload_snippet").notNull(),
  rejectionReason: text("rejection_reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==============================================================================
// 5. TIER 1A: SOURCE OBSERVATIONS (ATOMIC FACTS FROM SOURCES)
// ==============================================================================

export const sourceObservations = pgTable("source_observations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  batchId: integer("batch_id").notNull().references(() => rawIngestionBatches.id),
  marketId: integer("market_id").notNull().references(() => markets.id),
  ampisCommodityId: integer("ampis_commodity_id").notNull().references(() => ampisCommodities.id),
  sourceSystem: text("source_system").notNull(),
  sourceDatasetIdentifier: text("source_dataset_identifier"),
  observedDateAd: date("observed_date_ad").notNull(),
  observedAtTimestamp: timestamp("observed_at_timestamp", { withTimezone: true }).notNull(),
  rawSourceRecordId: text("raw_source_record_id"),
  observedPricePrimary: numeric("observed_price_primary", { precision: 10, scale: 2 }).notNull(),
  observedPriceMin: numeric("observed_price_min", { precision: 10, scale: 2 }),
  observedPriceMax: numeric("observed_price_max", { precision: 10, scale: 2 }),
  priceMeasureType: priceMeasureTypeEnum("price_measure_type").notNull(),
  sourceUnit: text("source_unit").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxObsLookup: index("idx_source_obs_lookup").on(t.marketId, t.ampisCommodityId, t.observedDateAd),
}));

// ==============================================================================
// 6. TIER 1B: CANONICAL DAILY PRICES (AUDITABLE & VERSIONED)
// ==============================================================================

export const canonicalDailyMarketPrices = pgTable("canonical_daily_market_prices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  marketId: integer("market_id").notNull().references(() => markets.id),
  ampisCommodityId: integer("ampis_commodity_id").notNull().references(() => ampisCommodities.id),
  dateAd: date("date_ad").notNull(),
  bsYear: integer("bs_year").notNull(),
  bsMonth: integer("bs_month").notNull(),
  bsDay: integer("bs_day").notNull(),
  minPrice: numeric("min_price", { precision: 10, scale: 2 }).notNull(),
  maxPrice: numeric("max_price", { precision: 10, scale: 2 }).notNull(),
  representativePrice: numeric("representative_price", { precision: 10, scale: 2 }).notNull(),
  priceMeasureType: priceMeasureTypeEnum("price_measure_type").notNull(),
  canonicalUnit: text("canonical_unit").notNull().default("kg"),
  version: integer("version").notNull().default(1),
  isCurrent: boolean("is_current").notNull().default(true),
  supersededById: integer("superseded_by_id").references((): AnyPgColumn => canonicalDailyMarketPrices.id),
  supersededAt: timestamp("superseded_at", { withTimezone: true }),
  supersededReason: text("superseded_reason"),
  sourceObservationId: integer("source_observation_id").notNull().references(() => sourceObservations.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  // PARTIAL UNIQUE INDEX: Strictly one active canonical record per market/commodity/date
  unqActiveCanonicalDaily: uniqueIndex("unq_active_canonical_daily")
    .on(t.marketId, t.ampisCommodityId, t.dateAd)
    .where(sql`is_current = true`),
  dateAdIdx: index("idx_canonical_date_ad").on(t.dateAd),
  bsMonthIdx: index("idx_canonical_bs_month").on(t.bsMonth),
  marketCommodityIdx: index("idx_canonical_market_commodity").on(t.marketId, t.ampisCommodityId),
  commodityDateIdx: index("idx_canonical_commodity_date").on(t.ampisCommodityId, t.dateAd),
}));

// ==============================================================================
// 7. TIER 2: DERIVED ANALYTICAL BASELINES (VERSIONED WITH METHODOLOGY IN UNIQUE INDEX)
// ==============================================================================

export const monthlyMarketAggregates = pgTable("monthly_market_aggregates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  marketId: integer("market_id").notNull().references(() => markets.id),
  ampisCommodityId: integer("ampis_commodity_id").notNull().references(() => ampisCommodities.id),
  bsYear: integer("bs_year").notNull(),
  bsMonth: integer("bs_month").notNull(),
  observationCount: integer("observation_count").notNull(),
  minObservedPrice: numeric("min_observed_price", { precision: 10, scale: 2 }).notNull(),
  maxObservedPrice: numeric("max_observed_price", { precision: 10, scale: 2 }).notNull(),
  medianPrice: numeric("median_price", { precision: 10, scale: 2 }).notNull(),
  iqrP25: numeric("iqr_p25", { precision: 10, scale: 2 }).notNull(),
  iqrP75: numeric("iqr_p75", { precision: 10, scale: 2 }).notNull(),
  meanPrice: numeric("mean_price", { precision: 10, scale: 2 }).notNull(),
  withinMonthCvDaily: numeric("within_month_cv_daily", { precision: 5, scale: 2 }),
  analyticsMethodologyVersion: text("analytics_methodology_version").notNull().default("v1.1-phase3.4-A1"),
  parameterConfigVersion: text("parameter_config_version").notNull().default("param-v1.0-defaults"),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  // Multi-version safe unique index:
  unqMonthlyAggVersioned: uniqueIndex("unq_monthly_agg_versioned").on(
    t.marketId, 
    t.ampisCommodityId, 
    t.bsYear, 
    t.bsMonth,
    t.analyticsMethodologyVersion,
    t.parameterConfigVersion
  ),
  lookupIdx: index("idx_monthly_agg_market_comm_month").on(t.marketId, t.ampisCommodityId, t.bsMonth),
}));

export const seasonalBaselines = pgTable("seasonal_baselines", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  marketId: integer("market_id").notNull().references(() => markets.id),
  ampisCommodityId: integer("ampis_commodity_id").notNull().references(() => ampisCommodities.id),
  bsMonth: integer("bs_month").notNull(),
  baselineStartYearBs: integer("baseline_start_year_bs").notNull(),
  baselineEndYearBs: integer("baseline_end_year_bs").notNull(),
  baselineMonthlyMedian: numeric("baseline_monthly_median", { precision: 10, scale: 2 }).notNull(),
  grandAnnualMedian: numeric("grand_annual_median", { precision: 10, scale: 2 }),
  spi: numeric("spi", { precision: 6, scale: 2 }),
  deltaSpiPct: numeric("delta_spi_pct", { precision: 6, scale: 2 }),
  cvDaily: numeric("cv_daily", { precision: 5, scale: 2 }),
  cvAnnual: numeric("cv_annual", { precision: 5, scale: 2 }),
  validYearsCount: integer("valid_years_count").notNull(),
  totalObservationsCount: integer("total_observations_count").notNull(),
  historicalConfidenceScore: numeric("historical_confidence_score", { precision: 5, scale: 2 }).notNull(),
  analyticsMethodologyVersion: text("analytics_methodology_version").notNull().default("v1.1-phase3.4-A1"),
  parameterConfigVersion: text("parameter_config_version").notNull().default("param-v1.0-defaults"),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  // Multi-version safe unique index:
  unqSeasonalBaselineVersioned: uniqueIndex("unq_seasonal_baseline_versioned").on(
    t.marketId, 
    t.ampisCommodityId, 
    t.bsMonth,
    t.analyticsMethodologyVersion,
    t.parameterConfigVersion
  ),
}));

// ==============================================================================
// 8. RELATIONS (For clean nested queries)
// ==============================================================================

export const provincesRelations = relations(provinces, ({ many }) => ({
  districts: many(administrativeDistricts),
}));

export const administrativeDistrictsRelations = relations(administrativeDistricts, ({ one, many }) => ({
  province: one(provinces, {
    fields: [administrativeDistricts.provinceId],
    references: [provinces.id],
  }),
  municipalities: many(municipalities),
}));

export const municipalitiesRelations = relations(municipalities, ({ one, many }) => ({
  district: one(administrativeDistricts, {
    fields: [municipalities.districtId],
    references: [administrativeDistricts.id],
  }),
  markets: many(markets),
}));

export const marketsRelations = relations(markets, ({ one, many }) => ({
  municipality: one(municipalities, {
    fields: [markets.municipalityId],
    references: [municipalities.id],
  }),
  sourceObservations: many(sourceObservations),
  canonicalPrices: many(canonicalDailyMarketPrices),
  monthlyAggregates: many(monthlyMarketAggregates),
  seasonalBaselines: many(seasonalBaselines),
}));

export const ampisCommoditiesRelations = relations(ampisCommodities, ({ many }) => ({
  varietySystems: many(cropVarietySystems),
  sourceObservations: many(sourceObservations),
  canonicalPrices: many(canonicalDailyMarketPrices),
  monthlyAggregates: many(monthlyMarketAggregates),
  seasonalBaselines: many(seasonalBaselines),
}));

export const canonicalCropsRelations = relations(canonicalCrops, ({ many }) => ({
  varieties: many(cropVarieties),
}));

export const cropVarietiesRelations = relations(cropVarieties, ({ one, many }) => ({
  crop: one(canonicalCrops, {
    fields: [cropVarieties.cropId],
    references: [canonicalCrops.id],
  }),
  systems: many(cropVarietySystems),
}));

export const cropVarietySystemsRelations = relations(cropVarietySystems, ({ one, many }) => ({
  variety: one(cropVarieties, {
    fields: [cropVarietySystems.varietyId],
    references: [cropVarieties.id],
  }),
  ampisCommodity: one(ampisCommodities, {
    fields: [cropVarietySystems.ampisCommodityId],
    references: [ampisCommodities.id],
  }),
  calendars: many(cropCalendars),
}));

export const cropCalendarsRelations = relations(cropCalendars, ({ one }) => ({
  varietySystem: one(cropVarietySystems, {
    fields: [cropCalendars.varietySystemId],
    references: [cropVarietySystems.id],
  }),
}));

export const rawIngestionBatchesRelations = relations(rawIngestionBatches, ({ many }) => ({
  quarantinedObservations: many(quarantinedObservations),
  sourceObservations: many(sourceObservations),
}));

export const quarantinedObservationsRelations = relations(quarantinedObservations, ({ one }) => ({
  batch: one(rawIngestionBatches, {
    fields: [quarantinedObservations.batchId],
    references: [rawIngestionBatches.id],
  }),
}));

export const sourceObservationsRelations = relations(sourceObservations, ({ one, many }) => ({
  batch: one(rawIngestionBatches, {
    fields: [sourceObservations.batchId],
    references: [rawIngestionBatches.id],
  }),
  market: one(markets, {
    fields: [sourceObservations.marketId],
    references: [markets.id],
  }),
  ampisCommodity: one(ampisCommodities, {
    fields: [sourceObservations.ampisCommodityId],
    references: [ampisCommodities.id],
  }),
  canonicalPrices: many(canonicalDailyMarketPrices),
}));

export const canonicalDailyMarketPricesRelations = relations(canonicalDailyMarketPrices, ({ one }) => ({
  market: one(markets, {
    fields: [canonicalDailyMarketPrices.marketId],
    references: [markets.id],
  }),
  ampisCommodity: one(ampisCommodities, {
    fields: [canonicalDailyMarketPrices.ampisCommodityId],
    references: [ampisCommodities.id],
  }),
  sourceObservation: one(sourceObservations, {
    fields: [canonicalDailyMarketPrices.sourceObservationId],
    references: [sourceObservations.id],
  }),
  supersededBy: one(canonicalDailyMarketPrices, {
    fields: [canonicalDailyMarketPrices.supersededById],
    references: [canonicalDailyMarketPrices.id],
  }),
}));