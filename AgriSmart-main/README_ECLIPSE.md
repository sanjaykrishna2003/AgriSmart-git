# AgriSmart Backend Microservices - Eclipse IDE Setup Guide

This folder contains all backend microservices for AgriSmart pre-configured with **Eclipse IDE project metadata** (`.project`, `.classpath`, and `.settings`) as well as **Standard Maven (`pom.xml`) structure**.

---

## 🚀 How to Import into Eclipse IDE

You can import this project into Eclipse using either of the two standard methods below:

### Option 1: Import as Existing Maven Projects (Recommended)
1. Launch **Eclipse IDE**.
2. Go to **File** ➔ **Import...**
3. Expand **Maven** ➔ select **Existing Maven Projects** ➔ Click **Next**.
4. Click **Browse...** and select the unzipped `AgriSmart_Backend` root directory.
5. Eclipse will scan and select all sub-modules:
   - `agrismart-parent`
   - `user-service`
   - `farm-service`
   - `crop-service`
   - `weather-service`
   - `analytics-service`
   - `auth-service`
6. Click **Finish**. Eclipse will resolve dependencies and set up your workspace automatically.

---

### Option 2: Import as Existing Projects into Workspace
1. Launch **Eclipse IDE**.
2. Go to **File** ➔ **Import...**
3. Expand **General** ➔ select **Existing Projects into Workspace** ➔ Click **Next**.
4. Click **Browse...** and select the unzipped `AgriSmart_Backend` root directory.
5. Ensure all microservices are checked in the projects list.
6. Click **Finish**.

---

## 🛠 Backend Microservice Ports & Running Order

| Service | Port | Main Class / Purpose |
| :--- | :--- | :--- |
| **User Service** | `8081` | User registration, login, profile management |
| **Farm Service** | `8082` | Farm plot registration, Turf.js geofencing data |
| **Crop Service** | `8083` | Crop tracking, NPK advisor, AI Chatbot |
| **Weather Service**| `8084` | Live Open-Meteo weather integration & forecasting |
| **Analytics Service**| `8085` | Predictive yield analytics & dashboard summaries |

### Database Setup:
- Database: **MySQL** (port `3306`)
- Database Name: `agrismart`
- SQL Pre-seed Script: `db_seed.sql` included in the root folder.
