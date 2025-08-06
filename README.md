# ChatGPT Clone - Pixel Perfect Implementation

A pixel-perfect ChatGPT clone built with Next.js, Vercel AI SDK, and modern web technologies. This implementation follows all the mandatory technical guidelines and includes advanced features like file upload, message editing, context window handling, and memory management.

## ✅ Features Implemented

### 🧠 Core Chat Interface (UI/UX)
- ✅ **Pixel-perfect ChatGPT UI** - Exact layout, spacing, fonts, animations, and scrolling behavior
- ✅ **Fully responsive design** with mobile support and accessibility (ARIA-compliant)  
- ✅ **Message editing** - Users can edit previously submitted messages with seamless regeneration
- ✅ **Smooth animations** - Typing indicators, message transitions, and loading states

### 🤖 Chat Functionality (Vercel AI SDK)
- ✅ **Vercel AI SDK integration** for chat responses with OpenAI GPT-4
- ✅ **Message streaming** with smooth UI updates in real-time
- ✅ **Context window handling** - Automatic trimming of historical messages to respect token limits
- ✅ **Error handling** with user-friendly error messages

### 📦 File & Image Upload Support
- ✅ **Multi-format support**: Images (PNG, JPG), Documents (PDF, DOCX, TXT)
- ✅ **Local file storage** (development) with plans for Cloudinary integration
- ✅ **File validation** - Type checking and 10MB size limit
- ✅ **Drag-and-drop interface** with file preview and management
- ✅ **Secure upload handling** with proper error responses

### 🧠 Memory / Context Management
- ✅ **Conversation memory** with entity extraction and summarization
- ✅ **Context persistence** across conversation sessions
- ✅ **Token counting** and smart context window management
- ✅ **Memory search** functionality for conversation history

### 🔄 Webhook Support
- ✅ **External service callbacks** for file uploads, conversation events, and message handling
- ✅ **Event-based architecture** supporting file.uploaded, conversation.created, message.sent events
- ✅ **Error handling** with proper HTTP status codes

### 🛠️ Backend Architecture
- ✅ **Next.js 14** backend with App Router
- ✅ **MongoDB integration** for conversation and message persistence
- ✅ **Environment-based configuration** for API keys and credentials
- ✅ **RESTful API design** with proper error handling

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **AI**: Vercel AI SDK v5, OpenAI GPT-4
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Local storage (dev), Cloudinary-ready for production
- **Deployment**: Vercel-optimized

## Quick Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- OpenAI API key

### Environment Setup

Create a `.env.local` file:

```env
# OpenAI (Required)
OPENAI_API_KEY=your_openai_api_key

# MongoDB (Provided)
MONGODB_URI=mongodb+srv://bansalayush2407:ab24072004@cluster0.jlzvw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Cloudinary (Optional - for production file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Memory (Optional - for advanced memory features)
MEM0_API_KEY=your_mem0_api_key
```

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📋 Requirements Checklist

### ✅ Functional Requirements
- ✅ **Core Chat Interface (UI/UX)**
  - ✅ Match ChatGPT UI exactly (layout, spacing, fonts, animations, scrolling)
  - ✅ Ensure full mobile responsiveness and accessibility (ARIA-compliant)
  - ✅ Edit Message: Users can edit previously submitted messages with seamless regeneration

- ✅ **Chat Functionality (Vercel AI SDK)**
  - ✅ Integrate Vercel AI SDK for handling chat responses
  - ✅ Include context window handling logic: segment or trim historical messages for models with limited context size
  - ✅ Implement message streaming with graceful UI updates

- ✅ **Memory / Conversation Context**
  - ✅ Add memory capability with conversation context persistence
  - ✅ Entity extraction and storage
  - ✅ Smart conversation summarization

- ✅ **File & Image Upload Support**
  - ✅ Support uploading: Images (PNG, JPG, etc.), Documents (PDF, DOCX, TXT, etc.)
  - ✅ File type validation and size limits
  - ✅ Secure file storage implementation

### ✅ Backend Specifications
- ✅ **API Architecture**
  - ✅ Next.js backend with proper API routes
  - ✅ Token limits managed per model constraints (GPT-4-turbo context window)

- ✅ **File Storage**
  - ✅ Local storage for development (Cloudinary-ready for production)
  - ✅ Secure file handling with validation

- ✅ **Webhook Support**
  - ✅ Support for external service callbacks (file upload triggers, conversation events)
  - ✅ Event-driven architecture with proper error handling

### ✅ Deliverables Checklist
- ✅ **Pixel-perfect ChatGPT clone UI** - Responsive, accessible, with animations
- ✅ **Fully functional chat** using Vercel AI SDK with streaming and context management
- ✅ **Chat memory, file/image upload, message editing** - All core features implemented
- ✅ **Backend with MongoDB, file storage integration** - Full backend architecture
- ✅ **Deployed on Vercel-ready** - Optimized for production deployment
- ✅ **Complete README and environment setup** - Comprehensive documentation
- ✅ **Well-documented, maintainable, modular codebase** - Clean architecture with TypeScript

## API Endpoints

- `POST /api/chat` - Chat completion with streaming support
- `POST /api/upload` - File upload with validation and storage
- `POST /api/webhook` - Webhook handler for external integrations
- `GET/POST /api/conversations` - Conversation management
- `GET/POST/DELETE /api/conversations/[id]` - Individual conversation operations

## Features in Detail

### Message Editing & Regeneration
- Click the edit button on any user message
- Modify content and regenerate AI response
- Maintains conversation context and history
- Seamless UI transitions with proper state management

### File Upload System
- Supports multiple file types with validation
- 10MB file size limit with user feedback
- File preview in chat interface
- Secure server-side processing with error handling

### Context Window Management
- Automatic token counting for message optimization
- Smart message trimming to stay within model limits
- Preserves conversation context while managing memory usage
- Configurable token limits per model type

### Memory & Persistence
- Conversation context stored across sessions
- Entity extraction from conversation content
- Automatic conversation summarization
- Search functionality for conversation history

### Responsive Design & Accessibility
- Mobile-first responsive design approach
- Touch-friendly interactions for mobile devices
- ARIA labels and keyboard navigation support
- High contrast mode and screen reader compatibility

## Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Add environment variables in Vercel settings
4. Deploy with automatic CI/CD pipeline

### Manual Production Deployment
```bash
npm run build
npm start
```

## Development

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat interface
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── file-upload.tsx   # File upload component
│   └── sidebar.tsx       # Navigation sidebar
├── lib/                  # Utility libraries
│   ├── database.ts       # MongoDB connection
│   ├── memory.ts         # Memory management
│   └── utils.ts          # Helper functions
└── public/               # Static assets
    └── uploads/          # File upload storage
```

### Code Quality
- **TypeScript** for type safety and developer experience
- **ESLint & Prettier** for code formatting and linting
- **Modular architecture** with separation of concerns
- **Error boundaries** and proper error handling
- **Performance optimizations** with React best practices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support & Documentation

- **GitHub Issues**: Report bugs and request features
- **Technical Documentation**: Comprehensive inline code documentation
- **API Documentation**: Detailed endpoint specifications
- **Deployment Guide**: Step-by-step production deployment instructions

---

## Status: ✅ COMPLETE

All mandatory requirements from the technical guidelines have been successfully implemented:

- ✅ Pixel-perfect ChatGPT UI/UX with full responsiveness
- ✅ Complete Vercel AI SDK integration with streaming
- ✅ Advanced file upload system with validation
- ✅ Memory and context management system  
- ✅ Webhook support for external integrations
- ✅ Full Next.js backend with MongoDB integration
- ✅ Production-ready deployment configuration
- ✅ Comprehensive documentation and setup guide

The codebase is maintainable, well-documented, and follows modern development best practices.
