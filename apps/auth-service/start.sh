#!/bin/bash
cd "$(dirname "$0")"
node -r dotenv/config ../../dist/apps/auth-service/main.js
