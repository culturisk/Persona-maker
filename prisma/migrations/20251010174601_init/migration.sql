-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segments" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frame" TEXT,
    "product" TEXT,
    "primary_benefit" TEXT,
    "reason" TEXT,
    "context" TEXT,
    "culture_axes" JSONB,
    "values" JSONB,
    "emotions" JSONB,
    "fears" JSONB,
    "language_guardrails" JSONB,
    "evidence" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "culture_profiles" (
    "id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "locale" TEXT,
    "languages" JSONB,
    "region" JSONB,
    "urbanicity" TEXT,
    "communication_style" TEXT,
    "time_orientation" TEXT,
    "formality_norm" TEXT,
    "workweek" JSONB,
    "scheduling_norms" JSONB,
    "festivals" JSONB,
    "purchasing_constraints" JSONB,
    "device_channel_prefs" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "culture_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economic_profiles" (
    "id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "income_bracket" TEXT,
    "currency" TEXT DEFAULT 'INR',
    "profession" TEXT,
    "industry" TEXT,
    "years_of_service" INTEGER,
    "employment_type" TEXT,
    "financial_background" TEXT,
    "family_financial_background" TEXT,
    "socioeconomic_status" TEXT,
    "price_sensitivity" TEXT,
    "purchase_frequency" TEXT,
    "payment_behaviour" JSONB,
    "savings_inclination" TEXT,
    "risk_appetite" TEXT,
    "credit_access" TEXT,
    "financial_goals" JSONB,
    "constraints" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "culture_profile_id" TEXT,
    "economic_profile_id" TEXT,
    "name" TEXT NOT NULL,
    "positioning" TEXT,
    "cultural_cues" JSONB,
    "economic_cues" JSONB,
    "generalizations" JSONB,
    "pillars" JSONB,
    "export_snapshot" JSONB,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "culture_profiles_segment_id_key" ON "culture_profiles"("segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "economic_profiles_segment_id_key" ON "economic_profiles"("segment_id");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "culture_profiles" ADD CONSTRAINT "culture_profiles_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economic_profiles" ADD CONSTRAINT "economic_profiles_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_culture_profile_id_fkey" FOREIGN KEY ("culture_profile_id") REFERENCES "culture_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_economic_profile_id_fkey" FOREIGN KEY ("economic_profile_id") REFERENCES "economic_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
