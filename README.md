# Datie AI - Modern Dating Matchmaker

A powerful AI-driven matchmaker for dating apps that uses **Gemini embeddings** and **Pinecone vector database** to find highly compatible matches based on personality, interests, and lifestyle. It uses **Google's Gemini AI** to understand the "vibe" of a user's profile (their personality, interests, and lifestyle) by converting their profile into a numerical representation called an "embedding." These embeddings are stored in a Pinecone vector database, which allows for very fast and efficient searching of similar users.

It also ultilize Rule-based Compatibility Filtering which applies a set of rules to filter and rank potential matches based on user preferences like age, gender, relationship goals, and other "deal-breakers."

## Features

- **AI-Powered Matching**: Uses Google's Gemini API to generate semantic embeddings from user profiles
- **Vector Similarity Search**: Leverages Pinecone for fast and accurate similarity matching
- **Smart Compatibility Filtering**: Filters matches based on preferences (age, gender, lifestyle, education)
- **Comprehensive Scoring**: Combines embedding similarity (60%) and preference compatibility (40%)
- **RESTful API**: Simple endpoints to embed users and find matches

## How It Works

### 1. Profile to Vector Conversion

Each user profile (bio, interests, lifestyle, occupation) is converted into a rich text representation, then transformed into a 768-dimensional vector using Gemini's `text-embedding-004` model.

### 2. Vector Storage

All user vectors are stored in Pinecone, a specialized vector database optimized for similarity search.

### 3. Similarity-Based Matching

When finding matches for a user:

1. Generate an embedding for the user's profile
2. Query Pinecone to find the nearest neighbor vectors (cosine similarity)
3. Filter results based on compatibility preferences
4. Calculate a combined score: `60% similarity + 40% compatibility`
5. Return the top matches sorted by overall score

## Prerequisites

- **Node.js** (v18+)
- **Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)
- **Pinecone Account** - [Sign up here](https://app.pinecone.io/)

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=datie-ai-matchmaking
```

### 3. Create Pinecone Index

In your Pinecone dashboard, create a new index with:

- **Name**: `datie-ai-matchmaking` (or your chosen name)
- **Dimensions**: `768`
- **Metric**: `cosine`

### 4. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET `/`

Get API information and available endpoints

**Response:**

```json
{
  "message": "Datie AI - Modern Dating Matchmaking Engine",
  "endpoints": {
    "POST /embed-users": "Embed all user profiles and store in Pinecone",
    "GET /match/:userId": "Find matches for a specific user",
    "GET /users": "Get all users",
    "GET /users/:userId": "Get a specific user"
  }
}
```

### GET `/users`

List all available users

**Response:**

```json
{
  "total": 50,
  "users": [
    {
      "userId": "dc2a5a7b-e91b-4b1a-9c7f-3d6e5a4b1c2d",
      "firstName": "Ethan",
      "age": 29,
      "gender": "Male",
      "location": { "city": "Boulder", "state": "CO" },
      "bio": "Environmental scientist who feels most at home..."
    }
  ]
}
```

### GET `/users/:userId`

Get details for a specific user

**Example:** `GET /users/dc2a5a7b-e91b-4b1a-9c7f-3d6e5a4b1c2d`

### POST `/embed-users`

**Important:** Run this once to initialize the vector database

Embeds all user profiles and stores them in Pinecone.

**Response:**

```json
{
  "message": "Embedding complete",
  "total": 50,
  "success": 50,
  "failed": 0,
  "errors": []
}
```

### GET `/match/:userId?topK=10`

Find matches for a specific user

**Parameters:**

- `userId` (path): The user ID to find matches for
- `topK` (query, optional): Number of matches to return (default: 10)

**Example:** `GET /match/dc2a5a7b-e91b-4b1a-9c7f-3d6e5a4b1c2d?topK=5`

**Response:**

```json
{
  "message": "Matches found!",
  "forUser": {
    "userId": "dc2a5a7b-e91b-4b1a-9c7f-3d6e5a4b1c2d",
    "firstName": "Ethan",
    "age": 29,
    "gender": "Male",
    "location": { "city": "Boulder", "state": "CO" }
  },
  "totalMatches": 5,
  "matches": [
    {
      "userId": "c4d5e6f7-a8b9-4c1d-a2b3-d4e5f6a7b8c9",
      "firstName": "Sophia",
      "age": 30,
      "gender": "Female",
      "location": { "city": "San Diego", "state": "CA" },
      "bio": "Yoga instructor and wellness advocate...",
      "occupation": "Yoga Instructor",
      "interests": ["Yoga", "Meditation", "Beach", "Dogs"],
      "profileImages": ["https://example.com/..."],
      "similarityScore": 0.92,
      "compatibilityScore": 85,
      "overallScore": 89
    }
  ]
}
```

## Testing the System

### Step 1: Embed Users

First, embed all users into Pinecone:

```bash
curl -X POST http://localhost:3000/embed-users
```

This will process all users and store their embeddings in Pinecone (takes ~5-10 seconds).

### Step 2: Find Matches

Get matches for a user (e.g., Ethan):

```bash
curl http://localhost:3000/match/dc2a5a7b-e91b-4b1a-9c7f-3d6e5a4b1c2d?topK=5
```

You'll get the top 5 most compatible matches!

### Step 3: Explore Different Users

List all users to find different userIds:

```bash
curl http://localhost:3000/users
```

Then try matching for different personalities and preferences.

## Matching Algorithm

The matching system uses a two-stage approach:

### Stage 1: AI Similarity (60% weight)

- Converts profiles to semantic embeddings using Gemini
- Finds nearest neighbors using cosine similarity in Pinecone
- Captures personality "vibe" and lifestyle compatibility

### Stage 2: Preference Compatibility (40% weight)

- **Age Range**: Must fall within both users' preferences
- **Gender Preference**: Must match what each is looking for
- **Smoking/Drinking**: Respects deal-breakers
- **Children**: Aligns family goals
- **Education**: Matches education preferences
- **Pets**: Respects "must love dogs/cats" preferences
- **Shared Interests**: Bonus points for common hobbies

### Final Score

```
Overall Score = (Similarity × 0.6 × 100) + (Compatibility × 0.4)
```

## Project Structure

```
datie-ai/
├── src/
│   ├── data/
│   │   └── users.json              # Sample user profiles
│   ├── services/
│   │   ├── embedding.ts            # Gemini embedding service
│   │   ├── pinecone.ts             # Pinecone client setup
│   │   └── matchmaking.ts          # Core matching logic
│   ├── utils/
│   │   ├── profileToText.ts        # Profile to text conversion
│   │   └── compatibility.ts        # Compatibility checking
│   └── index.ts                    # Main API server
├── .env.example                    # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Key Functions

### `profileToText(user: User): string`

Converts a user profile into rich text that captures their personality, interests, and preferences.

### `getEmbedding(text: string): Promise<number[]>`

Generates a 768-dimensional embedding vector using Gemini's text-embedding-004 model.

### `embedUser(user: User): Promise<void>`

Embeds a single user and stores in Pinecone with metadata.

### `getCompatibilityScore(user1: User, user2: User): number`

Calculates a 0-100 compatibility score based on preferences and shared interests.

### `findMatches(userId: string, allUsers: User[], topK: number): Promise<Match[]>`

Main matching function that combines AI similarity with preference compatibility.



## 🌍 Production Considerations

1. **Rate Limiting**: Add rate limiting to embedding endpoints
2. **Caching**: Cache embeddings to avoid re-computing
3. **Batch Processing**: Process embeddings in background jobs
4. **Monitoring**: Add logging and error tracking
5. **Security**: Add authentication and authorization
6. **Pagination**: Implement pagination for large result sets
7. **Distance Filtering**: Add geographic distance filtering
8. **Real-time Updates**: Webhook for profile updates

## 📚 Technologies Used

- **[Hono](https://hono.dev/)**: Fast, lightweight web framework
- **[Google Gemini](https://ai.google.dev/)**: Advanced AI embeddings
- **[Pinecone](https://www.pinecone.io/)**: Vector database for similarity search
- **TypeScript**: Type-safe development
- **Node.js**: Runtime environment
