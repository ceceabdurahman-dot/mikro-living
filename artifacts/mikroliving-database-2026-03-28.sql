-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: mikro-living_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `mikro-living_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `u659924432_mikro_living` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `u659924432_mikro_living`;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(250) NOT NULL,
  `slug` varchar(270) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `category` enum('trends','aesthetics','material','tips','news') DEFAULT 'tips',
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `cover_url` text DEFAULT NULL,
  `cover_id` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `views` int(11) DEFAULT 0,
  `read_time` tinyint(4) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `meta_title` varchar(70) DEFAULT NULL,
  `meta_desc` varchar(160) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` VALUES (1,'Maximizing Space in Compact Apartments','maximizing-space-compact-apartments','Discover clever furniture hacks and architectural tricks to make small spaces feel twice their size.','<p>Artikel lengkap tentang tips memaksimalkan ruang apartment kecil...</p>','trends','published',NULL,NULL,1,'[\"apartment\",\"space-saving\",\"tips\"]',2,5,'2026-03-24 10:10:46',NULL,NULL,'2026-03-24 10:10:46','2026-03-24 20:21:35');
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultation_requests`
--

DROP TABLE IF EXISTS `consultation_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultation_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `service_type` varchar(100) DEFAULT NULL,
  `budget_range` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `area_sqm` decimal(8,2) DEFAULT NULL,
  `status` enum('new','contacted','in_progress','converted','closed') DEFAULT 'new',
  `notes` text DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultation_requests`
--

LOCK TABLES `consultation_requests` WRITE;
/*!40000 ALTER TABLE `consultation_requests` DISABLE KEYS */;
INSERT INTO `consultation_requests` VALUES (1,'CTA Test User','cta.test@example.com','081234567890','Testing consultation modal submission.','interior-design',NULL,NULL,NULL,'new',NULL,'website','2026-03-24 19:56:57','2026-03-24 19:56:57');
/*!40000 ALTER TABLE `consultation_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_images`
--

DROP TABLE IF EXISTS `project_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `url` text NOT NULL,
  `public_id` varchar(255) NOT NULL,
  `alt_text` varchar(200) DEFAULT NULL,
  `caption` varchar(500) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `width` smallint(6) DEFAULT NULL,
  `height` smallint(6) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `project_images_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_images`
--

LOCK TABLES `project_images` WRITE;
/*!40000 ALTER TABLE `project_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `area_sqm` decimal(8,2) DEFAULT NULL,
  `category` enum('apartment','residential','kitchen','bedroom','office','commercial') NOT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT 0,
  `year_completed` smallint(6) DEFAULT NULL,
  `client_name` varchar(100) DEFAULT NULL,
  `cover_url` text DEFAULT NULL,
  `cover_id` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `meta_title` varchar(70) DEFAULT NULL,
  `meta_desc` varchar(160) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'The Botanica Suite','the-botanica-suite','Transformasi apartment 45m² menjadi sanctuary modern dengan solusi storage cerdas dan estetika earth tone yang menenangkan.','Jakarta Selatan',45.00,'apartment','published',1,2024,'Sarah & Dimas',NULL,NULL,1,3,NULL,NULL,'2026-03-24 10:10:45','2026-03-28 13:36:52'),(2,'Role Guard Test Project','role-guard-test-project','Created by admin role for publish guard verification.','Jakarta',NULL,'residential','draft',0,NULL,NULL,NULL,NULL,999,0,NULL,NULL,'2026-03-24 18:19:13','2026-03-24 18:19:13');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `slug` varchar(170) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `icon_url` text DEFAULT NULL,
  `icon_id` varchar(255) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `price_from` decimal(15,0) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Interior Design','interior-design','Comprehensive conceptual and technical planning for any space. From studio apartments to grand residences.','⬡',NULL,NULL,'[\"Konsultasi awal\",\"Moodboard & konsep\",\"Gambar kerja 2D/3D\",\"Desain furniture\",\"RAB detail\"]',NULL,1,1,'2026-03-24 10:10:45','2026-03-24 10:10:45'),(2,'Apartment Design','apartment-design','Specialized solutions for compact living and high-rise dwellings, maximizing every square meter.','⬢',NULL,NULL,'[\"Space planning\",\"Storage optimization\",\"Built-in furniture\",\"Lighting design\",\"Material selection\"]',NULL,1,2,'2026-03-24 10:10:45','2026-03-24 10:10:45'),(3,'Custom Furniture','custom-furniture','Bespoke pieces crafted specifically for your home\'s exact dimensions and aesthetic vision.','◈',NULL,NULL,'[\"Desain custom\",\"Material premium\",\"Produksi lokal\",\"Quality control\",\"Garansi 2 tahun\"]',NULL,1,3,'2026-03-24 10:10:45','2026-03-24 10:10:45'),(4,'Design & Build','design-and-build','Integrated project management from concept to completion — one studio, full accountability.','◎',NULL,NULL,'[\"Full project management\",\"Koordinasi kontraktor\",\"Pengadaan material\",\"Quality inspection\",\"Handover report\"]',NULL,1,4,'2026-03-24 10:10:45','2026-03-24 10:10:45');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `type` enum('text','number','boolean','json','image') DEFAULT 'text',
  `label` varchar(200) DEFAULT NULL,
  `group` varchar(50) DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'site_name','MikroLiving','text','Nama Situs','general','2026-03-24 10:10:45'),(2,'site_tagline','Designing Smart Living Spaces','text','Tagline','general','2026-03-24 10:10:45'),(3,'site_description','Creating Elegant & Functional Interiors that resonate with your lifestyle and personality.','text','Deskripsi','general','2026-03-24 10:10:45'),(4,'studio_founded','2014','text','Tahun Berdiri','general','2026-03-24 10:10:45'),(5,'stat_projects','150+','text','Jumlah Proyek','stats','2026-03-24 10:10:45'),(6,'stat_satisfaction','98%','text','Kepuasan Klien','stats','2026-03-24 10:10:45'),(7,'stat_experience','10+','text','Tahun Pengalaman','stats','2026-03-24 10:10:45'),(8,'stat_cities','3','text','Kota Aktif','stats','2026-03-24 10:10:45'),(9,'stat_awards','12','number','Design Awards','stats','2026-03-24 10:10:45'),(10,'contact_phone','+62 812-3456-7890','text','No. Telepon','contact','2026-03-24 10:10:45'),(11,'contact_email','hello@mikroliving.com','text','Email','contact','2026-03-24 10:10:45'),(12,'contact_address','Jl. Kemang Raya No. 45, Jakarta Selatan 12730','text','Alamat','contact','2026-03-24 10:10:45'),(13,'contact_whatsapp','6281234567890','text','Nomor WhatsApp','contact','2026-03-24 10:10:45'),(14,'social_instagram','https://instagram.com/mikroliving','text','Instagram','social','2026-03-24 10:10:45'),(15,'social_linkedin','https://linkedin.com/company/mikroliving','text','LinkedIn','social','2026-03-24 10:10:45'),(16,'social_pinterest','https://pinterest.com/mikroliving','text','Pinterest','social','2026-03-24 10:10:45'),(17,'seo_title','MikroLiving | Designing Smart Living Spaces','text','SEO Title','seo','2026-03-24 10:10:45'),(18,'seo_description','Studio desain interior terpercaya di Jakarta & Bandung. Spesialis apartment kecil dan hunian modern.','text','SEO Description','seo','2026-03-24 10:10:45'),(19,'seo_keywords','desain interior jakarta, interior apartemen, mikroliving','text','SEO Keywords','seo','2026-03-24 10:10:45');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `avatar_id` varchar(255) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `linkedin` varchar(200) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_name` varchar(100) NOT NULL,
  `client_title` varchar(150) DEFAULT NULL,
  `content` text NOT NULL,
  `rating` tinyint(4) DEFAULT 5,
  `avatar_url` text DEFAULT NULL,
  `avatar_id` varchar(255) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'Sarah & Dimas','The Botanica Apartments','MikroLiving transformed our 45sqm apartment into a sanctuary. Their attention to storage solutions and aesthetic flow is truly unmatched in the industry.',5,NULL,NULL,1,1,1,1,'2026-03-24 10:10:46','2026-03-24 10:10:46');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','editor') DEFAULT 'editor',
  `avatar_url` text DEFAULT NULL,
  `avatar_id` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'MikroLiving Admin','admin@mikroliving.com','$2a$12$LoqxMN2lOYr/pR9/mcaO9eHWIqPIpWKzLPCDiGIDS7SgnefatNLQS','superadmin',NULL,NULL,1,'2026-03-28 10:05:37','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzc0NjY3MTM3LCJleHAiOjE3NzcyNTkxMzd9.2qVHFmPyrMzyznCaxTAwVvUoceYOD8oIEN96dZ9XaW0','2026-03-24 10:10:45','2026-03-28 10:05:37'),(2,'MikroLiving Admin Editor','admin.editor@mikroliving.com','$2a$12$YTLFbNk6hbGVCWtICRW9oOWlDDIi5snSFfZwONlhZX12thGn8831u','admin',NULL,NULL,1,'2026-03-24 18:19:13','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzc0MzUxMTUzLCJleHAiOjE3NzY5NDMxNTN9.zbZvGHR8jShG02gRC7R5p3DI7ZBo7-H-R-28yAmqacU','2026-03-24 18:17:57','2026-03-24 18:19:13');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'u659924432_mikro_living'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-28 22:39:53
