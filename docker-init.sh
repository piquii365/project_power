#!/bin/bash
# Docker initialization script with dependency repair

set -e

echo "🚀 Starting ZHD AI Onboarding System initialization..."

# Run dependency repair first
/app/repair-deps.sh

run_migrations() {
    echo "🔄 Attempting database migrations..."
    if npm run migrate; then
        echo "✅ Database migrations completed"
    else
        echo "⚠️  Database migrations failed - skipping"
    fi
}

seed_database() {
    echo "🌱 Attempting database seeding..."
    if npm run seed; then
        echo "✅ Database seeded"
    else
        echo "⚠️  Database seeding failed - skipping"
    fi
}

train_ai_models() {
    echo "🤖 Training AI models..."
    if npm run train; then
        echo "✅ AI models trained"
    else
        echo "⚠️  AI model training failed - skipping"
    fi
}

start_application() {
    echo "🌐 Starting application..."
    exec npm start
}

main() {
    echo "🔧 Environment: ${NODE_ENV:-development}"
    
    # Run initialization steps
    run_migrations
    seed_database
    train_ai_models
    
    echo "🎯 Initialization sequence completed"
    
    # Start the application
    start_application
}

main "$@"