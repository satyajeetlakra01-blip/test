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
   - **Zero Friction (No Login Required)**: No registration, password, email, or mobile required. Simply choose your grade and start practicing immediately.
   - **Focused on Learning (No Certificate Needed)**: Streamlined for pure conceptual mastery, score analytics, and Gemini AI diagnostic reviews without certificate generation.
   - **120 Questions per Grade (30 per subject)**:
     - 15 questions curated from the official curriculum pool
     - 15 supplementary AI-enhanced practice questions with rich conceptual hints
   - **Untimed & Unlimited**: No countdown timer, self-paced, practice as many times as you want without triggering the 1-year cooldown.
   - **In-Place Immediate Gemini AI Explanations**: As students solve questions, the Gemini AI tutor provides real-time conceptual feedback directly beneath the question.

3. **Gemini 3.5 Flash AI Diagnostic Engine**:
   - Integrated live Google Gemini Flash API (`gemini-3-flash-preview` / `gemini-3.5-flash`).
   - Analyzes why the candidate's chosen option is incorrect and points out common exam pitfalls.
   - Highlights the correct answer and explains the underlying concept step-by-step.
   - Provides actionable Olympiad study tips with high-speed JSON schema generation.

4. **10/10 SEO, Crawlability & Google Search Console Verification**:
   - **Google Search Console**: Verified via root HTML file (`google3e03f8662a84158e.html`) and HTML meta tags.
   - **Crawl Directives**: `robots.txt` configured with priority crawl paths and sitemap references.
   - **XML Sitemap**: `sitemap.xml` detailing multi-subject curriculum pages.
   - **Structured Data**: Google Rich Snippet JSON-LD schemas (`schema.org/EducationalOrganization`, `schema.org/Quiz`, `schema.org/LearningResource`).
   - **Social & Discovery**: Full OpenGraph and Twitter Card metadata.

5. **Clean High-Resolution Certificate of Achievement**:
   - Ultra high-resolution (2000x1414, 300 DPI diploma ratio) canvas generation.
   - Ornate multi-tier royal navy and burnished gold borders with baroque corner fleurons.
   - Guilloche rosette geometric security watermark.
   - Pure scholastic emblem with golden faceted star and dual laurel wreaths.
   - Honors distinction ribbons: Gold Medalist Distinction, Silver Commendation, Bronze Commendation.
   - Detailed subject performance plaque (English, Science, SST, Maths, Total Score, Accuracy).
   - 36-tooth embossed metallic gold seal with dual swallowtail ribbon tails.
   - Clean, official Authorized Signatory line for school / examination authority.
   - Unique credential reference hash ID and instant PNG download / print support.

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
│   │   ├── geminiExplainer.js # Gemini AI reasoning bridge
│   │   └── supabase.js        # Supabase cloud database client
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

### Database Configuration (Supabase)

The platform supports local-first persistence with seamless Supabase cloud synchronization for candidate registrations, 1-year cooldown tracking, and exam scorecards.

To enable Supabase cloud sync:
1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL (`VITE_SUPABASE_URL=https://<your-project-id>.supabase.co`).
3. Set your publishable key (`VITE_SUPABASE_ANON_KEY=sb_publishable_...`).
4. Run the following in your Supabase SQL Editor:

```sql
create table if not exists candidates (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  mobile text not null,
  name text not null,
  grade integer not null,
  gender text,
  school text not null,
  password text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists exam_results (
  id uuid default gen_random_uuid() primary key,
  attempt_id text not null,
  candidate_email text not null,
  candidate_name text not null,
  grade integer not null,
  school text not null,
  mode text not null,
  is_prep_mode boolean default false,
  total_questions integer not null,
  correct_count integer not null,
  wrong_count integer not null,
  unanswered_count integer not null,
  percentage integer not null,
  elapsed_seconds integer not null,
  subject_stats jsonb,
  auto_submitted boolean default false,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
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
