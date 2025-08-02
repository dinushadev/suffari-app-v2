# Saffari-Raahi App v2 Backend/API Task List

## Project Overview
This project is a booking platform for resources (such as vehicles or rooms) at various locations. Users can browse locations, view details, check availability, and make bookings.

---

## API Task List

1. **GET /api/locations**  
   List all locations with optional filters.

2. **GET /api/locations/:id**  
   Fetch details and resources for a specific location.

3. **GET /api/locations/:id/availability?date=YYYY-MM-DD**  
   Fetch available slots for a location on a given date.

4. **POST /api/bookings**  
   Create a new booking (user, location, resource, date, time slot).

5. **GET /api/bookings/:id**  
   Fetch booking details by booking ID.

6. **GET /api/resource-types**  
   List all resource/vehicle types.

7. **GET /api/users/:id/bookings**  
   Fetch all bookings for a user.

8. **Document all API endpoints and backend setup in this README.**

---

## API Endpoint Specifications

### 1. GET /api/locations
- **Description:** List all locations (optionally filterable)
- **Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "imageUrl": "string",
    "description": "string"
  }
]
```

### 2. GET /api/locations/:id
- **Description:** Get details and resources for a specific location
- **Response:**
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "description": "string",
  "imageUrl": "string",
  "resources": [
    {
      "id": "string",
      "type": "string",
      "availability": [
        {
          "date": "YYYY-MM-DD",
          "slots": ["09:00", "10:00", ...]
        }
      ]
    }
  ]
}
```

### 3. GET /api/locations/:id/availability?date=YYYY-MM-DD
- **Description:** Get available slots for a location on a given date
- **Response:**
```json
{
  "date": "YYYY-MM-DD",
  "availableSlots": ["09:00", "10:00", ...]
}
```

### 4. POST /api/bookings
- **Description:** Create a new booking
- **Request:**
```json
{
  "userId": "string",
  "locationId": "string",
  "resourceId": "string",
  "date": "YYYY-MM-DD",
  "timeSlot": "string",
  "pickupLocation": "string"
}
```
- **Response:**
```json
{
  "bookingId": "string",
  "status": "confirmed",
  "details": {
    "location": { /* ... */ },
    "resource": { /* ... */ },
    "date": "YYYY-MM-DD",
    "timeSlot": "string"
  }
}
```

### 5. GET /api/bookings/:id
- **Description:** Get booking details by ID
- **Response:**
```json
{
  "bookingId": "string",
  "status": "confirmed",
  "details": { /* ... */ }
}
```

### 6. GET /api/resource-types
- **Description:** List all resource/vehicle types
- **Response:**
```json
[
  { "id": "string", "name": "string" }
]
```

### 7. GET /api/users/:id/bookings
- **Description:** Get all bookings for a user
- **Response:** 
```json
[
  { "bookingId": "string", "status": "string", /* ... */ }
]
```

---

## Backend Recommendations
- Use Express.js, Fastify, or Next.js API routes for backend implementation.
- Use MongoDB or PostgreSQL for data storage.
- Validate requests with Joi or zod.
- Secure endpoints with authentication (JWT or session-based).
- Implement error handling and rate limiting.