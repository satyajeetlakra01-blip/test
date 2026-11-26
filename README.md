# test

## National Scholastic Olympiad Platform (Grades 3 - 10)

An interactive, responsive Olympiad examination and preparatory web application built with React, Vite, and Google Antigravity Gemini AI tutor.

---

### Features

1. **Official Olympiad Mode**:
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

2. **Preparatory Mode**:
   - **120 Questions per Grade (30 per subject)**:
     - 15 questions curated from the official curriculum pool
     - 15 supplementary AI-enhanced practice questions with rich conceptual hints
   - **Untimed & Stress-Free**: No time limit so students can practice at their own pace.
   - Unlimited practice attempts.

3. **Gemini AI Explainer Integration**:
   - Instant AI diagnostics for incorrect responses.
   - Identifies why the chosen option is incorrect.
   - Highlights the correct answer and provides an in-depth breakdown of the core concept.
   - Connects seamlessly to Antigravity Gemini CLI or built-in intelligent diagnostic engine.

4. **Detailed Performance Analytics & Certificates**:
   - Subject-by-subject score breakdown, accuracy percentages, and time spent.
   - Filterable question review with full answer keys and Gemini explanations.
   - Client-side canvas certificate generation with instant high-resolution PNG download and print support.

---

### Project Structure

```
olympiad-app/
├── public/                 # Static assets
├── src/
│   ├── components/         # UI Components
│   │   ├── Header.jsx      # Navigation, branding & theme toggle
│   │   ├── LoginPage.jsx   # Candidate registration & mode selection
│   │   ├── ExamPage.jsx    # Interactive test environment & timer
│   │   ├── ResultPage.jsx  # Performance review & certificate view
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
│   │   ├── certificate.js     # High-res Canvas certificate renderer
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
