-- =======================================================
-- SKEMA DATABASE RAFTRACK GEMINI - FUTURISTIC FINTECH
-- =======================================================

-- 1. TABEL USERS
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL CATEGORIES
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `type` ENUM('pemasukan', 'pengeluaran') NOT NULL,
  `color` VARCHAR(30) NOT NULL,
  `icon` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeding Kategori Default
INSERT INTO `categories` (`id`, `name`, `type`, `color`, `icon`) VALUES
(1, 'makanan', 'pengeluaran', '#ff007f', 'Utensils'),
(2, 'transportasi', 'pengeluaran', '#00f2fe', 'Car'),
(3, 'tagihan', 'pengeluaran', '#ffd000', 'CreditCard'),
(4, 'hiburan', 'pengeluaran', '#b92bff', 'Gamepad2'),
(5, 'investasi', 'pengeluaran', '#00ff87', 'TrendingUp'),
(6, 'gaji', 'pemasukan', '#05c1ff', 'DollarSign'),
(7, 'lainnya', 'pengeluaran', '#a0aec0', 'HelpCircle')
ON DUPLICATE KEY UPDATE 
`type`=VALUES(`type`), `color`=VALUES(`color`), `icon`=VALUES(`icon`);

-- 3. TABEL TRANSACTIONS
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `type` ENUM('pemasukan', 'pengeluaran') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `date` DATE NOT NULL,
  `receipt_img` LONGTEXT DEFAULT NULL, -- Untuk menyimpan base64 atau path gambar struk
  `payment_source` VARCHAR(50) NOT NULL DEFAULT 'cash', -- Sumber rekening (bank, wallet, cash)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
