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
   PORT=8080
   FIREBASE_DATABASE_URL=https://your-database-url.firebaseio.com
   ```

## Configuration

Ensure you have a Firebase project set up, and you have the correct service account key. The Firestore database should have the following collections:

- `users`
- `inspections`
- `damages`

## Usage

1. **Start the server:**

   ```bash
   npm start
   ```

   The server will start on the port specified in the `.env` file (default is `8080`).

2. **Access the API:**

   Open your browser or use Postman to access the API at `http://localhost:8080`.

## API Endpoints

### Root Endpoint

- **GET /**

  Returns a simple welcome message.

  ```http
  GET /
  ```

### User Endpoints

- **POST /register**

  Registers a new user.

  ```http
  POST /register
  ```

  - **Request Body:**

    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string"
    }
    ```

  - **Response:**

    - `200 OK` if registration is successful.
    - `400 Bad Request` if required fields are missing.
    - `500 Internal Server Error` if registration fails.

- **POST /login**

  Logs in a user.

  ```http
  POST /login
  ```

  - **Request Body:**

    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```

  - **Response:**

    - `200 OK` if login is successful.
    - `404 Not Found` if the user is not found.
    - `500 Internal Server Error` if login fails.

### Inspection Endpoints

- **POST /inspection/new**

  Starts a new road inspection.

  ```http
  POST /inspection/new
  ```

  - **Request Body:**

    ```json
    {
      "name_of_officer": "string",
      "name_of_road": "string",
      "length_of_road": "number",
      "type_of_road_surface": "string",
      "location_start": "string"
    }
    ```

  - **Response:**

    - `200 OK` if the inspection starts successfully.
    - `400 Bad Request` if required fields are missing.
    - `500 Internal Server Error` if the inspection fails to start.

- **POST /inspection/detected**

  Saves detected road damages.

  ```http
  POST /inspection/detected
  ```

  - **Request Body:**

    ```json
    {
      "image": "string",
      "count_damages": "number",
      "count_damages_type_0": "number",
      "count_damages_type_1": "number",
      "count_damages_type_2": "number",
      "count_damages_type_3": "number",
      "location": "string",
      "detected": "string"
    }
    ```

  - **Response:**

    - `200 OK` if damages are saved successfully.
    - `500 Internal Server Error` if saving damages fails.

- **POST /inspection/end**

  Ends an ongoing inspection.

  ```http
  POST /inspection/end
  ```

  - **Request Body:**

    ```json
    {
      "location_end": "string"
    }
    ```

  - **Response:**

    - `200 OK` if the inspection ends successfully.
    - `500 Internal Server Error` if ending the inspection fails.

- **GET /inspection/history**

  Fetches the inspection history.

  ```http
  GET /inspection/history
  ```

  - **Response:**

    - `200 OK` with the inspection history data.
    - `500 Internal Server Error` if fetching the history fails.

- **GET /inspection/detail/:id**

  Fetches the details of a specific inspection by ID.

  ```http
  GET /inspection/detail/:id
  ```

  - **Response:**

    - `200 OK` with the inspection detail data.
    - `404 Not Found` if the inspection is not found.
    - `500 Internal Server Error` if fetching the detail fails.

### `POST /image/upload`

**Description:** This endpoint handles the upload of an image file, processes the image using Roboflow to detect damage, and saves the processed results and image to Google Cloud Storage. Additionally, damage details are saved to Firestore.

## Request

### Headers

- `Content-Type: multipart/form-data`

### Form-data

- **file** (required): The image file to be uploaded. Must be in a supported image format (e.g., JPG, PNG).
- **identifier** (required): A unique identifier for the image to distinguish it in storage.
- **location** (optional): The location where the image was taken.

### Example Request

```bash
curl -X POST http://your-api-url/image/upload \
  -F "file=@path/to/your/image.jpg" \
  -F "identifier=image_001" \
  -F "location=New York, USA"
```

## Response

### Success

- **Status Code:** `200 OK`
- **Content-Type:** `application/json`
  
**Response Body:**

```json
{
  "labeledImageUrl": "gs://bucket_name/path/to/labeled_image.jpg",
  "resultUrl": "gs://bucket_name/path/to/damages.jsonl",
  "damages": {
    "count_damages": 2,
    "count_damages_type_0": 1,
    "count_damages_type_1": 0,
    "count_damages_type_2": 1,
    "count_damages_type_3": 0,
    "detected": true,
    "image": "example_image_01",
    "location": "jakarta, Indonesia"
  }
}
```

### Error

- **Status Code:** `400 Bad Request`
  - **Message:** `Image file or identifier is missing`
- **Status Code:** `500 Internal Server Error`
  - **Message:** `Error processing image`

## Processing Details

1. **Image Upload:** The image file is uploaded and saved temporarily.
2. **Image Processing:** The image is processed using the Roboflow API to detect damages.
3. **Result Storage:**
   - **Labeled Image:** The image with annotations is uploaded to Google Cloud Storage.
   - **Damage Details:** The damage details are saved in JSON Lines (JSONL) format and uploaded to Google Cloud Storage.
   - **Firestore:** Damage details are saved in Firestore for record-keeping.

## JSON Lines (JSONL) Format

Damage details are stored in JSON Lines (JSONL) format, where each line is a valid JSON object representing a damage record. This format is efficient for handling and processing large volumes of data.

**Example JSONL Line:**

```json
{"count_damages":2,"count_damages_type_0":1,"count_damages_type_1":0,"count_damages_type_2":1,"count_damages_type_3":0,"detected":true,"image":"example_image_01","location":"jakarta, Indonesia"}
```

Each line contains a complete JSON object representing a single record of damage details.