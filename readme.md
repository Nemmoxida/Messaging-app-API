# Messaging API – Learning Project

This project is a simple messaging API built for learning purposes, focusing on:

- WebSocket (WS) communication
- Caching using local variables

## Features

- Group logic (create, delete, group messaging, etc.)
- User authentication and login
- Message formatting
- Offline message gathering (planned)
- Message storage in a local database (planned)
- Message encryption (planned)
- Simple frontend for testing (planned)

## Project Structure

- `app.js` – Main entry point
- `database/` – Database logic
- `middlerware/` – Custom error handling
- `modules/` – Core modules (auth, group logic, routes, WebSocket handlers)
- `test.js` – Test scripts

## How It Works

- Uses WebSocket for real-time messaging between users and groups.
- Caches active user and group data in local variables for quick access.
- Handles authentication and group management.
- Designed for experimentation and learning, not for production use.

## Getting Started

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Start the server: `node app.js`
4. Use the provided endpoints or WebSocket interface to interact with the API.

## Learning Goals

- Understand WebSocket basics and real-time communication.
- Learn about caching strategies using local variables.
- Practice building modular Node.js applications.
