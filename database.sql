-- ==========================================================
-- SISTEM INFORMASI LAYANAN LAUNDRY (LAUNDRY HUB / PINK LAUNDRY)
-- Berdasarkan Dokumen Laporan Perancangan Sistem Basis Data
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `laundry_db`;
USE `laundry_db`;

-- 1. Tabel Admin
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id_admin` VARCHAR(10) NOT NULL,
  `nm_admin` VARCHAR(50) NOT NULL,
  `username` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `no_hp` VARCHAR(15) DEFAULT NULL,
  PRIMARY KEY (`id_admin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Customer
DROP TABLE IF EXISTS `customer`;
CREATE TABLE `customer` (
  `id_customer` VARCHAR(10) NOT NULL,
  `nm_customer` VARCHAR(50) NOT NULL,
  `no_hp` VARCHAR(15) NOT NULL,
  `alamat` VARCHAR(100) NOT NULL,
  `username` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_customer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Kurir
DROP TABLE IF EXISTS `kurir`;
CREATE TABLE `kurir` (
  `id_kurir` VARCHAR(10) NOT NULL,
  `nm_kurir` VARCHAR(50) NOT NULL,
  `no_hp` VARCHAR(15) NOT NULL,
  `plat_no` VARCHAR(20) NOT NULL,
  `username` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_kurir`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Layanan
DROP TABLE IF EXISTS `layanan`;
CREATE TABLE `layanan` (
  `id_layanan` VARCHAR(10) NOT NULL,
  `nm_layanan` VARCHAR(30) NOT NULL,
  `harga` INT(11) NOT NULL,
  `estimasi` VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (`id_layanan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Pesanan
DROP TABLE IF EXISTS `pesanan`;
CREATE TABLE `pesanan` (
  `id_pesanan` VARCHAR(10) NOT NULL,
  `id_admin` VARCHAR(10) DEFAULT NULL,
  `id_kurir` VARCHAR(10) DEFAULT NULL,
  `id_customer` VARCHAR(10) NOT NULL,
  `id_layanan` VARCHAR(10) NOT NULL,
  `tgl_pesan` DATETIME NOT NULL,
  `berat_kg` DOUBLE(8,2) DEFAULT 0,
  `total_harga` INT(11) DEFAULT 0,
  `status` ENUM('Menunggu Kurir', 'Diproses', 'Siap Diantar', 'Selesai') NOT NULL DEFAULT 'Menunggu Kurir',
  `mtd_bayar` ENUM('Tunai', 'QRIS', 'Transfer Bank') NOT NULL DEFAULT 'Tunai',
  `nm_snapshot` VARCHAR(50) DEFAULT NULL,
  `alamat_snapshot` VARCHAR(150) DEFAULT NULL,
  `no_hp_snapshot` VARCHAR(15) DEFAULT NULL,
  PRIMARY KEY (`id_pesanan`),
  KEY `fk_pesanan_admin` (`id_admin`),
  KEY `fk_pesanan_kurir` (`id_kurir`),
  KEY `fk_pesanan_customer` (`id_customer`),
  KEY `fk_pesanan_layanan` (`id_layanan`),
  CONSTRAINT `fk_pesanan_admin` FOREIGN KEY (`id_admin`) REFERENCES `admin` (`id_admin`) ON DELETE SET NULL,
  CONSTRAINT `fk_pesanan_kurir` FOREIGN KEY (`id_kurir`) REFERENCES `kurir` (`id_kurir`) ON DELETE SET NULL,
  CONSTRAINT `fk_pesanan_customer` FOREIGN KEY (`id_customer`) REFERENCES `customer` (`id_customer`) ON DELETE CASCADE,
  CONSTRAINT `fk_pesanan_layanan` FOREIGN KEY (`id_layanan`) REFERENCES `layanan` (`id_layanan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Chat
DROP TABLE IF EXISTS `chat`;
CREATE TABLE `chat` (
  `id_chat` VARCHAR(10) NOT NULL,
  `id_admin` VARCHAR(10) NOT NULL,
  `id_customer` VARCHAR(10) NOT NULL,
  `isi_pesan` VARCHAR(255) NOT NULL,
  `waktu` DATETIME NOT NULL,
  `pengirim` ENUM('customer', 'admin') NOT NULL,
  PRIMARY KEY (`id_chat`),
  KEY `fk_chat_admin` (`id_admin`),
  KEY `fk_chat_customer` (`id_customer`),
  CONSTRAINT `fk_chat_admin` FOREIGN KEY (`id_admin`) REFERENCES `admin` (`id_admin`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_customer` FOREIGN KEY (`id_customer`) REFERENCES `customer` (`id_customer`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- DUMMY DATA AWAL (SESUAI LAPORAN PROYEK AKHIR)
-- ==========================================================

-- Data Admin
INSERT INTO `admin` (`id_admin`, `nm_admin`, `username`, `password`, `no_hp`) VALUES
('ADM01', 'Suci Admin', 'admin', 'admin123', '081234567890');

-- Data Kurir
INSERT INTO `kurir` (`id_kurir`, `nm_kurir`, `no_hp`, `plat_no`, `username`, `password`) VALUES
('KUR01', 'Muhammad Taufiq', '08995578781', 'B 1234 BCD', 'taufiq', 'kurir123'),
('KUR02', 'Ahmad Slamet', '081298765432', 'B 5678 EFG', 'ahmad', 'kurir123');

-- Data Layanan
INSERT INTO `layanan` (`id_layanan`, `nm_layanan`, `harga`, `estimasi`) VALUES
('LAY01', 'Cuci Kering', 7000, '2-3 Hari'),
('LAY02', 'Cuci Setrika', 7000, '2 Hari'),
('LAY03', 'Setrika Saja', 5000, '1-2 Hari'),
('LAY04', 'Express (1 Hari)', 15000, '1 Hari');

-- Data Customer
INSERT INTO `customer` (`id_customer`, `nm_customer`, `no_hp`, `alamat`, `username`, `password`) VALUES
('CUST01', 'Budi Santoso', '0895725677902', 'Bekasi, regensi 1 blok j5 no 46', 'budi', 'budi123'),
('CUST02', 'Hermanto', '081234567888', 'Grand Wisata Cluster Water Spring No. 12', 'hermanto', 'rahasia'),
('CUST03', 'Bpk. Anton', '081399887766', 'Jln. Mawar No. 10', 'anton', 'anton123');

-- Data Pesanan Awal
INSERT INTO `pesanan` (`id_pesanan`, `id_admin`, `id_kurir`, `id_customer`, `id_layanan`, `tgl_pesan`, `berat_kg`, `total_harga`, `status`, `mtd_bayar`, `nm_snapshot`, `alamat_snapshot`, `no_hp_snapshot`) VALUES
('LD00123', 'ADM01', 'KUR01', 'CUST03', 'LAY02', '2026-05-03 10:15:00', 5.00, 45000, 'Selesai', 'QRIS', 'Bpk. Anton', 'Jln. Mawar No. 10', '081399887766'),
('LD00128', 'ADM01', 'KUR01', 'CUST01', 'LAY01', '2026-05-08 09:00:00', 3.00, 21000, 'Diproses', 'Tunai', 'Budi Santoso', 'Bekasi, regensi 1 blok j5 no 46', '0895725677902'),
('LD-29', 'ADM01', 'KUR01', 'CUST01', 'LAY04', '2026-05-23 07:12:58', 4.00, 60000, 'Selesai', 'Tunai', 'Budi Santoso', 'Bekasi, regensi 1 blok j5 no 46', '0895725677902');

-- Data Chat Awal
INSERT INTO `chat` (`id_chat`, `id_admin`, `id_customer`, `isi_pesan`, `waktu`, `pengirim`) VALUES
('CHT01', 'ADM01', 'CUST01', 'Halo kak, apakah laundry saya sudah mulai dicuci?', '2026-05-23 08:00:00', 'customer'),
('CHT02', 'ADM01', 'CUST01', 'Halo Kak Budi, saat ini cucian sedang proses pengeringan ya.', '2026-05-23 08:05:00', 'admin');
