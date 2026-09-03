ALTER TABLE "Page" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

WITH ordered_pages AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "auditId"
      ORDER BY "createdAt" ASC, "id" ASC
    ) - 1 AS "sortOrder"
  FROM "Page"
)
UPDATE "Page" AS page
SET "sortOrder" = ordered_pages."sortOrder"
FROM ordered_pages
WHERE page."id" = ordered_pages."id";