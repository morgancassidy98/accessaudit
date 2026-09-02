-- Add a separate random bearer token for public report links.
ALTER TABLE "Audit" ADD COLUMN "shareToken" TEXT;

-- Backfill existing audits before making the token required.
UPDATE "Audit"
SET "shareToken" = md5(random()::text || clock_timestamp()::text || "id")
WHERE "shareToken" IS NULL;

ALTER TABLE "Audit" ALTER COLUMN "shareToken" SET NOT NULL;
CREATE UNIQUE INDEX "Audit_shareToken_key" ON "Audit"("shareToken");
