# Movie API

## Table of Contents
- [Introduction](#introduction)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Request and Response Formats](#request-and-response-formats)
- [Error Handling](#error-handling)
- [Getting Started](#getting-started)
  
## Introduction

Welcome to the Movie API, a RESTful API for managing movies and user accounts. This API allows you to perform various operations related to movies and user profiles.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, you need to include a valid JWT token in the `Authorization` header of your HTTP requests.

## Endpoints

### Users

#### Create a New User

- **Endpoint:** `POST /users`
- **Description:** Create a new user by providing user details in the request body.
- **Request Body:**
  - `Username` (string, required): The username for the new user.
  - `Password` (string, required): The user's password.
  - `Email` (string, required): The user's email address.
  - `Birthday` (string): The user's birthdate (optional).
- **Response:** Returns the created user object.

#### Get All Users

- **Endpoint:** `GET /users`
- **Description:** Retrieve a list of all users.
- **Authentication:** Requires a valid JWT token.
- **Response:** Returns an array of user objects.

#### Get User by Username

- **Endpoint:** `GET /users/:Username`
- **Description:** Retrieve user details by username.
- **Authentication:** Requires a valid JWT token.
- **Response:** Returns the user object for the specified username.

#### Update User Information

- **Endpoint:** `PUT /users/:Username`
- **Description:** Update user information by username.
- **Authentication:** Requires a valid JWT token.
- **Request Body:**
  - `Username` (string): The new username (optional).
  - `Password` (string): The new password (optional).
  - `Email` (string): The new email address (optional).
  - `Birthday` (string): The new birthdate (optional).
- **Response:** Returns the updated user object.

#### Delete User

- **Endpoint:** `DELETE /users/:Username`
- **Description:** Delete a user by username.
- **Authentication:** Requires a valid JWT token.
- **Response:** Returns a success message or an error message.

### Movies

#### Get All Movies

- **Endpoint:** `GET /movies`
- **Description:** Retrieve a list of all movies.
- **Authentication:** Requires a valid JWT token.
- **Response:** Returns an array of movie objects.

#### Get Movie by Title

- **Endpoint:** `GET /movies/:Title`
- **Description:** Retrieve movie details by title.
- **Authentication:** Requires a valid JWT token.
- **Response:** Returns the movie object for the specified title.

#### Create a New Movie

- **Endpoint:** `POST /movies`
- **Description:** Create a new movie by providing movie details in the request body.
- **Request Body:**
  - `Title` (string, required): The title of the movie.
  - `Description` (string): A brief description of the movie (optional).
  - `Genre` (object): The genre information for the movie.
  - `Director` (object): The director information for the movie.
  - `Actors` (array of strings): An array of actor names in the movie.
  - `ImagePath` (string): The path to the movie's image (optional).
  - `Featured` (boolean): Indicates if the movie is featured (optional).
- **Response:** Returns the created movie object.

#### Update Movie by Title

- **Endpoint:** `PUT /movies/:Title`
- **Description:** Update movie information by title.
- **Authentication:** Requires a valid JWT token.
- **Request Body:** Same as the request body for creating a movie.
- **Response:** Returns the updated movie object.

#### Delete Movie by Title

- **Endpoint:** `DELETE /movies/:Title`
- **Description:** Delete a movie by title.
- **Authentication:** Requires a valid JWT token.
- **Response:** Returns a success message or an error message.

## Request and Response Formats

For detailed information on request and response formats for each endpoint, please refer to the specific endpoint descriptions above.

## Error Handling

In case of errors, the API will respond with appropriate HTTP status codes and error messages. Make sure to handle errors gracefully in your client applications.

## Getting Started

1. Clone the repository.
2. Install the required dependencies.
3. Configure the environment variables, including the JWT secret and database URI.
4. Start the server.
5. Use the API endpoints to interact with movies and user data.

