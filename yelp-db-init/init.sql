-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: yelpdb
-- ------------------------------------------------------
-- Server version	5.7.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `businesses` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text,
  `city` varchar(255) NOT NULL,
  `state` char(2) NOT NULL,
  `zip` char(5) NOT NULL,
  `phone` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  `website` text,
  `ownerID` char(24) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ownerID` (`ownerID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (1,'MyBusiness','7200 NW GrandviewDr.','Corvallis','OR','97330',54190555,'Restaurant','Brewpub','http://block15.com','2'),(2,'yourBusiness','70 NW view Dr.','Corv.','OR','9330',5419055,'Bar','Alcohol','http://bl.com','1'),(3,'wowBusiness','70 NW view Dr.','Corv.','OR','9330',5419055,'Nine','Shop','http://bl.com','5'),(4,'HMMMBusiness','70 NW view Dr.','Corv.','OR','9330',5419055,'Nine','Shopingnaa','http://bl.com','5'),(5,'MyBusiness','7200 NW GrandviewDr.','Corvallis','OR','97330',54190555,'Restaurant','Brewpub','http://block15.com','2');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photos` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `userID` char(24) NOT NULL,
  `businessID` char(24) NOT NULL,
  `caption` text,
  `data` text,
  PRIMARY KEY (`id`),
  KEY `idx_userID` (`userID`),
  KEY `idx_businessID` (`businessID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` VALUES (1,'3','7','That palce is awesome','OR is the location'),(2,'5','2','Just awesome','Nono Dont go');
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `userID` char(24) NOT NULL,
  `businessID` char(24) NOT NULL,
  `dollars` char(24) NOT NULL,
  `stars` decimal(5,1) unsigned NOT NULL,
  `review` text,
  PRIMARY KEY (`id`),
  KEY `idx_userID` (`userID`),
  KEY `idx_businessID` (`businessID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-15  5:26:09
