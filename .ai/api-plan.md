# REST API Plan

## 1. Resources

- **Users**: User profiles and authentication
- **Conversations**: Chat conversations and message history
- **Messages**: Individual chat messages within conversations
- **Files**: File uploads and attachments processing
- **Usage**: API usage tracking and cost monitoring
- **Audio**: Voice input processing and transcription

## 2. Endpoints

### Authentication Resource

#### POST /auth/login

- **Description**: Authenticate user with credentials
- **Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

- **Response Body**:

```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string"
    }
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid credentials
  - 400 Bad Request - Missing required fields
  - 429 Too Many Requests - Rate limit exceeded

#### POST /auth/logout

- **Description**: Invalidate user session
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized - Invalid token

#### GET /auth/me

- **Description**: Get current user information
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "string|null"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized - Invalid token

### Users Resource

#### GET /users/profile

- **Description**: Get user profile
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "string|null",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized - Invalid token

#### PUT /users/profile

- **Description**: Update user profile
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:

```json
{
  "name": "string",
  "email": "string"
}
```

- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "string|null"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 400 Bad Request - Invalid email format
  - 409 Conflict - Email already exists

#### POST /users/profile/avatar

- **Description**: Upload user avatar image
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **Request Body**: FormData with 'avatar' file field
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "avatar": "string"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 400 Bad Request - Invalid file type or size
  - 413 Payload Too Large - File exceeds 10MB limit

#### DELETE /users/profile/avatar

- **Description**: Remove user avatar image
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "message": "Avatar removed successfully"
}
```

- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized - Invalid token

### Conversations Resource

#### GET /conversations

- **Description**: Get user's conversations list
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `limit` (optional): number, default 20
  - `offset` (optional): number, default 0
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "string",
        "title": "string",
        "lastMessage": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number"
    }
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized - Invalid token

#### POST /conversations

- **Description**: Create new conversation
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:

```json
{
  "title": "string"
}
```

- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "createdAt": "string"
  }
}
```

- **Success Codes**: 201 Created
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 400 Bad Request - Missing title

#### GET /conversations/{id}

- **Description**: Get conversation with messages
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `limit` (optional): number, default 50
  - `before` (optional): string, message ID for pagination
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "messages": [
      {
        "id": "string",
        "role": "user|assistant",
        "content": "string",
        "attachments": [
          {
            "id": "string",
            "filename": "string",
            "type": "string",
            "url": "string"
          }
        ],
        "createdAt": "string"
      }
    ],
    "hasMore": "boolean"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 404 Not Found - Conversation not found
  - 403 Forbidden - Access denied

#### DELETE /conversations/{id}

- **Description**: Delete conversation
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 404 Not Found - Conversation not found
  - 403 Forbidden - Access denied

### Messages Resource

#### POST /conversations/{conversationId}/messages

- **Description**: Send message with streaming response
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: text/event-stream` (for streaming)
- **Request Body**:

```json
{
  "content": "string",
  "attachments": ["string"], // Array of file IDs
  "maxTokens": "number"
}
```

- **Response Body** (Streaming SSE):

```
data: {"type": "token", "content": "Hello"}
data: {"type": "token", "content": " world"}
data: {"type": "done", "messageId": "abc123", "usage": {"tokens": 10, "cost": 0.001}}
```

- **Response Body** (Non-streaming):

```json
{
  "success": true,
  "data": {
    "id": "string",
    "role": "assistant",
    "content": "string",
    "usage": {
      "promptTokens": "number",
      "completionTokens": "number",
      "totalTokens": "number",
      "estimatedCost": "number"
    },
    "createdAt": "string"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 400 Bad Request - Message too long (>5000 chars)
  - 404 Not Found - Conversation not found
  - 429 Too Many Requests - Rate limit exceeded
  - 413 Payload Too Large - Attachments exceed 30MB total

#### POST /conversations/{conversationId}/messages/{messageId}/retry

- **Description**: Retry generating response for a message
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**: Same as POST /messages endpoint
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 404 Not Found - Message or conversation not found
  - 403 Forbidden - Access denied

#### POST /conversations/{conversationId}/messages/stop

- **Description**: Stop current message generation
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "message": "Generation stopped successfully"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 404 Not Found - No active generation

### Files Resource

#### POST /files/upload

- **Description**: Upload file for attachment
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **Request Body**: FormData with file field and metadata
- **Query Parameters**:
  - `type`: string (image|document|audio)
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "filename": "string",
    "originalName": "string",
    "mimeType": "string",
    "size": "number",
    "url": "string",
    "processedContent": "string|null", // Extracted text for PDFs
    "metadata": {
      "width": "number", // For images
      "height": "number", // For images
      "pages": "number" // For PDFs
    }
  }
}
```

- **Success Codes**: 201 Created
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 400 Bad Request - Invalid file type
  - 413 Payload Too Large - File exceeds 10MB
  - 422 Unprocessable Entity - File processing failed

#### GET /files/{id}

- **Description**: Get file metadata and processed content
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "filename": "string",
    "originalName": "string",
    "mimeType": "string",
    "size": "number",
    "url": "string",
    "processedContent": "string|null",
    "createdAt": "string"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 404 Not Found - File not found
  - 403 Forbidden - Access denied

#### DELETE /files/{id}

- **Description**: Delete uploaded file
- **Headers**: `Authorization: Bearer {token}`
- **Response Body**:

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 404 Not Found - File not found
  - 403 Forbidden - Access denied

### Audio Resource

#### POST /audio/transcribe

- **Description**: Transcribe audio to text using local STT
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **Request Body**: FormData with audio file
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "transcription": "string",
    "confidence": "number",
    "language": "string",
    "duration": "number"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 400 Bad Request - Invalid audio format
  - 413 Payload Too Large - Audio too long (>60s)
  - 422 Unprocessable Entity - Transcription failed

### Usage Resource

#### GET /usage/current

- **Description**: Get current usage statistics
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `period` (optional): string (day|week|month), default month
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "period": "string",
    "totalTokens": "number",
    "totalRequests": "number",
    "estimatedCost": "number",
    "limit": "number",
    "remaining": "number",
    "resetDate": "string"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized - Invalid token

#### POST /usage/track

- **Description**: Track API usage (internal endpoint)
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:

```json
{
  "tokens": "number",
  "operation": "string",
  "model": "string",
  "cost": "number"
}
```

- **Response Body**:

```json
{
  "success": true,
  "data": {
    "totalTokens": "number",
    "estimatedCost": "number"
  }
}
```

- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Invalid token
  - 400 Bad Request - Invalid usage data

## 3. Authentication and Authorization

### JWT-Based Authentication

- **Token Type**: Bearer JWT tokens
- **Token Expiration**: 24 hours for access tokens
- **Token Storage**: Client-side in SecureStore (React Native)
- **Headers**: All authenticated endpoints require `Authorization: Bearer {token}` header

### Mock Authentication (MVP)

- **Hardcoded Credentials**: test@example.com / password123
- **Token Generation**: JWT signed with app secret
- **Session Persistence**: Token stored in SecureStore for auto-login

### Authorization Rules

- Users can only access their own data (conversations, messages, files, profile)
- No admin or role-based access in MVP
- Rate limiting applied per user: 100 requests per minute

## 4. Validation and Business Logic

### Message Validation

- **Content Length**: Maximum 5000 characters
- **Attachment Limits**:
  - Maximum 5 files per message
  - Maximum 10MB per file
  - Maximum 30MB total per message
- **Supported File Types**:
  - Images: JPEG, PNG
  - Documents: PDF, MD, TXT

### File Processing Logic

- **Image Processing**:
  - Resize to maximum 1600px on longest side
  - Compress with 0.8 quality
  - Remove EXIF data for privacy
- **PDF Processing**:
  - Extract text content
  - Maximum 50 pages or 50,000 characters
  - Handle scan-only PDFs with appropriate error messages
- **Text Files**:
  - Validate UTF-8 encoding
  - Maximum 50,000 characters

### Cost and Usage Logic

- **Token Tracking**: Track prompt and completion tokens separately
- **Cost Estimation**: Based on GPT-4o-mini pricing
- **Monthly Limits**: $15 USD monthly budget with warnings at 80%
- **Rate Limiting**: 100 API calls per minute per user

### Context Management

- **Soft Token Limit**: 8000 tokens for conversation context
- **Context Trimming**: Remove oldest messages when approaching limit
- **Context Summarization**: Summarize removed context for continuity

### Error Handling

- **Retry Logic**: Automatic retry for 429, 5xx, timeout errors with exponential backoff
- **Graceful Degradation**: Fallback to text input when voice features fail
- **Network Detection**: Detect offline state and queue requests
- **User-Friendly Messages**: Convert technical errors to actionable user messages

### Security Measures

- **Input Sanitization**: Validate and sanitize all user inputs
- **File Type Validation**: Strict MIME type checking for uploads
- **Size Limits**: Enforce file size limits before processing
- **Rate Limiting**: Prevent abuse with request rate limits
- **CORS**: Configure appropriate CORS policies for mobile clients
