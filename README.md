# Literaq - AI Research Assistant

A production-ready MVP for chatting with research papers using AI. Built with Next.js, Vercel Postgres (with pgvector), and OpenAI.

🌐 **Domain**: [literaq.com](https://literaq.com)

## Features

- 📄 **PDF Upload** - Drag and drop research papers for instant processing
- 🤖 **AI Chat Interface** - Ask questions and get answers grounded in the paper
- 🔍 **Semantic Search** - Vector-based retrieval using pgvector for accurate context
- 📊 **PDF Viewer** - Read the paper alongside your chat conversation
- 🔐 **Authentication** - Secure sign-in/sign-up with Clerk
- 💳 **Subscriptions** - Flexible pricing plans with Stripe integration
- 📊 **Usage Limits** - Free (3 papers), Basic (50 papers), Pro (unlimited)
- ⚡ **Edge-Ready** - Optimized for Vercel deployment

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Vercel Postgres with pgvector extension
- **AI**: OpenAI (GPT-4 + text-embedding-3-small)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Storage**: Vercel Blob
- **UI**: Tailwind CSS + Lucide Icons
- **ORM**: Prisma

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Clerk account (for authentication)
- Stripe account (for payments)
- Vercel account (for deployment and Postgres database)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Vercel Postgres (get these from your Vercel project dashboard)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Vercel Blob (optional for local development)
BLOB_READ_WRITE_TOKEN=
```

### 3. Set Up the Database

First, create a Postgres database on Vercel:

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection strings to your `.env` file

Then, set up the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables and enables pgvector)
npx prisma db push
```

**Note**: The first migration will enable the `vector` extension in PostgreSQL. If you encounter any issues, you may need to manually enable it:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment to Vercel

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" and import your GitHub repository
3. Vercel will automatically detect Next.js configuration

### 3. Set Up Vercel Postgres

1. In your Vercel project dashboard, go to Storage
2. Create a new Postgres database
3. The environment variables will be automatically added to your project

### 4. Set Up Vercel Blob (Optional)

1. In your Vercel project dashboard, go to Storage
2. Create a new Blob store
3. The `BLOB_READ_WRITE_TOKEN` will be automatically added

### 5. Add OpenAI API Key

1. Go to Project Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI API key

### 6. Deploy

Your app will automatically deploy. On first deployment, Prisma will:
- Generate the client
- Push the schema to your database
- Enable pgvector extension

## How It Works

### PDF Processing Pipeline

1. User uploads a PDF
2. Text is extracted using `pdf-parse`
3. Text is chunked into ~1000 token segments with overlap
4. Each chunk is embedded using OpenAI's `text-embedding-3-small`
5. Embeddings are stored in Postgres with pgvector

### Chat Pipeline (RAG)

1. User asks a question
2. Question is embedded using the same model
3. Semantic search finds top-k similar chunks using pgvector
4. Retrieved chunks are sent to GPT-4 as context
5. GPT-4 generates an answer grounded in the paper content

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── papers/
│   │   │       ├── upload/          # PDF upload endpoint
│   │   │       └── [paperId]/
│   │   │           ├── chat/        # Chat endpoint
│   │   │           ├── messages/    # Get messages
│   │   │           └── route.ts     # Get paper details
│   │   ├── papers/[paperId]/        # Paper detail page
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── ChatPanel.tsx            # Chat UI component
│   │   └── PDFViewer.tsx            # PDF viewer component
│   └── lib/
│       ├── chunking.ts              # Text chunking logic
│       ├── db.ts                    # Prisma client
│       ├── openai.ts                # OpenAI API calls
│       ├── pdf-processor.ts         # PDF text extraction
│       └── vector-search.ts         # Semantic search with pgvector
├── prisma/
│   └── schema.prisma                # Database schema
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Database Schema

- **Paper**: Stores PDF metadata and processing status
- **PaperChunk**: Text chunks with embeddings (vector type)
- **ChatSession**: Chat sessions linked to papers
- **ChatMessage**: Individual messages in conversations

## API Endpoints

### `POST /api/papers/upload`
Upload and process a PDF file.

**Request**: multipart/form-data with `file` field
**Response**: `{ paperId, title, chunksCount, status }`

### `POST /api/papers/[paperId]/chat`
Send a message and get an AI response.

**Request**: `{ chatSessionId?, question }`
**Response**: `{ chatSessionId, answer, sourceChunks }`

### `GET /api/papers/[paperId]`
Get paper details and metadata.

**Response**: Paper object with status

### `GET /api/papers/[paperId]/messages`
Get all messages for a chat session.

**Query**: `chatSessionId`
**Response**: `{ messages }`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `POSTGRES_URL` | Postgres connection string | Yes |
| `POSTGRES_PRISMA_URL` | Prisma connection string | Yes |
| `POSTGRES_URL_NON_POOLING` | Direct connection string | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | Optional |

## Troubleshooting

### "vector type not found"
Enable the pgvector extension manually:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### PDF upload fails
- Check file size (max 10MB)
- Ensure file is a valid PDF
- Check OpenAI API quota

### Embeddings not working
- Verify `OPENAI_API_KEY` is set
- Check OpenAI API limits and billing

### Database connection issues
- Verify all Postgres env vars are set
- Check Vercel Postgres status
- Ensure connection pooling is configured

## Performance Considerations

- **Chunking**: ~1000 tokens per chunk with 150 token overlap
- **Embedding**: Batched in groups of 20 to avoid rate limits
- **Search**: Returns top 6 most similar chunks
- **Model**: Using GPT-4 Turbo for chat (faster, cheaper)

## Future Enhancements

- [ ] User authentication
- [ ] Multiple paper support per user
- [ ] Citation highlighting in PDF
- [ ] Export chat conversations
- [ ] Support for more document formats
- [ ] Paper summarization
- [ ] Comparative analysis across papers

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
