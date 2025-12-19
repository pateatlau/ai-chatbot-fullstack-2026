-- CreateErrorLog migration
CREATE TYPE "ErrorSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ErrorStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED');

CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "errorId" TEXT NOT NULL UNIQUE,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "componentStack" TEXT,
    "context" TEXT,
    "severity" "ErrorSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "ErrorStatus" NOT NULL DEFAULT 'NEW',
    "app" TEXT NOT NULL,
    "page" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "url" TEXT,
    "environment" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX "ErrorLog_app_idx" ON "ErrorLog"("app");
CREATE INDEX "ErrorLog_page_idx" ON "ErrorLog"("page");
CREATE INDEX "ErrorLog_severity_idx" ON "ErrorLog"("severity");
CREATE INDEX "ErrorLog_status_idx" ON "ErrorLog"("status");
CREATE INDEX "ErrorLog_timestamp_idx" ON "ErrorLog"("timestamp");
CREATE INDEX "ErrorLog_userId_idx" ON "ErrorLog"("userId");
CREATE INDEX "ErrorLog_environment_idx" ON "ErrorLog"("environment");
CREATE INDEX "ErrorLog_app_timestamp_idx" ON "ErrorLog"("app", "timestamp");
CREATE INDEX "ErrorLog_severity_timestamp_idx" ON "ErrorLog"("severity", "timestamp");
