Certainly! Here’s a `README.md` file for your Node.js application that uses Express and Firestore:

---

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

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss improvements or fixes.

## License

This project is licensed under the MIT License.

---

This `README.md` file provides a clear and concise overview of the project, including setup instructions, usage, and API documentation.