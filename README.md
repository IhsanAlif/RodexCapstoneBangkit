# Rodex-Capstone API

This project is a RESTful API built with Node.js and Express, designed to manage user registration, login, and road inspection processes. The data is stored in Google Firestore.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/rodex-capstone.git
   cd rodex-capstone
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Firebase:**

   - Download your Firebase service account key from the Firebase console.
   - Place the key in the `src/config` directory, and name it `serviceAccountKey.json`.

4. **Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   GOOGLE_APPLICATION_CREDENTIALS=src/config/serviceAccountKey.json
   ```

## Configuration

Ensure you have a Firebase project set up, and you have the correct service account key. The Firestore database should have the following collections:

- `users`
- `inspections`
- `damages`

## Usage

1. **Start the server:**

   ```bash
   node server.js
   ```

   The server will start on the port specified in the `.env` file (default is `8080`).

2. **Access the API:**

   Open your browser or use Postman to access the API at `https://us-central1-capstone-426015.cloudfunctions.net/api`.

# API Endpoints

## Authentication

### Login User
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/user/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "badmin",
    "password": "pisangijo"
  }
  ```

### Update User
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/user/update/:id`
- **Method:** `PUT`
- **Request Body:**
  ```json
  {
    "username": "badmin",
    "email": "bcough@gmail.com",
    "password": "pisangijo",
    "role": "admin"
  }
  ```
- **URL Parameters:**
  - `id` - The ID of the user to be updated

### Register User
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/user/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "buser",
    "email": "bcox@gmail.com",
    "password": "pisangijo",
    "role": "user"
  }
  ```

## Damage Detection

### Upload Image
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/image/upload`
- **Method:** `POST`
- **Request Body (RAW):**
  - `identifier` - Example image identifier
  - `inspectionId` - The ID of the related inspection
  - `file` - The image file to upload in base64 String

### Get All Damage Detection
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/image/damages`
- **Method:** `GET`

### Get Damage Detail
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/image/damages/:id`
- **Method:** `GET`
- **URL Parameters:**
  - `id` - The ID of the damage detail to retrieve

## Inspection

### Start Inspection
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/new`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name_of_officer": "John Doe",
    "name_of_road": "Main Street",
    "length_of_road": "5 km",
    "width_of_road": "5 km",
    "type_of_road_surface": "Asphalt",
    "location_start": "37.7749,-122.4194"
  }
  ```

### End Inspection
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/end`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "location_end": "37.7749,-122.4194"
  }
  ```

### Get All Inspections
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/get`
- **Method:** `GET`

### Get Inspection Detail
- **URL:** `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/get/:id`
- **Method:** `GET`
- **URL Parameters:**
  - `id` - The ID of the inspection detail to retrieve