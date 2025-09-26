# Station MKT - AI Marketing Concept Generator

A modern web application that generates AI-powered marketing concepts based on detailed audience demographics. Built with Next.js, Supabase, and OpenAI.

## ✨ Features

- **Audience Management**: Create detailed audience profiles with demographics, interests, and behaviors
- **AI Concept Generation**: Generate marketing concepts using OpenAI GPT-3.5-turbo
- **Multi-Audience Targeting**: Select multiple audiences for comprehensive campaign strategies
- **Concept Remixing**: Create variations of existing concepts with custom instructions
- **Audience Snapshots**: Preserve audience data even when original audiences are deleted
- **User Authentication**: Secure email/password authentication with user isolation
- **User Isolation**: Secure user accounts with completely isolated data
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd station-mkt
npm install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### 3. Supabase Setup

#### Option A: Using Supabase Dashboard
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your URL and anon key
3. Go to SQL Editor and run the migration files in order:
   - `supabase/migrations/20250926164149_create_audiences_and_concepts.sql`
   - `supabase/migrations/20250926164723_add_user_relations.sql` 
   - `supabase/migrations/20250926180331_update_concepts_with_audience_snapshots.sql`

#### Option B: Using Supabase CLI
```bash
# Install CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 4. OpenAI Setup

1. Create an account at [OpenAI Platform](https://platform.openai.com)
2. Generate an API key from the API keys section
3. Add the key to your `.env.local` file

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: After logging in, you'll be redirected to the Audiences page to start creating your target audiences.

## 📊 Database Schema

### Core Tables

- **`users`**: User profiles (auto-created from auth.users)
- **`audiences`**: Audience definitions with demographics stored as JSONB
- **`marketing_concepts`**: AI-generated concepts with audience snapshots

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Audience Snapshots**: Full audience data preserved in concepts for deletion safety
- **Auto User Creation**: User profiles created automatically on signup

## 🏗️ Architecture

### Frontend (Next.js 15 + App Router)
- **Pages**: Authentication, Dashboard, Audiences, Concepts
- **Components**: Modular UI with shadcn/ui
- **State Management**: React hooks + Supabase real-time

### Backend (Supabase)
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: Email/password with JWT tokens
- **Storage**: User data isolated with RLS policies

### AI Integration (OpenAI)
- **Model**: GPT-3.5-turbo for cost-effective generation
- **Features**: Concept generation, remixing, robust JSON parsing
- **Fallbacks**: Graceful error handling with backup responses

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:types     # Generate TypeScript types from Supabase
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── audiences/         # Audience management
│   └── concepts/          # Concept generation & management
├── components/            # React components
│   ├── audiences/         # Audience-specific components
│   ├── auth/              # Authentication components
│   ├── concepts/          # Concept-specific components
│   ├── navigation/        # Navigation components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase client configuration
│   ├── audiences.ts       # Audience CRUD operations
│   ├── marketing-concepts.ts # Concept CRUD operations
│   ├── openai.ts          # OpenAI integration
│   └── db-utils.ts        # Database utilities
├── providers/             # React context providers
└── types/                 # TypeScript type definitions
```

## 🎯 Usage Guide

### Creating Audiences
1. Go to **Audiences** page
2. Click **"Create New Audience"**
3. Fill in detailed demographics:
   - Basic info (name, age, gender, location)
   - Interests and hobbies
   - Shopping behaviors
   - Pain points and aspirations
   - Technology usage
   - Favorite brands

### Generating Concepts
1. Go to **Concepts** page
2. Click **"Generate New Concept"**
3. Select one or more target audiences
4. Choose campaign type and tone
5. Add any specific context or requirements
6. Click **"Generate Marketing Concept"**
7. Review and save the generated concept

### Remixing Concepts
1. Find any existing concept
2. Click the **"Remix"** button
3. Add specific remix instructions
4. Generate a new variation
5. Save the remixed concept

## 🔒 Security Features

- **Authentication**: Secure email/password authentication via Supabase Auth
- **Authorization**: Row Level Security (RLS) ensures data isolation
- **Data Protection**: User data is completely isolated between accounts
- **API Security**: OpenAI API key handled securely (consider server-side for production)

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
npm run build
```
Deploy to Vercel and add environment variables in the dashboard.

### Other Platforms
Ensure environment variables are set and run:
```bash
npm run build
npm start
```

## 🛠️ Development Tips

### Type Safety
- Run `npm run db:types` after schema changes
- All database operations are fully typed
- Use the `DatabaseResponse<T>` type for consistent error handling

### Adding New Features
- Follow the established patterns in `/lib` for data operations
- Use shadcn/ui components for consistency
- Implement proper error handling and loading states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to ensure code quality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using Next.js, Supabase, and OpenAI**