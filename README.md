
# NodeJS Code-Challenge

This project implements a backend REST service that generates a study schedule for users.

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- Docker
- Docker Compose
- Firebase project with Authentication enabled

## Getting started
1. Clone the repository
```bash
$ git clone https://github.com/LeandroFernandezRuhl/code-challenge.git
$ cd code-challenge
```
2. Set up environment variables
```env
# Application
PORT=<Application port>

# Database
DB_HOST=<Database host>
DB_PORT=<Database port>
DB_USERNAME=<Database username>
DB_PASSWORD=<Database password>
DB_DATABASE=<Database name>

# Firebase
WEB_API_KEY=<Firebase API key>
```
You can get the Web API Key in the Firebase Console inside Project Settings.

3. Set up the same database password in docker-compose.yml
```yml
services:
  db:
    image: postgres
    restart: always
    environment:
      - POSTGRES_PASSWORD=<your_password>
...
```

4. Obtain Admin SDK Configuration
- In the Firebase Console, navigate to Project Settings > Service accounts.
- Click on “Generate new private key” to download a JSON file containing your Firebase Admin SDK configuration.
- Rename the JSON file to firebaseServiceAccountKey.json and put it inside the /config folder.

5. Install dependencies
```bash
$ npm install
```

6. Start the application and services with Docker Compose
```bash
$ sudo docker-compose up --build
```

## API Endpoints
You can try out all the endpoints using the **Postman Collection** at the root of the project.

**POST /user/signup**

**Description:** Registers a new user using Firebase Authentication.

**Request Body:**
```json
{
    "email": "leandro@test.com",
    "password": "Some password",
    "firstName": "Leandro",
    "lastName": "Fernandez",
    "role": "USER"
}
```
**Response:**
```json
{
    "uid": "User ID",
    "email": "leandro@test.com",
    "emailVerified": false,
    "displayName": "Leandro Fernandez",
    "disabled": false,
    "metadata": { ... },
    "tokensValidAfterTime": "...",
    "providerData": [ ... ]
}
```

**POST /user/signin**

**Description:** Logs in a user and generates a Firebase Authentication token.

**Request Body:**
```json
{
    "email": "leandro@test.com",
    "password": "Some password",
    "firstName": "Leandro",
    "lastName": "Fernandez",
    "role": "USER"
}
```
**Response:**
```json
{
    "idToken": "ID Token",
    "refreshToken": "Refresh Token",
    "expiresIn": "3600"
}
```

**POST /courses/schedule**

**Description:** Receives a list of courses and their prerequisites, and returns the correct study order.

**IMPORTANT:** This endpoint requires an **Authorization** header containing your **idToken**, which can be obtained from the **/auth/signin** endpoint.

**Request Body:**
```json
{
  "courses": [
    {
      "desiredCourse": "PortfolioConstruction",
      "requiredCourse": "PortfolioTheories"
    },
    {
      "desiredCourse": "InvestmentManagement",
      "requiredCourse": "Investment"
    },
    {
      "desiredCourse": "Investment",
      "requiredCourse": "Finance"
    },
    {
      "desiredCourse": "PortfolioTheories",
      "requiredCourse": "Investment"
    },
    {
      "desiredCourse": "InvestmentStyle",
      "requiredCourse": "InvestmentManagement"
    }
  ]
}

```
**Response:**
```json
{
    "schedule": [
        "Finance",
        "Investment",
        "InvestmentManagement",
        "PortfolioTheories",
        "InvestmentStyle",
        "PortfolioConstruction"
    ]
}
```
