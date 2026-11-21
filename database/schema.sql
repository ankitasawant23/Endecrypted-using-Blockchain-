CREATE DATABASE IF NOT EXISTS cipherchain
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cipherchain;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS encrypted_files (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  encrypted_data LONGTEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  auth_tag VARCHAR(255) NOT NULL,
  data_hash CHAR(64) NOT NULL,
  decryption_key_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_encrypted_files_user_id (user_id),
  KEY idx_encrypted_files_hash (data_hash),
  CONSTRAINT fk_encrypted_files_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blockchain_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  file_id BIGINT UNSIGNED NOT NULL,
  transaction_hash VARCHAR(255) NULL,
  blockchain_data_hash CHAR(64) NULL,
  block_number BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blockchain_transactions_file_id (file_id),
  CONSTRAINT fk_blockchain_transactions_file
    FOREIGN KEY (file_id) REFERENCES encrypted_files(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
