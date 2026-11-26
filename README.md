# test

## National Scholastic Olympiad Platform (Grades 3 - 10)

An interactive, responsive Olympiad examination and preparatory web application built with React, Vite, and Google Antigravity Gemini AI tutor.

---

### Key Features

1. **Official Olympiad Examination Mode**:
   - Covers Grades 3 through 10.
   - **80 Multiple-Choice Questions (MCQs)**:
     - 20 English
     - 20 Science
     - 20 Social Studies (SST)
     - 20 Mathematics
   - Strict **80-minute countdown timer** with real-time progress indicators.
   - Automatic submission on timer expiration.
   - Comprehensive registration: Name, Class, Gender, Mobile Number, School Name, Email, and Password.
   - **1-Year Re-attempt Cooldown**: Enforces that candidates cannot retake the official exam for their grade within 365 days of completion.
   - **Examination Integrity & End-of-Test AI Explanations**: In official examination mode, answer keys and explanations are securely sealed during the test. Full in-depth Gemini AI diagnostic explanations are revealed at the conclusion of the test on the results page.

2. **Preparatory Mode**:
   - **120 Questions per Grade (30 per subject)**:
     - 15 questions curated from the official curriculum pool
     - 15 supplementary AI-enhanced practice questions with rich conceptual hints
   - **Untimed & Stress-Free**: No time limit so students can practice at their own pace.
   - **In-Place Immediate Gemini AI Explanations**: As students solve questions, the Gemini AI tutor provides real-time conceptual feedback directly beneath the question.

3. **Gemini AI Diagnostic Explainer Engine**:
   - Analyzes why the candidate's chosen option is incorrect.
   - Highlights the correct answer and explains the underlying concept step-by-step.
   - Provides actionable study tips and connects to Antigravity Gemini CLI or built-in intelligent diagnostic engine.

4. **Upgraded Prestigious Certificate of Achievement**:
   - Ultra high-resolution (2000x1414, 300 DPI diploma ratio) canvas generation.
   - Ornate multi-tier royal navy and burnished gold borders with baroque corner fleurons.
   - Guilloche rosette geometric security watermark.
   - Academic crest with golden faceted star and dual laurel wreaths.
   - Honors distinction ribbons: National Gold Distinction, Scholastic Silver, Bronze Commendation.
   - Detailed subject performance plaque (English, Science, SST, Maths, Total Score, Accuracy).
   - 36-tooth embossed metallic gold foil seal with dual swallowtail ribbon tails.
   - Dual realistic calligraphic signatures (Director General and Controller of Examinations).
   - Procedural 2D verification QR matrix, reference hash ID, and instant PNG download / print support.

---

### Project Structure

```
olympiad-app/
├── public/                 # Static assets & icons
├── src/
│   ├── components/         # UI Components
│   │   ├── Header.jsx      # Navigation, branding & theme toggle
│   │   ├── LoginPage.jsx   # Candidate registration & mode selection
│   │   ├── ExamPage.jsx    # Interactive test environment & timer
│   │   ├── ResultPage.jsx  # Performance review, AI diagnostics & certificate
│   │   └── GeminiExplanationCard.jsx # AI explanation widget
│   ├── data/               # Question banks across Grades 3 to 10
│   │   ├── englishQuestions.js
│   │   ├── scienceQuestions.js
│   │   ├── sstQuestions.js
│   │   ├── mathsQuestions.js
│   │   ├── prepEnglishQuestions.js
│   │   ├── prepScienceQuestions.js
│   │   ├── prepSstQuestions.js
│   │   ├── prepMathsQuestions.js
│   │   └── questionBank.js
│   ├── services/
│   │   └── geminiExplainer.js # Gemini AI reasoning bridge
│   ├── utils/
│   │   ├── certificate.js     # Upgraded Canvas certificate generator
│   │   └── storage.js         # LocalStorage & cooldown manager
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── vite.config.js          # Vite configuration with /api/gemini-explain bridge
└── package.json
```

---

### Getting Started

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation & Running

```bash
# Clone the repository
git clone https://github.com/satyajeetlakra01-blip/test.git
cd test

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

### License
MIT License
