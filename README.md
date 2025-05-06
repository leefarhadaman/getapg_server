GetAPG Backend Server
This repository contains the backend server for the GetAPG app, a Flutter-based property listing application designed for searching and managing properties like PGs, villas, flats, and hostels. The backend is built with Node.js, Express.js, and MySQL (using Sequelize as the ORM), providing robust APIs for user authentication, property management, advanced filtering, location-based search, and photo/contact management. The server is designed with advanced error handling, logging, and security features to ensure reliability and scalability.
The source code for the GetAPG frontend (Flutter app) is available at: https://github.com/leefarhadaman/stayeasy
Table of Contents

Features
Technologies Used
How It Works
Setup Instructions
API Routes
Error Handling
Logging
Contributing
License

Features

User Management: Secure registration, login, and profile retrieval with JWT-based authentication.
Property Management: Create, update, delete, and list properties (PGs, villas, flats, hostels) with details like rent, gender, amenities, and location.
Advanced Filtering: Filter properties by type, gender, rent range, and amenities.
Location-Based Search: Search properties by city or geospatial coordinates (latitude/longitude with radius).
Photo Management: Upload and delete property photos (minimum 4, stored locally).
Contact Visibility: Owners can control whether contact details (phone, email) are visible to users.
Security: JWT authentication, bcrypt password hashing, input validation, and rate limiting.
Error Handling: Comprehensive handling of validation, database, file upload, and authentication errors.
Logging: Detailed logging of API calls, errors, and warnings using Winston.

Technologies Used
The backend leverages the following tools and libraries:

Node.js: JavaScript runtime for server-side development.
Express.js: Web framework for building RESTful APIs.
MySQL: Relational database for storing data.
Sequelize: ORM for MySQL, simplifying database interactions.
jsonwebtoken (JWT): Token-based authentication.
bcrypt: Password hashing for secure storage.
multer: File upload handling for property photos.
winston: Logging library for debugging and monitoring.
express-validator: Input validation and sanitization.
express-rate-limit: Rate limiting to prevent abuse.
cors: Cross-Origin Resource Sharing for frontend integration.
dotenv: Environment variable management.
nodemon: Development tool for auto-restarting the server.

How It Works
The GetAPG backend serves as the API layer for the GetAPG Flutter app, handling all server-side logic. Here's an overview of its functionality:

Database Structure:

Users: Stores user data (email, password, name, role: user/owner).
Properties: Stores property details (name, type, rent, gender, location, owner).
Locations: Stores city and geospatial coordinates.
Amenities: Stores available amenities (e.g., WiFi, AC).
Property_Amenities: Junction table for many-to-many property-amenity relationships.
Photos: Stores property photo URLs.
Contacts: Stores owner contact details with a visibility flag.


API Flow:

Users register/login to obtain a JWT token.
Owners create/update properties with photos (min 4) and contact details.
Users search properties by location or filter by criteria (type, gender, rent, amenities).
Photos are uploaded to the server and served statically.
Contact details are shown only if the owner enables visibility and the user is authenticated.


Security:

JWT protects routes (e.g., property creation).
Passwords are hashed with bcrypt.
Inputs are validated with express-validator to prevent XSS and SQL injection.
Rate limiting is applied to authentication endpoints.
File uploads are restricted to JPEG/PNG (<5MB).


Error Handling:

Validation errors (e.g., invalid email) return 400 with clear messages.
Database errors (e.g., duplicate email) are caught and logged.
File upload errors (e.g., invalid type) trigger cleanup and error responses.
Authentication errors (e.g., invalid JWT) return 401.
Unexpected errors are caught by a global handler and logged.


Logging:

API calls, errors, and warnings are logged using Winston.
Logs are stored in logs/error.log and logs/combined.log for debugging.



Setup Instructions
Follow these steps to set up the backend locally:
Prerequisites

Node.js: v16 or higher
MySQL: v8 or higher
Git: For cloning the repository

Steps

Clone the Repository:
git clone https://github.com/leefarhadaman/getapg_server.git
cd getapg-backend


Install Dependencies:
npm install


Set Up MySQL:

Create a database:CREATE DATABASE property_app;


Run the SQL queries from create_tables.sql (available in the repository) to create tables:-- Users Table
CREATE TABLE Users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'owner') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);
-- (Other tables: Locations, Properties, Amenities, Property_Amenities, Photos, Contacts)




Configure Environment Variables:

Create a .env file in the root directory:PORT=5000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=property_app
JWT_SECRET=your_jwt_secret
UPLOAD_PATH=./uploads


Replace placeholders with your MySQL credentials and a secure JWT secret.


Create Uploads Directory:
mkdir uploads


Run the Server:

Development (with nodemon):npm run dev


Production:npm start




Test APIs:

Use Postman or a similar tool.
Start with /api/auth/register to create a user and obtain a JWT token.
Use the token in the Authorization header (Bearer <token>) for protected routes.



API Routes
Below is a detailed list of all API endpoints, including request formats, responses, and possible errors.
Base URL
http://localhost:5000/api
Authentication

POST /auth/register

Description: Register a new user.
Body:{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user" // or "owner"
}


Response (201):{
  "token": "jwt_token",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe", "role": "user" }
}


Errors:
400: Validation errors, duplicate email
500: Server error




POST /auth/login

Description: Login and obtain JWT.
Body:{
  "email": "user@example.com",
  "password": "password123"
}


Response (200):{
  "token": "jwt_token",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe", "role": "user" }
}


Errors:
400: Validation errors
401: Invalid credentials
500: Server error




GET /auth/profile

Description: Get authenticated user profile.
Headers: Authorization: Bearer <token>
Response (200):{ "id": 1, "email": "user@example.com", "name": "John Doe", "role": "user" }


Errors:
401: Invalid/no token
404: User not found
500: Server error





Properties

POST /properties

Description: Create a new property (owner only).
Headers: Authorization: Bearer <token>
Body (multipart/form-data):{
  "name": "Sunset PG",
  "type": "pg",
  "rent": 10000,
  "gender": "male",
  "description": "Cozy PG near downtown",
  "location_id": 1,
  "amenities": [1, 2, 3],
  "contact": {
    "phone": "+1234567890",
    "email": "owner@example.com",
    "show_to_customers": true
  }
}


Files: photos (min 4, max 10, JPEG/PNG, <5MB)
Response (201):{ "message": "Property created successfully", "property_id": 1 }


Errors:
400: Validation errors, minimum photos
401: Unauthorized
500: Server error




PUT /properties/:id

Description: Update a property (owner only).
Headers: Authorization: Bearer <token>
Body: Same as POST
Files: photos (optional, replaces existing)
Response (200):{ "message": "Property updated successfully" }


Errors:
400: Validation errors
401: Unauthorized
404: Property not found
500: Server error




DELETE /properties/:id

Description: Delete a property (owner only).
Headers: Authorization: Bearer <token>
Response (200):{ "message": "Property deleted successfully" }


Errors:
401: Unauthorized
404: Property not found
500: Server error




GET /properties

Description: List all properties with pagination.
Query:
page: Page number (default: 1)
limit: Items per page (default: 10)


Response (200):{
  "total": 50,
  "pages": 5,
  "properties": [
    {
      "id": 1,
      "name": "Sunset PG",
      "type": "pg",
      "rent": 10000,
      "gender": "male",
      "description": "Cozy PG near downtown",
      "location_id": 1,
      "owner_id": 1,
      "created_at": "2025-05-06T00:00:00Z",
      "Location": { "id": 1, "city": "Mumbai", "latitude": 19.0760, "longitude": 72.8777 },
      "Photos": [{ "id": 1, "url": "/uploads/photo1.jpg" }],
      "Contact": { "phone": "+1234567890", "email": "owner@example.com" },
      "Amenities": [{ "id": 1, "name": "WiFi" }]
    }
  ]
}


Errors:
500: Server error




GET /properties/:id

Description: Get property details by ID.
Response (200): Same as individual property object in GET /properties
Errors:
404: Property not found
500: Server error




GET /properties/search

Description: Search properties by location.
Query:
city: City name (optional)
latitude: Latitude (optional)
longitude: Longitude (optional)
radius: Search radius in km (default: 10)
page: Page number (default: 1)
limit: Items per page (default: 10)


Response (200): Same as GET /properties
Errors:
400: Validation errors
404: No properties found
500: Server error




GET /properties/filter

Description: Filter properties by criteria.
Query:
type: Property type (pg, villa, flat, hostel)
gender: Gender (male, female, coed)
minRent: Minimum rent
maxRent: Maximum rent
amenities: Array of amenity IDs
page: Page number (default: 1)
limit: Items per page (default: 10)


Response (200): Same as GET /properties
Errors:
400: Validation errors
404: No properties found
500: Server error





Photos

POST /photos/:propertyId

Description: Upload photos for a property (owner only).
Headers: Authorization: Bearer <token>
Files: photos (min 4, max 10, JPEG/PNG, <5MB)
Response (201):{ "message": "Photos uploaded successfully" }


Errors:
400: Validation errors, minimum photos
401: Unauthorized
404: Property not found
500: Server error




DELETE /photos/:id

Description: Delete a photo (owner only).
Headers: Authorization: Bearer <token>
Response (200):{ "message": "Photo deleted successfully" }


Errors:
401: Unauthorized
404: Photo not found
500: Server error





Amenities

GET /amenities
Description: List all available amenities.
Response (200):[
  { "id": 1, "name": "WiFi" },
  { "id": 2, "name": "AC" }
]


Errors:
404: No amenities found
500: Server error





Error Handling
The backend implements comprehensive error handling for various scenarios:

Validation Errors: Invalid inputs (e.g., wrong email format, missing fields) return 400 with detailed messages.
Database Errors: Duplicate entries, foreign key violations, and connection issues are caught and logged.
File Upload Errors: Invalid file types, sizes, or counts trigger cleanup and error responses.
Authentication Errors: Invalid/expired JWT or unauthorized access return 401/403.
Unexpected Errors: Caught by a global error handler, logged, and returned as 500 with a generic message.
User-Friendly Responses: Errors are formatted as { error: "message" } or { errors: [{ msg: "message" }] }.

Logging

Winston: Logs API calls, errors, and warnings.
Levels:
Info: Successful operations (e.g., user login, property creation).
Warn: Non-critical issues (e.g., validation failures, unauthorized attempts).
Error: Critical failures (e.g., database errors, file upload issues).


Storage:
Console (development).
Files: logs/error.log (errors), logs/combined.log (all logs).


Details: Logs include timestamps, user IDs, and stack traces for errors.

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.
