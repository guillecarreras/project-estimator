#!/bin/bash

# Database backup script
# Usage: ./backup-db.sh

set -e

# Configuration
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-project_estimator}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
BACKUP_DIR=${BACKUP_DIR:-./backups}
RETENTION_DAYS=${RETENTION_DAYS:-30}
ENABLE_COMPRESSION=${ENABLE_COMPRESSION:-true}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}"

if [ "$ENABLE_COMPRESSION" = true ]; then
    BACKUP_FILE="${BACKUP_FILE}.sql.gz"
else
    BACKUP_FILE="${BACKUP_FILE}.sql"
fi

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Perform backup
export PGPASSWORD="$DB_PASSWORD"

if [ "$ENABLE_COMPRESSION" = true ]; then
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-password \
        --no-owner \
        --verbose \
        --format=plain | gzip > "$BACKUP_FILE"
else
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-password \
        --no-owner \
        --verbose \
        --format=plain > "$BACKUP_FILE"
fi

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup completed successfully!"
    echo "File size: $FILE_SIZE"
else
    echo "Error: Backup file was not created!"
    exit 1
fi

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql*" -mtime "+$RETENTION_DAYS" -delete

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/backup_${DB_NAME}_*.sql* | tail -5

echo "Backup process completed!"
