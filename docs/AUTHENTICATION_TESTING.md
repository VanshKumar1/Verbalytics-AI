# Authentication System Testing Guide

This guide provides comprehensive testing instructions for the Verbalytics AI authentication system using Postman or similar API testing tools.

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "TestPass123",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "skillLevel": "beginner",
    "goals": ["debate", "interview"]
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "testuser123",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "profile": {
        "bio": "",
        "avatar": "",
        "goals": ["debate", "interview"],
        "skillLevel": "beginner"
      },
      "statistics": {
        "totalSessions": 0,
        "averageLogicScore": 0,
        "averageClarityScore": 0,
        "averageRelevanceScore": 0,
        "lastActiveDate": "2023-09-06T12:00:00.000Z"
      },
      "preferences": {
        "notifications": {
          "email": true,
          "progress": true
        },
        "theme": "light"
      },
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2023-09-06T12:00:00.000Z",
      "updatedAt": "2023-09-06T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Validation errors or user already exists
- `500` - Server error

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "identifier": "test@example.com", // Can be email or username
  "password": "TestPass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "testuser123",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "profile": {
        "bio": "",
        "avatar": "",
        "goals": ["debate", "interview"],
        "skillLevel": "beginner"
      },
      "statistics": {
        "totalSessions": 0,
        "averageLogicScore": 0,
        "averageClarityScore": 0,
        "averageRelevanceScore": 0,
        "lastActiveDate": "2023-09-06T12:00:00.000Z"
      },
      "preferences": {
        "notifications": {
          "email": true,
          "progress": true
        },
        "theme": "light"
      },
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2023-09-06T12:00:00.000Z",
      "updatedAt": "2023-09-06T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - Invalid credentials or account deactivated
- `500` - Server error

### 3. Get User Profile
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "testuser123",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "profile": {
        "bio": "",
        "avatar": "",
        "goals": ["debate", "interview"],
        "skillLevel": "beginner"
      },
      "statistics": {
        "totalSessions": 0,
        "averageLogicScore": 0,
        "averageClarityScore": 0,
        "averageRelevanceScore": 0,
        "lastActiveDate": "2023-09-06T12:00:00.000Z"
      },
      "preferences": {
        "notifications": {
          "email": true,
          "progress": true
        },
        "theme": "light"
      },
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2023-09-06T12:00:00.000Z",
      "updatedAt": "2023-09-06T12:00:00.000Z"
    }
  }
}
```

### 4. Update User Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John Updated",
  "profile": {
    "bio": "I love debating and practicing interviews!",
    "skillLevel": "intermediate",
    "goals": ["debate", "interview", "public_speaking"]
  },
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": false
    }
  }
}
```

### 5. Change Password
**PUT** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "TestPass123",
  "newPassword": "NewTestPass123"
}
```

### 6. Refresh Token
**POST** `/auth/refresh`

**Note:** This endpoint uses the refresh token from HTTP-only cookie.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 7. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 8. Request Password Reset
**POST** `/auth/request-password-reset`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

### 9. Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "abc123def456...",
  "newPassword": "NewPassword123"
}
```

### 10. Get User Statistics
**GET** `/user/stats`

**Headers:**
```
Authorization: Bearer <token>
```

### 11. Update User Statistics
**PUT** `/user/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "logicScore": 8,
  "clarityScore": 7,
  "relevanceScore": 9
}
```

## Testing Checklist

### Registration Testing
- [ ] Register with valid data
- [ ] Register with duplicate email
- [ ] Register with duplicate username
- [ ] Register with invalid email format
- [ ] Register with weak password
- [ ] Register with missing required fields

### Login Testing
- [ ] Login with valid credentials (email)
- [ ] Login with valid credentials (username)
- [ ] Login with invalid password
- [ ] Login with non-existent user
- [ ] Login with deactivated account

### Profile Management Testing
- [ ] Get profile without token
- [ ] Get profile with valid token
- [ ] Get profile with expired token
- [ ] Update profile with valid data
- [ ] Update profile with invalid data
- [ ] Change password with correct current password
- [ ] Change password with wrong current password

### Token Management Testing
- [ ] Refresh token with valid refresh token
- [ ] Refresh token with invalid refresh token
- [ ] Access protected route without token
- [ ] Access protected route with expired token
- [ ] Logout successfully

### Error Handling Testing
- [ ] Test validation error responses
- [ ] Test server error responses
- [ ] Test unauthorized access responses
- [ ] Test not found responses

## Postman Collection Setup

1. Create a new collection named "Verbalytics AI Auth"
2. Set collection variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (will be set after login)
3. Create requests for each endpoint
4. Use pre-request scripts for authentication:
   ```javascript
   if (pm.collectionVariables.get('token')) {
     pm.request.headers.add({
       key: 'Authorization',
       value: 'Bearer ' + pm.collectionVariables.get('token')
     });
   }
   ```
5. Use test scripts to save tokens:
   ```javascript
   if (pm.response.code === 200) {
     const response = pm.response.json();
     if (response.data && response.data.token) {
       pm.collectionVariables.set('token', response.data.token);
     }
   }
   ```

## Security Testing Notes

- Test for SQL injection (though using MongoDB)
- Test for XSS in profile fields
- Test for rate limiting
- Test for password strength requirements
- Test for proper password hashing
- Test for secure token handling
- Test for CORS configuration
- Test for proper error messages (don't leak sensitive info)
