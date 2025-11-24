#!/bin/bash
# MongoDB Production Initialization Script
# This script creates users and configures security for production

echo "🔐 Initializing MongoDB Production Security..."

# Wait for MongoDB to be ready
until mongosh --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
  echo "Waiting for MongoDB to start..."
  sleep 2
done

echo "✅ MongoDB is ready"

# Create root admin user
echo "Creating root admin user..."
mongosh admin --eval '
db.createUser({
  user: "admin",
  pwd: "'"${MONGO_ROOT_PASSWORD:-changeme123}"'",
  roles: [
    { role: "root", db: "admin" },
    { role: "userAdminAnyDatabase", db: "admin" }
  ]
})
' || echo "Admin user may already exist"

# Create application user with limited permissions
echo "Creating application user..."
mongosh admin -u admin -p "${MONGO_ROOT_PASSWORD:-changeme123}" --eval '
use chatbot;
db.createUser({
  user: "chatbot_user",
  pwd: "'"${MONGO_APP_PASSWORD:-app_password_123}"'",
  roles: [
    { role: "readWrite", db: "chatbot" },
    { role: "dbAdmin", db: "chatbot" }
  ]
})
' || echo "Application user may already exist"

# Create read-only user for monitoring
echo "Creating monitoring user..."
mongosh admin -u admin -p "${MONGO_ROOT_PASSWORD:-changeme123}" --eval '
use chatbot;
db.createUser({
  user: "chatbot_monitor",
  pwd: "'"${MONGO_MONITOR_PASSWORD:-monitor_password_123}"'",
  roles: [
    { role: "read", db: "chatbot" },
    { role: "clusterMonitor", db: "admin" }
  ]
})
' || echo "Monitoring user may already exist"

# Create indexes for production
echo "Creating production indexes..."
mongosh chatbot -u chatbot_user -p "${MONGO_APP_PASSWORD:-app_password_123}" --authenticationDatabase admin --eval '
// Conversation indexes
db.conversations.createIndex({ userId: 1, createdAt: -1 });
db.conversations.createIndex({ "metadata.postgresId": 1 }, { unique: true, sparse: true });
db.conversations.createIndex({ createdAt: -1 });
db.conversations.createIndex({ updatedAt: -1 });

// Message indexes
db.messages.createIndex({ conversationId: 1, createdAt: 1 });
db.messages.createIndex({ conversationId: 1, role: 1 });
db.messages.createIndex({ createdAt: -1 });

// Audit log indexes
db.audit_logs.createIndex({ conversationId: 1, timestamp: -1 });
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });
db.audit_logs.createIndex({ action: 1, timestamp: -1 });
db.audit_logs.createIndex({ timestamp: -1 });

print("✅ Indexes created successfully");
'

echo "✅ MongoDB production security configured"
echo ""
echo "📝 Users created:"
echo "  - admin (root access)"
echo "  - chatbot_user (read/write on chatbot db)"
echo "  - chatbot_monitor (read-only monitoring)"
echo ""
echo "🔒 Remember to:"
echo "  1. Change default passwords in production"
echo "  2. Enable TLS/SSL"
echo "  3. Configure firewall rules"
echo "  4. Set up automated backups"
