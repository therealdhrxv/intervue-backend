# Live Polling System - Backend Documentation

This document provides a comprehensive overview of the live polling system's backend, including its API, architecture, and potential for scalability.

## 1. REST API Routes

### Session Management

#### `POST /api/session/register`
- **Description:** Registers a new student.
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "string",
    "name": "string",
    "role": "student",
    "sessionId": "string",
    "createdAt": "date"
  }
  ```
- **Triggered by:** Student

#### `POST /api/session/teacher`
- **Description:** Creates a new teacher.
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "string",
    "name": "string",
    "role": "teacher",
    "sessionId": "string",
    "createdAt": "date"
  }
  ```
- **Triggered by:** Teacher

### Polls

#### `GET /api/polls`
- **Description:** Retrieves all polls.
- **Request Body:** None
- **Response Body:**
  ```json
  {
    "polls": [
      {
        "id": "string",
        "question": "string",
        "options": [
          {
            "id": "string",
            "text": "string",
            "isCorrect": "boolean"
          }
        ],
        "createdBy": "string",
        "timeLimit": "number",
        "status": "string",
        "createdAt": "date",
        "correctOptionIndex": "number"
      }
    ]
  }
  ```
- **Triggered by:** Teacher, Student

#### `POST /api/polls`
- **Description:** Creates a new poll.
- **Request Body:**
  ```json
  {
    "question": "string",
    "options": ["string"],
    "createdBy": "string",
    "timeLimit": "number",
    "status": "string",
    "correctOptionIndex": "number"
  }
  ```
- **Response Body:** The created poll object.
- **Triggered by:** Teacher

#### `GET /api/polls/:id`
- **Description:** Retrieves a specific poll by its ID.
- **Request Body:** None
- **Response Body:** The poll object.
- **Triggered by:** Teacher, Student

#### `PUT /api/polls/:id`
- **Description:** Updates a poll.
- **Request Body:**
  ```json
  {
    "question": "string",
    "options": ["string"],
    "timeLimit": "number",
    "status": "string"
  }
  ```
- **Response Body:** The updated poll object.
- **Triggered by:** Teacher

#### `DELETE /api/polls/:id`
- **Description:** Deletes a poll.
- **Request Body:** None
- **Response Body:**
  ```json
  {
    "success": true
  }
  ```
- **Triggered by:** Teacher

### Responses

#### `POST /api/polls/:id/responses`
- **Description:** Submits a response to a poll.
- **Request Body:**
  ```json
  {
    "studentId": "string",
    "optionId": "string"
  }
  ```
- **Response Body:** The created response object.
- **Triggered by:** Student

#### `GET /api/polls/:id/responses`
- **Description:** Retrieves all responses for a specific poll.
- **Request Body:** None
- **Response Body:**
  ```json
  {
    "responses": [
      {
        "id": "string",
        "pollId": "string",
        "studentId": "string",
        "optionId": "string",
        "submittedAt": "date"
      }
    ]
  }
  ```
- **Triggered by:** Teacher

### Students

#### `GET /api/students`
- **Description:** Retrieves all users (students and teachers).
- **Request Body:** None
- **Response Body:**
  ```json
  {
    "users": [
      {
        "id": "string",
        "name": "string",
        "role": "string",
        "socketId": "string",
        "sessionId": "string",
        "createdAt": "date",
        "lastActive": "date"
      }
    ]
  }
  ```
- **Triggered by:** Teacher, Student

#### `DELETE /api/students/:id`
- **Description:** (Dummy endpoint) Simulates removing a student.
- **Request Body:** None
- **Response Body:**
  ```json
  {
    "message": "Student removed (dummy)"
  }
  ```
- **Triggered by:** Teacher

### Chat

#### `POST /api/chat`
- **Description:** Creates a new chat message.
- **Request Body:**
  ```json
  {
    "userId": "string",
    "userName": "string",
    "message": "string"
  }
  ```
- **Response Body:** The created chat message object.
- **Triggered by:** Teacher, Student

#### `GET /api/chat`
- **Description:** Retrieves all chat messages.
- **Request Body:** None
- **Response Body:** An array of chat message objects.
- **Triggered by:** Teacher, Student

## 2. WebSocket (Socket.IO) Events

### Server-to-Client Events

#### `poll:created`
- **Description:** Notifies clients that a new poll has been created.
- **Payload:** The created poll object.

#### `poll:activated`
- **Description:** Notifies clients that a poll has been activated.
- **Payload:** The activated poll object.

#### `poll:results`
- **Description:** Sends the results of a poll to clients.
- **Payload:**
  ```json
  {
    "pollId": "string",
    "results": [
      {
        "optionId": "string",
        "text": "string",
        "count": "number"
      }
    ]
  }
  ```

#### `poll:response`
- **Description:** Notifies clients that a student has responded to a poll.
- **Payload:** The response object.

#### `chat:newMessage`
- **Description:** Broadcasts a new chat message to all clients.
- **Payload:** The new chat message object.

### Client-to-Server Events

#### `chat-message`
- **Description:** Sends a chat message from a client to the server.
- **Payload:** The chat message content.

## 3. Technical Details

### Architecture
- **Monolithic Architecture:** The entire backend is a single, self-contained application.
- **In-Memory Data Store:** The application uses simple arrays to store users, polls, responses, and messages. This means all data is lost when the server restarts.

### Tech Stack
- **Node.js:** A JavaScript runtime for building server-side applications.
- **Express:** A web application framework for Node.js, used to build the REST API.
- **TypeScript:** A superset of JavaScript that adds static typing.
- **Socket.IO:** A library for real-time, bidirectional, and event-based communication.

### Authentication
- **No Authentication:** The system lacks a robust authentication mechanism. It relies on a `sessionId` generated at login, but this is not validated in subsequent requests.

### Database Schema/Models
- **User:**
  - `id`: string
  - `name`: string
  - `role`: 'teacher' | 'student'
  - `socketId`: string
  - `sessionId`: string
  - `createdAt`: Date
  - `lastActive`: Date
- **Poll:**
  - `id`: string
  - `question`: string
  - `options`: PollOption[]
  - `createdBy`: string
  - `timeLimit`: number
  - `status`: 'active' | 'completed'
  - `createdAt`: Date
- **Response:**
  - `id`: string
  - `pollId`: string
  - `studentId`: string
  - `optionId`: string
  - `submittedAt`: Date
- **ChatMessage:**
  - `id`: string
  - `userId`: string
  - `userName`: string
  - `message`: string
  - `timestamp`: string

### Real-time Flow
- The server uses Socket.IO to push real-time updates to clients.
- When a significant event occurs (e.g., a poll is created, a response is submitted), the server emits an event to all connected clients.

### Error Handling
- The application has basic error handling, returning appropriate HTTP status codes and JSON error messages for invalid requests.

## 4. Scaling Strategies

### Architectural Improvements
- **Microservices:** Break down the monolithic application into smaller, independent services (e.g., a `poll-service`, a `user-service`, a `chat-service`). This would allow for independent scaling and development of each service.
- **Persistent Database:** Replace the in-memory data store with a persistent database like PostgreSQL, MongoDB, or MySQL. This would ensure data is not lost on server restarts and would be more scalable.

### Horizontal Scaling
- **Load Balancer:** Use a load balancer (e.g., Nginx, HAProxy) to distribute incoming traffic across multiple instances of the application.
- **Stateless Application:** To enable horizontal scaling, the application should be made stateless. This means moving session data and other stateful information out of the application and into a centralized store like Redis.

### Caching Strategies
- **Redis:** Use an in-memory data store like Redis to cache frequently accessed data, such as poll results or user profiles. This would reduce the load on the primary database and improve response times.

### Queueing
- **Message Queue:** Use a message queue (e.g., RabbitMQ, Kafka) to handle asynchronous tasks, such as sending notifications or processing poll results. This would decouple different parts of the system and improve its resilience.

### Handling Increased Socket Connections
- **Socket.IO Redis Adapter:** Use the Socket.IO Redis adapter to broadcast events across multiple server instances. This is essential for maintaining real-time communication in a horizontally scaled environment.
