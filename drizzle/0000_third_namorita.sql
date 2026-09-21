CREATE TYPE "public"."agro_zone" AS ENUM('TERAI', 'MID_HILLS', 'HIGH_HILLS');--> statement-breakpoint
CREATE TYPE "public"."municipality_type" AS ENUM('METROPOLITAN', 'SUB_METROPOLITAN', 'MUNICIPALITY', 'RURAL_MUNICIPALITY');--> statement-breakpoint
CREATE TYPE "public"."price_measure_type" AS ENUM('MIDPOINT', 'ARITHMETIC_MEAN', 'SINGLE_TRANSACTION', 'MEDIAN', 'MODAL');--> statement-breakpoint
CREATE TYPE "public"."production_system" AS ENUM('OPEN_FIELD', 'PLASTIC_TUNNEL', 'GREENHOUSE', 'POND');--> statement-breakpoint
CREATE TYPE "public"."water_requirement" AS ENUM('LOW_RAINFED', 'MODERATE', 'HIGH_IRRIGATED');--> statement-breakpoint
CREATE TABLE "administrative_districts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "administrative_districts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"province_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ne" text NOT NULL,
	"default_agro_zone" "agro_zone" NOT NULL,
	"average_elevation_meters" integer NOT NULL,
	CONSTRAINT "administrative_districts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ampis_commodities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ampis_commodities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ne" text NOT NULL,
	"category_en" text NOT NULL,
	"category_ne" text NOT NULL,
	"canonical_unit" text DEFAULT 'kg' NOT NULL,
	"is_priority_tier1" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ampis_commodities_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "canonical_crops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "canonical_crops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ne" text NOT NULL,
	"botanical_name" text,
	"base_water_requirement" "water_requirement" NOT NULL,
	CONSTRAINT "canonical_crops_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "canonical_daily_market_prices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "canonical_daily_market_prices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"market_id" integer NOT NULL,
	"ampis_commodity_id" integer NOT NULL,
	"date_ad" date NOT NULL,
	"bs_year" integer NOT NULL,
	"bs_month" integer NOT NULL,
	"bs_day" integer NOT NULL,
	"min_price" numeric(10, 2) NOT NULL,
	"max_price" numeric(10, 2) NOT NULL,
	"representative_price" numeric(10, 2) NOT NULL,
	"price_measure_type" "price_measure_type" NOT NULL,
	"canonical_unit" text DEFAULT 'kg' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"superseded_by_id" integer,
	"superseded_at" timestamp with time zone,
	"superseded_reason" text,
	"source_observation_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_calendars" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "crop_calendars_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"variety_system_id" integer NOT NULL,
	"agro_zone" "agro_zone" NOT NULL,
	"altitude_min_meters" integer NOT NULL,
	"altitude_max_meters" integer NOT NULL,
	"sow_bs_optimal_start_month" integer NOT NULL,
	"sow_bs_optimal_start_day" integer DEFAULT 1 NOT NULL,
	"sow_bs_optimal_end_month" integer NOT NULL,
	"sow_bs_optimal_end_day" integer DEFAULT 30 NOT NULL,
	"sow_bs_late_grace_days" integer DEFAULT 15 NOT NULL,
	"reference_document" text DEFAULT 'AITC Krishi Diary 2082/2083' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_varieties" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "crop_varieties_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"crop_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ne" text NOT NULL,
	"maturity_days_min" integer NOT NULL,
	"maturity_days_max" integer NOT NULL,
	CONSTRAINT "crop_varieties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "crop_variety_systems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "crop_variety_systems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"variety_id" integer NOT NULL,
	"production_system" "production_system" NOT NULL,
	"ampis_commodity_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "markets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "markets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"public_slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ne" text NOT NULL,
	"municipality_id" integer NOT NULL,
	"elevation_meters" integer NOT NULL,
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"is_federal_hub" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "markets_public_slug_unique" UNIQUE("public_slug")
);
--> statement-breakpoint
CREATE TABLE "monthly_market_aggregates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monthly_market_aggregates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"market_id" integer NOT NULL,
	"ampis_commodity_id" integer NOT NULL,
	"bs_year" integer NOT NULL,
	"bs_month" integer NOT NULL,
	"observation_count" integer NOT NULL,
	"min_observed_price" numeric(10, 2) NOT NULL,
	"max_observed_price" numeric(10, 2) NOT NULL,
	"median_price" numeric(10, 2) NOT NULL,
	"iqr_p25" numeric(10, 2) NOT NULL,
	"iqr_p75" numeric(10, 2) NOT NULL,
	"mean_price" numeric(10, 2) NOT NULL,
	"within_month_cv_daily" numeric(5, 2),
	"analytics_methodology_version" text DEFAULT 'v1.1-phase3.4-A1' NOT NULL,
	"parameter_config_version" text DEFAULT 'param-v1.0-defaults' NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "municipalities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "municipalities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"district_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ne" text NOT NULL,
	"municipality_type" "municipality_type" NOT NULL,
	"elevation_meters" integer NOT NULL,
	CONSTRAINT "municipalities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "provinces_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ne" text NOT NULL,
	CONSTRAINT "provinces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quarantined_observations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quarantined_observations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" integer NOT NULL,
	"raw_payload_snippet" text NOT NULL,
	"rejection_reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_ingestion_batches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "raw_ingestion_batches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_adapter" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload_checksum_sha256" text NOT NULL,
	"storage_key" text,
	"raw_payload" text NOT NULL,
	"status" text NOT NULL,
	"records_extracted_count" integer DEFAULT 0 NOT NULL,
	"records_accepted_count" integer DEFAULT 0 NOT NULL,
	"records_quarantined_count" integer DEFAULT 0 NOT NULL,
	"error_log" text
);
--> statement-breakpoint
CREATE TABLE "seasonal_baselines" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "seasonal_baselines_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"market_id" integer NOT NULL,
	"ampis_commodity_id" integer NOT NULL,
	"bs_month" integer NOT NULL,
	"baseline_start_year_bs" integer NOT NULL,
	"baseline_end_year_bs" integer NOT NULL,
	"baseline_monthly_median" numeric(10, 2) NOT NULL,
	"grand_annual_median" numeric(10, 2),
	"spi" numeric(6, 2),
	"delta_spi_pct" numeric(6, 2),
	"cv_daily" numeric(5, 2),
	"cv_annual" numeric(5, 2),
	"valid_years_count" integer NOT NULL,
	"total_observations_count" integer NOT NULL,
	"historical_confidence_score" numeric(5, 2) NOT NULL,
	"analytics_methodology_version" text DEFAULT 'v1.1-phase3.4-A1' NOT NULL,
	"parameter_config_version" text DEFAULT 'param-v1.0-defaults' NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_observations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "source_observations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" integer NOT NULL,
	"market_id" integer NOT NULL,
	"ampis_commodity_id" integer NOT NULL,
	"source_system" text NOT NULL,
	"source_dataset_identifier" text,
	"observed_date_ad" date NOT NULL,
	"observed_at_timestamp" timestamp with time zone NOT NULL,
	"raw_source_record_id" text,
	"observed_price_primary" numeric(10, 2) NOT NULL,
	"observed_price_min" numeric(10, 2),
	"observed_price_max" numeric(10, 2),
	"price_measure_type" "price_measure_type" NOT NULL,
	"source_unit" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "administrative_districts" ADD CONSTRAINT "administrative_districts_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canonical_daily_market_prices" ADD CONSTRAINT "canonical_daily_market_prices_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canonical_daily_market_prices" ADD CONSTRAINT "canonical_daily_market_prices_ampis_commodity_id_ampis_commodities_id_fk" FOREIGN KEY ("ampis_commodity_id") REFERENCES "public"."ampis_commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canonical_daily_market_prices" ADD CONSTRAINT "canonical_daily_market_prices_superseded_by_id_canonical_daily_market_prices_id_fk" FOREIGN KEY ("superseded_by_id") REFERENCES "public"."canonical_daily_market_prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canonical_daily_market_prices" ADD CONSTRAINT "canonical_daily_market_prices_source_observation_id_source_observations_id_fk" FOREIGN KEY ("source_observation_id") REFERENCES "public"."source_observations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_calendars" ADD CONSTRAINT "crop_calendars_variety_system_id_crop_variety_systems_id_fk" FOREIGN KEY ("variety_system_id") REFERENCES "public"."crop_variety_systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_varieties" ADD CONSTRAINT "crop_varieties_crop_id_canonical_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."canonical_crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_variety_systems" ADD CONSTRAINT "crop_variety_systems_variety_id_crop_varieties_id_fk" FOREIGN KEY ("variety_id") REFERENCES "public"."crop_varieties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_variety_systems" ADD CONSTRAINT "crop_variety_systems_ampis_commodity_id_ampis_commodities_id_fk" FOREIGN KEY ("ampis_commodity_id") REFERENCES "public"."ampis_commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_municipality_id_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_market_aggregates" ADD CONSTRAINT "monthly_market_aggregates_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_market_aggregates" ADD CONSTRAINT "monthly_market_aggregates_ampis_commodity_id_ampis_commodities_id_fk" FOREIGN KEY ("ampis_commodity_id") REFERENCES "public"."ampis_commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_district_id_administrative_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."administrative_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quarantined_observations" ADD CONSTRAINT "quarantined_observations_batch_id_raw_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."raw_ingestion_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_baselines" ADD CONSTRAINT "seasonal_baselines_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_baselines" ADD CONSTRAINT "seasonal_baselines_ampis_commodity_id_ampis_commodities_id_fk" FOREIGN KEY ("ampis_commodity_id") REFERENCES "public"."ampis_commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_observations" ADD CONSTRAINT "source_observations_batch_id_raw_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."raw_ingestion_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_observations" ADD CONSTRAINT "source_observations_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_observations" ADD CONSTRAINT "source_observations_ampis_commodity_id_ampis_commodities_id_fk" FOREIGN KEY ("ampis_commodity_id") REFERENCES "public"."ampis_commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unq_active_canonical_daily" ON "canonical_daily_market_prices" USING btree ("market_id","ampis_commodity_id","date_ad") WHERE is_current = true;--> statement-breakpoint
CREATE INDEX "idx_canonical_date_ad" ON "canonical_daily_market_prices" USING btree ("date_ad");--> statement-breakpoint
CREATE INDEX "idx_canonical_bs_month" ON "canonical_daily_market_prices" USING btree ("bs_month");--> statement-breakpoint
CREATE INDEX "idx_canonical_market_commodity" ON "canonical_daily_market_prices" USING btree ("market_id","ampis_commodity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_variety_system_mapping" ON "crop_variety_systems" USING btree ("variety_id","production_system","ampis_commodity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_monthly_agg_versioned" ON "monthly_market_aggregates" USING btree ("market_id","ampis_commodity_id","bs_year","bs_month","analytics_methodology_version","parameter_config_version");--> statement-breakpoint
CREATE INDEX "idx_monthly_agg_market_comm_month" ON "monthly_market_aggregates" USING btree ("market_id","ampis_commodity_id","bs_month");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_seasonal_baseline_versioned" ON "seasonal_baselines" USING btree ("market_id","ampis_commodity_id","bs_month","analytics_methodology_version","parameter_config_version");--> statement-breakpoint
CREATE INDEX "idx_source_obs_lookup" ON "source_observations" USING btree ("market_id","ampis_commodity_id","observed_date_ad");