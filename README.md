# CS-EVAL 2.4 // Hebrew CS Exam Evaluator
### מערכת מומחית להערכה ובדיקה אוטומטית של מבחני קוד בכתב יד

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Google GenAI](https://img.shields.io/badge/Gemini_API-Multimodal_Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![Design](https://img.shields.io/badge/Style-Retro--Industrial_Brutalism-yellow?style=flat-square)](#design-system)

---

## ⚡ Overview // סקירה כללית

**CS-EVAL** is an automated, expert-grade evaluation engine and grading assistant designed to grade handwritten computer science exams containing mixed Hebrew explanations and code snippets (Python, Java, C++, JavaScript, C#, and more).

TAs, university lecturers, and coding bootcamp instructors spend countless hours deciphering illegible handwriting, crossed-out code blocks, and language-specific nuances. **CS-EVAL** uses multimodal AI vision models to accurately extract handwritten syntax, distinguish between handwriting ambiguities and actual logic bugs, and provide structured, pedagogical, and encouraging feedback in Hebrew along with an official grade breakdown.

Built with a bold **Retro/Industrial Brutalist** visual identity inspired by early computing terminals, industrial testing benches, and vintage audit equipment.

---

## 📸 Key Capabilities // יכולות מרכזיות

### 1. ✍️ Handwriting OCR & Code Extraction
- **Bilingual & Multi-Script Parsing**: Separates Hebrew handwriting annotations and reasoning from syntax logic.
- **Crossed-out & Revision Recognition**: Accurately tracks strikethroughs, scribbled lines, and inline arrows without mistaking them for syntax errors.
- **Lenient vs. Strict Diagnostics**: Distinguishes minor handwritten typos (e.g. missing semicolons in C++ or standard handwriting slips) from genuine logical bugs and syntax failures (e.g. calling `stack.push()` instead of `append()` in Python or invalid dictionary initialization).

### 2. 🎯 Weighted 50-30-20 Grading Rubric
The engine scores submissions according to formal computer science pedagogical criteria:

| Criterion | Weight | What is Evaluated |
| :--- | :---: | :--- |
| **נכונות ולוגיקה (Correctness & Logic)** | **50%** | Does the code solve the problem efficiently? Time/space complexity, edge cases (empty lists, single elements, unbalanced sequences). |
| **תחביר וסמנטיקה (Syntax & Semantics)** | **30%** | Language-specific constructs, correct types, valid method invocations, and valid scope handling. |
| **איכות וסגנון (Code Quality & Style)** | **20%** | Variable naming conventions, clean structure, readability, and modular design. |

### 3. 📋 4-Tier Structured Question Output
For every question detected in the exam, the system delivers:
1. **תעתיק קוד נקי (Code Transcription)**: A clean, formatted Markdown code block reconstructing the student's handwritten code.
2. **ניתוח והערכה מפורטת (Detailed Analysis)**:
   - **נקודות חוזק (Strengths)**: Concrete aspects the student executed properly.
   - **שגיאות ונקודות לתיקון (Errors & Corrections)**: Step-by-step bug log with severity tags (*קריטי / אזהרה / משני*) and line indicators.
   - **הערות פענוח כתב יד (Handwriting Considerations)**: Transparent notes regarding legibility, crossed-out sections, or handwriting ambiguities.
3. **פתרון מתוקן ונקי (Proposed Corrected Solution)**: Complete, executable, and clean solution code passing all constraints.
4. **ציון סופי ומשוב אישי (Final Score & Supportive Note)**: Numerical grade (0–100), weighted rubric progress meters, and an encouraging summary in supportive Hebrew motivating the student.

### 4. 📄 Multi-Format Ingestion
- **PDF Documents**: Native client-side rasterization of multi-page PDFs using PDF.js.
- **Image Uploads**: Drag-and-drop support for PNG, JPG, and WebP scans.
- **Live Camera Capture**: Direct capture from webcam or smartphone camera with frame alignment guidelines.
- **⚡ 1-Click Sample Exam**: Pre-loaded with the authentic handwritten exam sheet of **רינה קימל (Rina Kimmel)** for instant testing without uploading files.

### 5. 🖨️ Official Print & Export Ready
- **Print Mode**: Special CSS media query that turns the screen into a formal, black-and-white printout grade sheet.
- **Raw Markdown Report**: Full markdown output available for exporting into LMS systems (Moodle, Canvas) or emailing to students.
- **Local History**: Exam audit history saved in browser `localStorage` with quick switching between past submissions.

---

## 🏗️ Architecture & Data Flow

```
[ User Input ]
    ├── Upload PDF / Images (Multi-page)
    ├── Live Camera Capture
    └── Pre-loaded Sample Exam (Rina Kimmel)
          │
          ▼
[ Client Processing (pdfHelper.ts) ]
    ├── PDF Canvas Rasterization @ 1.8x Scale
    └── Base64 Normalization & Rotation Controls
          │
          ▼  POST /api/evaluate
[ Express Server Proxy (server.ts) ]
    ├── High-Payload Body Parser (50MB)
    ├── Multi-Model Resilience Loop:
    │     ├── 1. gemini-flash-latest
    │     ├── 2. gemini-3.8-flash
    │     └── 3. gemini-3.1-flash-lite
    ├── Exponential Backoff & 503 Spike Protection
    └── Structured JSON Schema Enforcement
          │
          ▼
[ Frontend Dashboard (React 19 + Tailwind v4) ]
    ├── Industrial Terminal Progress Monitor
    ├── 50/30/20 Animated Progress Bars
    ├── Side-by-side Code Transcription vs Corrected Code
    ├── Copy Code / Markdown buttons
    └── Print-Optimized Official Grade Sheet
```

---

## 🎨 Design System: Retro-Industrial Brutalism

The interface rejects sterile corporate UI templates in favor of a purposeful, high-contrast engineering aesthetic:
- **Hazard Striping & Contrast Headers**: Vivid industrial yellow (`#ffea00`) alongside pure black (`#111111`) and off-white grid background (`#f3efe6`).
- **Retro Stamps & Digital Displays**: VT323 digital display typography for giant LED-style scores, with vintage dashed stamp accents (*EXCELLENT*, *PASS*, *NEEDS WORK*).
- **Hard Brutalist Borders**: Thick 3px solid black outlines with crisp, un-blurred offset drop shadows (`shadow-[5px_5px_0_#000]`).
- **Terminal Console**: Live animated console output mimicking real-time compiler diagnostic streams.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Google Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/cs-eval-hebrew.git
   cd cs-eval-hebrew
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Included Sample Exam

The application includes an out-of-the-box synthetic handwritten exam for **Rina Kimmel** (`rina.kimmel@grunitech.com`) covering two classic algorithmic questions:

1. **Reverse Linked List (היפוך רשימה מקושרת)**:
   - *Task*: Given the head of a singly linked list, reverse the list and return the new head.
   - *Student Solution*: Attempts iterative reversal using pointers, with crossed-out lines and variable assignments.
2. **Valid Parentheses (בדיקת תקינות סוגריים)**:
   - *Task*: Given a string `s` containing brackets `()`, `{}`, `[]`, determine if brackets are closed in valid order.
   - *Student Solution*: Uses a stack with dictionary lookups, containing crossed-out inner loop iterations and method syntax choices.

Click **"⚡ טען מבחן לדוגמה (רינה קימל)"** to test the system immediately without preparing sample files.

---

## 📂 Project Structure

```
├── index.html                   # HTML entry point with Hebrew fonts & metadata
├── server.ts                    # Express backend, Gemini API proxy & multi-model fallback
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # Main application orchestrator & history manager
│   ├── index.css                # Tailwind CSS v4 setup & brutalist utility classes
│   ├── sampleExam.ts            # Default exam questions & canvas handwriting generator
│   ├── pdfHelper.ts             # PDF.js rasterizer and image conversion utilities
│   └── components/
│       ├── Header.tsx           # Retro-industrial header with status indicator
│       ├── ExamUploader.tsx     # Drag-and-drop, PDF parsing, camera & thumbnail viewer
│       ├── QuestionEditor.tsx   # Rubric configurator and dynamic exam question editor
│       ├── EvaluationProgress.tsx # Live simulated compiler progress & terminal log
│       └── EvaluationResult.tsx # Detailed score sheet, strengths, errors, and corrected code
├── package.json                 # Dependencies & scripts
└── tsconfig.json                # TypeScript configuration
```

---

## 🛡️ Error Handling & Reliability

- **High-Demand Resilience**: If Gemini encounters a temporary load spike (`503 UNAVAILABLE`), the backend automatically cascades across alternative models (`gemini-flash-latest` → `gemini-3.8-flash` → `gemini-3.1-flash-lite`) with backoff delays.
- **Illegible Submissions**: If a scanned photo is completely blurry, cropped, or unreadable, the system returns `isLegible = false` with a clear explanation in Hebrew without making up code.
- **Large Scans**: The server accommodates high-resolution image uploads up to `50MB` for clear, uncompressed OCR analysis.

---

## 📜 License
Apache-2.0 License. Built with Google AI Studio.
