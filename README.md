# CRUD-API

## Description
This application demonstrates simple CRUD API implemented using Node.js.

- The task is implemented using TypeScript.
- Used libraries:
  - `nodemon`
  - `dotenv`
  - `cross-env`
  - `typescript`
  - `ts-node`
  - `ts-node-dev`
  - `eslint` and its plugins
  - `webpack-cli`
  - `webpack` and its plugins
  - `prettier`
  - `uuid`
  - `@types/`
  - `Jest`.

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/orla90/CRUD-API.git

2. **Go to the project directory**
    ```bash
    cd CRUD-API

3. **Switch to the develop branch**
    ```bash
    git checkout develop

4. **Install dependencies**
    ```bash
    npm install

5. **Use one of Running Modes commands**
- Use Node.js version 22.x.x (22.9.0 or higher). To run the application use one of the running modes commands.

### Running Modes
- **Development Mode:** Use `npm run start:dev` to run the application with `nodemon`.
- **Production Mode:** Use `npm run start:prod` to start the build process and run the bundled file.
- **Horizontal Scaling Mode:** Use `npm run start:multi` to start multiple instances of application using the Node.js Cluster API .


## Implementation Details

### Endpoints

#### `GET /api/users`
- **Description:** Retrieve all users.
- **Response:**
  - Status Code: `200`
  - Body: Array of user records.

#### `GET /api/users/{userId}`
- **Description:** Retrieve a user by their ID.
- **Response:**
  - Status Code: `200` if user exists.
  - Status Code: `400` if `userId` is invalid (not a UUID).
  - Status Code: `404` if user does not exist.

#### `POST /api/users`
- **Description:** Create a new user record.
- **Request Body:**
    ```json
    {
      "username": "string (required)",
      "age": "number (required)",
      "hobbies": "array of strings (required)"
    }
    ```
- **Response:**
  - Status Code: `201` with the newly created record.
  - Status Code: `400` if the request body does not contain required fields.

#### `PUT /api/users/{userId}`
- **Description:** Update an existing user.
- **Request Body:**
    ```json
    {
      "username": "string",
      "age": "number",
      "hobbies": "array of strings"
    }
    ```
- **Response:**
  - Status Code: `200` with the updated record.
  - Status Code: `400` if `userId` is invalid.
  - Status Code: `404` if the user does not exist.

#### `DELETE /api/users/{userId}`
- **Description:** Delete a user by their ID.
- **Response:**
  - Status Code: `204` if the record is found and deleted.
  - Status Code: `400` if `userId` is invalid.
  - Status Code: `404` if the user does not exist.

### User Properties

Users are stored as objects with the following properties:

- `id`: Unique identifier (string, UUID) generated on the server side.
- `username`: User's name (string, required).
- `age`: User's age (number, required).
- `hobbies`: User's hobbies (array of strings or empty array, required).

### Environment Configuration

The value of the port on which the application is running is stored in a `.env` file.

### Testing
- **Testing:** Use `npm run test` to run the application tests.
