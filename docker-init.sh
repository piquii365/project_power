#!/bin/bash

# Docker initialization script for ZHD AI Onboarding System
# This script handles database migration, seeding, and AI model training

set -e

echo "🚀 Starting ZHD AI Onboarding System initialization..."

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database connection..."
    
    # Wait for MySQL to be ready
    while ! nc -z ${DB_HOST:-mysql} ${DB_PORT:-3306}; do
        echo "Database not ready, waiting 5 seconds..."
        sleep 5
    done
    
    echo "✅ Database connection established"
}

# Function to wait for Redis
wait_for_redis() {
    echo "⏳ Waiting for Redis connection..."
    
    # Wait for Redis to be ready
    while ! nc -z ${REDIS_HOST:-redis} ${REDIS_PORT:-6379}; do
        echo "Redis not ready, waiting 3 seconds..."
        sleep 3
    done
    
    echo "✅ Redis connection established"
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    cd /app/server
    
    # Run migrations with retry logic
    for i in {1..5}; do
        if node scripts/migrate.js; then
            echo "✅ Database migrations completed successfully"
            break
        else
            echo "❌ Migration attempt $i failed, retrying in 10 seconds..."
            sleep 10
            if [ $i -eq 5 ]; then
                echo "💥 Migration failed after 5 attempts"
                exit 1
            fi
        fi
    done
    
    cd /app
}

# Function to seed database
seed_database() {
    echo "🌱 Seeding database with initial data..."
    
    cd /app/server
    
    # Check if database is already seeded
    if node -e "
        const { User } = require('./models/index.js');
        const sequelize = require('./config/database.js');
        sequelize.authenticate().then(() => {
            return User.count();
        }).then(count => {
            if (count > 0) {
                console.log('Database already seeded, skipping...');
                process.exit(1);
            } else {
                console.log('Database empty, proceeding with seeding...');
                process.exit(0);
            }
        }).catch(err => {
            console.log('Error checking database:', err.message);
            process.exit(0);
        });
    "; then
        # Database is empty, proceed with seeding
        if node scripts/seed.js; then
            echo "✅ Database seeded successfully"
        else
            echo "❌ Database seeding failed"
            exit 1
        fi
    else
        echo "ℹ️  Database already contains data, skipping seeding"
    fi
    
    cd /app
}

# Function to train AI models
train_ai_models() {
    echo "🤖 Training AI models..."
    
    # Check if models already exist
    if [ -f "/app/models/training-metrics.json" ]; then
        echo "ℹ️  AI models already trained, skipping training"
        return 0
    fi
    
    # Train models with timeout
    timeout 600 node scripts/train-models.js || {
        echo "⚠️  AI model training timed out or failed, using fallback models"
        # Create basic fallback model structure
        mkdir -p /app/models
        echo '{"timestamp":"'$(date -Iseconds)'","status":"fallback","models":{"faqClassifier":{"status":"fallback"},"recommendationEngine":{"status":"fallback"},"progressPredictor":{"status":"fallback"}}}' > /app/models/training-metrics.json
        return 0
    }
    
    echo "✅ AI models trained successfully"
}

# Function to validate AI models
validate_ai_models() {
    echo "🔍 Validating AI models..."
    
    # Run validation with timeout
    timeout 300 node scripts/validate-models.js || {
        echo "⚠️  AI model validation failed or timed out, continuing with available models"
        return 0
    }
    
    echo "✅ AI models validated successfully"
}

# Function to start the application
start_application() {
    echo "🎯 Starting ZHD AI Onboarding System..."
    
    cd /app/server
    exec node index.js
}

# Main execution flow
main() {
    echo "🔧 Environment: ${NODE_ENV:-development}"
    echo "🗄️  Database: ${DB_HOST:-mysql}:${DB_PORT:-3306}/${DB_NAME:-onboarding}"
    echo "🔴 Redis: ${REDIS_HOST:-redis}:${REDIS_PORT:-6379}"
    
    # Wait for dependencies
    wait_for_db
    wait_for_redis
    
    # Database setup
    run_migrations
    seed_database
    
    # AI model setup (run in background to not block startup)
    if [ "${SKIP_AI_TRAINING:-false}" != "true" ]; then
        echo "🚀 Starting AI model training in background..."
        (
            train_ai_models
            validate_ai_models
        ) &
        AI_PID=$!
        echo "🔄 AI training process started with PID: $AI_PID"
    else
        echo "⏭️  Skipping AI model training (SKIP_AI_TRAINING=true)"
    fi
    
    # Start the application
    start_application
}

# Handle signals for graceful shutdown
trap 'echo "🛑 Received shutdown signal, stopping..."; kill $AI_PID 2>/dev/null || true; exit 0' SIGTERM SIGINT

# Run main function
main "$@"