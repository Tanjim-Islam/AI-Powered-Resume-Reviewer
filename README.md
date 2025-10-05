# AI-Powered Resume Reviewer

A modern Next.js application that provides AI-powered resume analysis, ATS scoring, and resume rewriting capabilities.

## Features

- **ATS Score Analysis**: Get detailed ATS friendliness scores with specific improvement areas
- **Keyword Matching**: Compare your resume against job descriptions for optimal keyword matching
- **AI-Powered Rewriting**: Get completely rewritten resumes with improved content and structure
- **Export Capabilities**: Download improved resumes in DOCX or PDF format
- **Modern UI**: Beautiful teal glow theme with smooth GSAP animations
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **Animations**: GSAP with reduced motion support
- **File Processing**: pdf-parse, mammoth
- **AI Integration**: OpenRouter API, Google Gemini API
- **Export**: docx, pdf-lib
- **Validation**: Zod schemas

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_DEFAULT=meta-llama/llama-3.1-70b-instruct

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# Provider Selection (set to true to force Gemini even if OpenRouter is available)
GEMINI_ONLY=false
```

### 3. API Provider Selection

The app automatically selects the best available API provider:

1. **OpenRouter** (preferred): If `OPENROUTER_API_KEY` is set
2. **Gemini**: If only `GEMINI_API_KEY` is set
3. **Force Gemini**: Set `GEMINI_ONLY=true` to force Gemini usage

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

### POST /api/analyze

Analyzes a resume and returns ATS score, keyword matching, and improvement suggestions.

**Input**: FormData with `resumeFile` (PDF/DOCX) or `resumeText`, and optional `jobDescription`
**Output**: Analysis results with scores and suggestions

### POST /api/rewrite

Rewrites a resume using AI to improve content and structure.

**Input**: JSON with `resumeText` and optional `jobDescription`
**Output**: Rewritten resume in JSON and Markdown format

### POST /api/export

Exports a rewritten resume to DOCX or PDF format.

**Input**: JSON with `rewriteJson` and `format` ("docx" or "pdf")
**Output**: File download

### GET /api/health

Health check endpoint.

**Output**: `{ ok: true }`

## Usage

### 1. Upload Resume

- Drag and drop or click to upload a PDF or DOCX resume
- Alternatively, paste resume text directly
- Optionally add a job description for tailored feedback

### 2. View Analysis

- Get ATS score (0-100)
- See keyword match percentage
- Review bullet point improvements
- Check formatting tips and missing sections

### 3. Rewrite Resume

- Click "Rewrite Full Resume" to get AI-powered improvements
- Edit sections in the preview mode
- Export as DOCX or PDF

## File Support

- **Resume Formats**: PDF, DOCX
- **Job Description**: Text input or TXT file
- **File Size Limit**: 5MB per file
- **Export Formats**: DOCX, PDF

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support for animations
- High contrast text on teal background

## Security Features

- Server-side API key handling
- File type validation
- File size limits
- Input sanitization
- Rate limiting ready

## Development

### Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── analyze/           # Results dashboard
│   ├── about/             # ATS information page
│   └── rewrite/           # Resume rewriter
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities and schemas
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

### Key Components

- `AppShell`: Main layout with header and footer
- `UploadForm`: File upload and form handling
- `RewritePreview`: Resume editing and preview
- `ToastProvider`: Notification system

### Animation System

- GSAP-powered animations
- Respects `prefers-reduced-motion`
- Staggered animations for lists
- Scroll-triggered animations
- Counter animations for scores

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.
