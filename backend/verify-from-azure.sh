#!/bin/bash
# Script para ejecutar desde Azure Cloud Shell
# Este script verifica y configura la base de datos

echo "🔍 Verificación de Base de Datos - Nebula Backend"
echo "================================================="
echo ""

# Database connection string
DB_URL="postgresql://NebulaMLadmin:Proyectone2025@nebuladb.postgres.database.azure.com:5432/postgres?sslmode=require"

echo "📡 Paso 1: Verificando conexión a la base de datos..."
psql "$DB_URL" -c "SELECT 1;"

if [ $? -eq 0 ]; then
    echo "✅ Conexión exitosa"
else
    echo "❌ Error de conexión"
    exit 1
fi

echo ""
echo "📋 Paso 2: Tablas existentes:"
psql "$DB_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

echo ""
echo "🏗️  Paso 3: Ejecutando script de inicialización..."

# Script de inicialización inline
psql "$DB_URL" <<'EOF'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    email_verified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    UNIQUE(provider, provider_account_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ML Models table
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    preview_filename VARCHAR(255) NOT NULL,
    preview_rows INTEGER NOT NULL,
    preview_columns INTEGER NOT NULL,
    preview_column_names TEXT[] NOT NULL,
    preview_data JSONB NOT NULL,
    preview_data_summary JSONB,
    correlation_data JSONB,
    outcome_variable VARCHAR(255) NOT NULL,
    predictor_variables TEXT[] NOT NULL,
    selected_model VARCHAR(100) NOT NULL,
    clean_data BOOLEAN DEFAULT FALSE,
    iqr_k NUMERIC(4,2) DEFAULT 1.5,
    n_neighbors INTEGER DEFAULT 5,
    r2_score NUMERIC(10,6),
    accuracy NUMERIC(10,6),
    mse NUMERIC(15,6),
    results_data JSONB,
    model_file_path TEXT,
    model_file_size BIGINT,
    CONSTRAINT valid_iqr_k CHECK (iqr_k > 0),
    CONSTRAINT valid_n_neighbors CHECK (n_neighbors > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ml_models_user_id ON ml_models(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_created_at ON ml_models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ml_models_updated_at ON ml_models;
CREATE TRIGGER update_ml_models_updated_at BEFORE UPDATE ON ml_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to limit models per user
CREATE OR REPLACE FUNCTION limit_user_models()
RETURNS TRIGGER AS \$\$
DECLARE
    model_count INTEGER;
    oldest_model_id UUID;
BEGIN
    SELECT COUNT(*) INTO model_count
    FROM ml_models
    WHERE user_id = NEW.user_id AND model_file_path IS NOT NULL;

    IF model_count > 2 THEN
        SELECT id INTO oldest_model_id
        FROM ml_models
        WHERE user_id = NEW.user_id AND model_file_path IS NOT NULL
        ORDER BY created_at ASC
        LIMIT 1;

        UPDATE ml_models
        SET model_file_path = NULL, model_file_size = NULL
        WHERE id = oldest_model_id;
    END IF;

    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Trigger to limit models
DROP TRIGGER IF EXISTS limit_models_trigger ON ml_models;
CREATE TRIGGER limit_models_trigger
AFTER INSERT ON ml_models
FOR EACH ROW
WHEN (NEW.model_file_path IS NOT NULL)
EXECUTE FUNCTION limit_user_models();

SELECT 'Schema initialization complete!' AS status;
EOF

echo ""
echo "✅ Script ejecutado"

echo ""
echo "🔍 Paso 4: Verificando tablas creadas..."
psql "$DB_URL" -c "
SELECT
    tablename,
    CASE
        WHEN tablename IN ('users', 'accounts', 'sessions', 'verification_tokens', 'ml_models')
        THEN '✅'
        ELSE '  '
    END AS required
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo ""
echo "📊 Paso 5: Contando registros..."
psql "$DB_URL" -c "
SELECT
    'users' as table_name,
    COUNT(*) as count
FROM users
UNION ALL
SELECT
    'ml_models' as table_name,
    COUNT(*) as count
FROM ml_models;
"

echo ""
echo "================================================="
echo "✅ VERIFICACIÓN COMPLETA"
echo ""
echo "Ahora puedes reiniciar el backend:"
echo "az webapp restart --name nebulabackend --resource-group <resource-group>"
echo ""
