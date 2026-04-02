-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "predictionDate" DATETIME NOT NULL,
    "baselineTemp" REAL NOT NULL,
    "rlCorrectedTemp" REAL NOT NULL,
    "confidenceScore" REAL NOT NULL,
    "actualTemp" REAL,
    "accuracy" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelVersion" TEXT NOT NULL,
    CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Prediction" ("accuracy", "actualTemp", "baselineTemp", "city", "confidenceScore", "createdAt", "id", "modelVersion", "predictionDate", "rlCorrectedTemp", "userId") SELECT "accuracy", "actualTemp", "baselineTemp", "city", "confidenceScore", "createdAt", "id", "modelVersion", "predictionDate", "rlCorrectedTemp", "userId" FROM "Prediction";
DROP TABLE "Prediction";
ALTER TABLE "new_Prediction" RENAME TO "Prediction";
CREATE INDEX "Prediction_userId_idx" ON "Prediction"("userId");
CREATE INDEX "Prediction_city_idx" ON "Prediction"("city");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
