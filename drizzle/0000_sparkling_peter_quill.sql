CREATE TABLE "bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_name" text NOT NULL,
	"product_url" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"ms_purchased" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sleep_state" (
	"id" integer PRIMARY KEY NOT NULL,
	"sleep_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
