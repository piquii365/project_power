-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: project_power
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analytics`
--

DROP TABLE IF EXISTS `analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `event_type` varchar(255) NOT NULL,
  `event_data` json DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text,
  `timestamp` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `analytics_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `analytics_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `analytics_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics`
--

LOCK TABLES `analytics` WRITE;
/*!40000 ALTER TABLE `analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatmessage`
--

DROP TABLE IF EXISTS `chatmessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatmessage` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `message` text NOT NULL,
  `response` text,
  `intent` varchar(255) DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `context` json DEFAULT NULL,
  `feedback` enum('helpful','not_helpful') DEFAULT NULL,
  `response_time` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chatmessage_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chatmessage_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chatmessage_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chatmessage_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatmessage`
--

LOCK TABLES `chatmessage` WRITE;
/*!40000 ALTER TABLE `chatmessage` DISABLE KEYS */;
/*!40000 ALTER TABLE `chatmessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `onboardingtask`
--

DROP TABLE IF EXISTS `onboardingtask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `onboardingtask` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `type` enum('video','document','interactive','meeting','hands-on','project') NOT NULL,
  `category` enum('company','security','hr','team','technical','project') NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `estimated_duration` int NOT NULL,
  `required_role` varchar(255) DEFAULT NULL,
  `required_department` varchar(255) DEFAULT NULL,
  `prerequisites` json DEFAULT NULL,
  `content` json DEFAULT NULL,
  `resources` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `order` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `onboardingtask`
--

LOCK TABLES `onboardingtask` WRITE;
/*!40000 ALTER TABLE `onboardingtask` DISABLE KEYS */;
INSERT INTO `onboardingtask` VALUES ('22aaab6d-2685-428f-a972-9e4e6b373c5a','Welcome & Company Overview','Learn about ZHD Consulting history, mission, values, and organizational structure','video','company','high',15,NULL,NULL,'[]','{\"slides\": [\"Company History\", \"Mission & Vision\", \"Core Values\", \"Organizational Chart\"], \"videoUrl\": \"https://example.com/welcome-video\"}','[{\"url\": \"https://example.com/handbook\", \"title\": \"Employee Handbook\"}, {\"url\": \"https://example.com/org-chart\", \"title\": \"Company Org Chart\"}]',1,1,'2025-06-27 06:45:39','2025-06-27 06:45:39'),('38ddbb84-e7e5-4725-abdc-251b72fcf1b0','HR Policies & Benefits','Understanding your benefits package, leave policies, and HR procedures','document','hr','medium',30,NULL,NULL,'[]','{\"documents\": [\"Benefits Overview\", \"Leave Policy\", \"Code of Conduct\", \"Performance Review Process\"]}','[{\"url\": \"https://benefits.zhdconsulting.com\", \"title\": \"Benefits Portal\"}, {\"url\": \"https://example.com/hr-contacts\", \"title\": \"HR Contact Info\"}]',1,3,'2025-06-27 06:45:39','2025-06-27 06:45:39'),('4ad2e182-524e-4688-8d1b-b501ea8bc6d9','Technical Setup & Tools','Configure your development environment, access company tools, and set up accounts','hands-on','technical','high',90,'new_hire','Engineering','[]','{\"tools\": [\"Slack\", \"Jira\", \"GitHub\", \"Figma\", \"AWS Console\"], \"setupSteps\": [\"Install development tools\", \"Configure IDE\", \"Set up version control\", \"Access cloud resources\"]}','[]',1,5,'2025-06-27 06:45:39','2025-06-27 06:45:39'),('80f0d641-649e-4beb-8486-80f872a128b2','First Project Assignment','Review and start your first project with guidance from your team lead','project','project','low',180,NULL,NULL,'[\"technical-setup\"]','{\"timeline\": \"2 weeks\", \"description\": \"Add new features to the customer portal\", \"projectName\": \"Customer Portal Enhancement\", \"technologies\": [\"React\", \"Node.js\", \"MySQL\"]}','[]',1,6,'2025-06-27 06:45:39','2025-06-27 06:45:39'),('8cdb0e09-94eb-4736-886c-8c3068b4b2d0','Team Introduction & Roles','Meet your team members, understand reporting structure, and schedule 1-on-1 meetings','meeting','team','medium',60,NULL,'Engineering','[]','{\"teamMembers\": [{\"name\": \"Sarah Chen\", \"role\": \"Team Lead\", \"email\": \"sarah.chen@zhd.com\"}, {\"name\": \"Mike Rodriguez\", \"role\": \"Senior Developer\", \"email\": \"mike.r@zhd.com\"}, {\"name\": \"Emily Watson\", \"role\": \"UX Designer\", \"email\": \"emily.w@zhd.com\"}]}','[]',1,4,'2025-06-27 06:45:39','2025-06-27 06:45:39'),('b326ef45-63e1-4ac7-8d7f-ab535ccaa345','IT Security Training','Essential cybersecurity practices, password policies, and data protection guidelines','interactive','security','high',45,NULL,NULL,'[]','{\"quiz\": true, \"modules\": [\"Password Security\", \"Phishing Awareness\", \"Data Protection\", \"VPN Usage\"]}','[{\"url\": \"https://example.com/security-policy\", \"title\": \"Security Policy\"}, {\"url\": \"https://example.com/vpn-guide\", \"title\": \"VPN Setup Guide\"}]',1,2,'2025-06-27 06:45:39','2025-06-27 06:45:39');
/*!40000 ALTER TABLE `onboardingtask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `role` enum('new_hire','hr_admin','manager','employee') DEFAULT 'new_hire',
  `department` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `onboarding_progress` int DEFAULT '0',
  `preferences` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('8af7f80c-c3a7-45b8-a88e-b570c6535571','john.doe@zhdconsulting.com','$2a$12$WWt0703m80nTCIZPlpNob.KxoeK2camPPiHyfoMPsv1dbP61xWrnq','John','Doe','new_hire','Engineering','Software Developer','2025-06-27 06:45:38','https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',NULL,NULL,1,NULL,65,'{}','2025-06-27 06:45:38','2025-06-27 06:45:38'),('b16a5aa4-12b1-454f-9fca-3b36fb8f92e0','hr@zhdconsulting.com','$2a$12$g1oRBFkDGY0YAh12gEwG4OGlfmuWvmUiiIgOUqSMEACQNaJdXbdPW','Sarah','Wilson','hr_admin','Human Resources','HR Manager','2023-01-15 00:00:00','https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',NULL,NULL,1,'2025-06-29 17:06:24',100,'{}','2025-06-27 06:45:37','2025-06-29 17:06:24');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertask`
--

DROP TABLE IF EXISTS `usertask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usertask` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `task_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('not_started','in_progress','completed','skipped') DEFAULT 'not_started',
  `progress` int DEFAULT '0',
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `time_spent` int DEFAULT '0',
  `feedback` text,
  `rating` int DEFAULT NULL,
  `notes` text,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `usertask_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usertask_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `onboardingtask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usertask_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usertask_ibfk_4` FOREIGN KEY (`task_id`) REFERENCES `onboardingtask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usertask_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usertask_ibfk_6` FOREIGN KEY (`task_id`) REFERENCES `onboardingtask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usertask_ibfk_7` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usertask_ibfk_8` FOREIGN KEY (`task_id`) REFERENCES `onboardingtask` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertask`
--

LOCK TABLES `usertask` WRITE;
/*!40000 ALTER TABLE `usertask` DISABLE KEYS */;
INSERT INTO `usertask` VALUES ('657c7777-4c3c-48e0-a39d-a2dd9754b63a','8af7f80c-c3a7-45b8-a88e-b570c6535571','80f0d641-649e-4beb-8486-80f872a128b2','not_started',0,NULL,NULL,0,NULL,NULL,NULL,'2025-07-09 06:45:40','2025-06-27 06:45:40','2025-06-27 06:45:40'),('6aeb4c94-45ea-4c5f-a1cc-01c78351cf64','8af7f80c-c3a7-45b8-a88e-b570c6535571','b326ef45-63e1-4ac7-8d7f-ab535ccaa345','completed',100,'2025-06-26 06:45:39','2025-06-27 06:45:39',0,NULL,NULL,NULL,'2025-07-01 06:45:39','2025-06-27 06:45:39','2025-06-27 06:45:39'),('d370d5b1-c014-43af-ae9d-921309caaaa5','8af7f80c-c3a7-45b8-a88e-b570c6535571','22aaab6d-2685-428f-a972-9e4e6b373c5a','completed',100,'2025-06-25 06:45:39','2025-06-26 06:45:39',0,NULL,NULL,NULL,'2025-06-29 06:45:39','2025-06-27 06:45:39','2025-06-27 06:45:39'),('d4c4440b-b6f0-46e3-99e5-cfaed98018de','8af7f80c-c3a7-45b8-a88e-b570c6535571','38ddbb84-e7e5-4725-abdc-251b72fcf1b0','in_progress',75,'2025-06-27 06:45:40',NULL,0,NULL,NULL,NULL,'2025-07-03 06:45:40','2025-06-27 06:45:40','2025-06-27 06:45:40'),('ddd9f54c-fc87-44cc-adfa-e8ffc252ddfd','8af7f80c-c3a7-45b8-a88e-b570c6535571','8cdb0e09-94eb-4736-886c-8c3068b4b2d0','not_started',0,NULL,NULL,0,NULL,NULL,NULL,'2025-07-05 06:45:40','2025-06-27 06:45:40','2025-06-27 06:45:40'),('e5593598-1fa3-494c-a531-acd0dbdc903d','8af7f80c-c3a7-45b8-a88e-b570c6535571','4ad2e182-524e-4688-8d1b-b501ea8bc6d9','not_started',0,NULL,NULL,0,NULL,NULL,NULL,'2025-07-07 06:45:40','2025-06-27 06:45:40','2025-06-27 06:45:40');
/*!40000 ALTER TABLE `usertask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'project_power'
--

--
-- Dumping routines for database 'project_power'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 16:53:35
