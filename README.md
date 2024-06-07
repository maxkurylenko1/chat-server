# Chat Application Backend
## Technologies
- Backend: Node.js, Express
- Authentication: JWT auth flow
- Database: MongoDB
- Real-time Communication: WebSocket
## Project Overview
This repository contains the backend of a chat application built with modern web development technologies. The backend provides the necessary APIs and real-time communication support for the chat application.

## Key Features
1 - User Registration and Authentication:
  - Secure user authentication using JSON Web Tokens (JWT).
  - New user registration with data validation.

2 - Profile Management:
  - Users can create and edit their profiles.
  - Uploading and updating profile pictures.

3 - Real-time Chatting:
  - Instant messaging functionality with WebSocket.
  - Support for private and group chats.

4 - Group Creation and Management:
  - Ability to create new chat groups.
  - Adding and removing members from groups.

5 - Contact Management:
  - Adding users to contact lists.
  - Blocking and unblocking users.

6 - File and Photo Sharing:
  - Sending photos and files within the chat.
  - Viewing shared files and images.

## Project Structure
The backend is developed with Node.js and Express, incorporating JWT for authentication and MongoDB as the database. WebSocket is used for real-time communication.

## Setup Instructions
1 Clone the repository:
```
  $ git clone https://github.com/yourusername/chat-app-backend.git
```
2 Install dependencies:
```
  $ cd chat-app-backend
  $ npm install
```
3 Environment Variables: Create a .env file in the root directory and add the following:
```
ACCESS_TOKEN_SECRET=<access_token_secret>
REFRESH_TOKEN_SECRET=<refresh_token_secret>
COOKIES_SECRET=<coockies_secret>
MONGO_URI=<mongoUri>
```
4 Run the application:
```
  $ npm start
```
## Contributions
Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License
This project is licensed under the MIT License.
