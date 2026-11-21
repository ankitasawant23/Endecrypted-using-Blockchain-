#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v mariadb >/dev/null 2>&1 && ! command -v mysql >/dev/null 2>&1; then
  echo "MySQL or MariaDB client is not installed." >&2
  exit 1
fi

sudo -A service mariadb start
sudo -A mariadb <<SQL
CREATE DATABASE IF NOT EXISTS cipherchain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'cipherchain_app'@'127.0.0.1' IDENTIFIED BY 'cipherchain_local_password';
CREATE USER IF NOT EXISTS 'cipherchain_app'@'localhost' IDENTIFIED BY 'cipherchain_local_password';
GRANT ALL PRIVILEGES ON cipherchain.* TO 'cipherchain_app'@'127.0.0.1';
GRANT ALL PRIVILEGES ON cipherchain.* TO 'cipherchain_app'@'localhost';
FLUSH PRIVILEGES;
SQL
sudo -A mariadb cipherchain < "$SCRIPT_DIR/schema.sql"

echo "CipherChain database schema created successfully."
