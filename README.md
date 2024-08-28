# Rodex-Capstone API

This project is a RESTful API built with Node.js and Express, designed to manage user registration, login, and road inspection processes. The data is stored in Google Firestore.

## Project Structure

```
Rodex-Capstone API
├── .env
├── .firebaserc
├── .gitignore
├── firebase.json
├── index.js
├── package-lock.json
├── package.json
├── README.md
├── tree.txt
└── src
    ├── app.js
    ├── config
    │   └── db.js
    ├── controllers
    │   ├── imageController.js
    │   ├── inspectionController.js
    │   └── userController.js
    ├── routes
    │   ├── imageRoutes.js
    │   ├── inspectionRoutes.js
    │   └── userRoutes.js
    └── services
        ├── gcsService.js
        └── roboflowService.js
```

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

## API Endpoints

### Authentication

#### [Authentication] Register User

- **Method**: `POST`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/user/register`
- **Body (JSON)**:
    ```json
    {
      "username": "adminDummy",
      "email": "adminDummy@gmail.com",
      "password": "pisangijo",
      "role": "admin"
    }
    ```
- **Description**: Registers a new user with the provided credentials.

#### [Authentication] Login User

- **Method**: `POST`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/user/login`
- **Body (JSON)**:
    ```json
    {
      "username": "adminDummy",
      "password": "pisangijo"
    }
    ```
- **Description**: Logs in an existing user.

#### [Authentication] Update User

- **Method**: `PUT`
- **URL**: `http://localhost:8080/user/update/D8FQQGPAI2SOeSvdqh22`
- **Body (JSON)**:
    ```json
    {
      "username": "adminDummy",
      "email": "bcough@gmail.com",
      "password": "pisangijo",
      "role": "admin"
    }
    ```
- **Description**: Updates user information for a specific user.

### Inspection

#### [Inspection] Inspection Get Detail

- **Method**: `GET`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/get/043cef93-46f6-4814-b488-89fc17cdedc2`
- **Description**: Retrieves details for a specific inspection by `inspectionId`.

#### [Inspection] Inspection Start

- **Method**: `POST`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/new`
- **Body (JSON)**:
    ```json
    {
      "name_of_officer": "John Doe",
      "name_of_road": "Fatmawati",
      "length_of_road": "9 km",
      "width_of_road": "20 m",
      "type_of_road_surface": "Asphalt",
      "location_start": "411.7749,-123.4194"
    }
    ```
- **Description**: Starts a new inspection.

#### [Inspection] Inspection End

- **Method**: `POST`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/end`
- **Body (JSON)**:
    ```json
    {
      "inspectionId": "043cef93-46f6-4814-b488-89fc17cdedc2",
      "location_end": "40.7749,-322.4394"
    }
    ```
- **Description**: Ends an inspection with the given `inspectionId`.

#### [Inspection] Inspection Get All

- **Method**: `GET`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/inspection/get`
- **Description**: Retrieves all inspections.

### Damage Detection

#### [Damage Detection] Get Damage with InspectionId

- **Method**: `GET`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/image/inspection-damages/043cef93-46f6-4814-b488-89fc17cdedc2`
- **Description**: Retrieves damage data associated with a specific `inspectionId`.

#### [Damage Detection] Upload Image

- **Method**: `POST`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/image/upload`
- **Headers**: 
  - `Content-Type: multipart/form-data` (disabled)
- **Body (JSON)**:
    ```json
    {
      "file": "<add encoded base64 image>",
      "identifier": "example_image_09",
      "inspectionId": "043cef93-46f6-4814-b488-89fc17cdedc2"
    }
    ```
- **Description**: Uploads an image to be processed for damage detection, associated with a given `inspectionId`.

#### [Damage Detection] Get All Damage Detection

- **Method**: `GET`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/image/damages`
- **Description**: Retrieves all damage detections.

#### [Damage Detection] Get Damage Detail

- **Method**: `GET`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api/image/damages/477851bc-96af-4d04-9841-6604feadd7f0`
- **Description**: Retrieves detailed damage detection information by its ID.

### Initialization

#### Initialization

- **Method**: `GET`
- **URL**: `https://us-central1-capstone-426015.cloudfunctions.net/api`
- **Description**: API Initialization Endpoint.