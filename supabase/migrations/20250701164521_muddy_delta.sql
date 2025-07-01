-- ZHD AI Onboarding System Database Initialization
-- This script sets up the initial database structure

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS onboarding CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE onboarding;

-- Create application user with limited privileges
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Set timezone
SET time_zone = '+00:00';

-- Enable event scheduler for cleanup tasks
SET GLOBAL event_scheduler = ON;

-- Create cleanup event for old analytics data
DELIMITER ;;
CREATE EVENT IF NOT EXISTS cleanup_old_analytics
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Delete analytics data older than 90 days
    DELETE FROM analytics WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Delete old chat messages (keep last 1000 per user)
    DELETE cm1 FROM chatmessage cm1
    INNER JOIN (
        SELECT user_id, id
        FROM chatmessage cm2
        WHERE cm2.user_id = cm1.user_id
        ORDER BY created_at DESC
        LIMIT 1000, 18446744073709551615
    ) cm2 ON cm1.id = cm2.id;
END;;
DELIMITER ;

-- Create indexes for better performance
-- These will be created by Sequelize, but we can add additional ones here

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_event_time ON analytics(user_id, event_type, created_at);

-- Index for chat message queries
CREATE INDEX IF NOT EXISTS idx_chatmessage_user_time ON chatmessage(user_id, created_at);

-- Index for user task queries
CREATE INDEX IF NOT EXISTS idx_usertask_user_status_due ON usertask(user_id, status, due_date);

-- Index for onboarding task queries
CREATE INDEX IF NOT EXISTS idx_onboardingtask_active_priority ON onboardingtask(is_active, priority, order_index);

-- Insert initial system configuration (if needed)
-- This can be used for system-wide settings