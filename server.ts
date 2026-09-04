import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL_SRV = process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL_SRV = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: GEMINI_MODEL_SRV }) : null;

async function aiComplete(system: string, user: string): Promise<string> {
  // Try Gemini first
  if (geminiModel) {
    try {
      const prompt = `${system}\n\nUser: ${user}`;
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.warn('Gemini server call failed, trying Groq fallback:', err);
    }
  }

  // Fallback to Groq
  if (!GROQ_KEY) throw new Error('Missing AI API key (Gemini and Groq)');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL_SRV,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.5,
      max_tokens: 8192,
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw.slice(0, 400));
  const data = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty AI response');
  return text;
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/**
 * NCERT Index Placeholder
 */
const ncertIndex = {
  "math": {
    "8.1": {
      "q1": {
        "question": "In triangle ABC, right-angled at B, AB = 24 cm, BC = 7 cm. Determine: (i) sin A, cos A",
        "concept": "Trigonometric Ratios & Pythagoras Theorem",
        "steps": [
          "1. Use Pythagoras Theorem: AC² = AB² + BC²",
          "2. AC² = 24² + 7² = 576 + 49 = 625",
          "3. AC = 25 cm",
          "4. sin A = BC/AC = 7/25",
          "5. cos A = AB/AC = 24/25"
        ],
        "answer": "sin A = 7/25, cos A = 24/25"
      }
    }
  }
};

// Root Route for testing
app.get('/', (req, res) => {
  res.send('<h1>Edu Spark Backend is Live!</h1><p>NCERT Search API is active at <code>/api/ncert-search</code></p>');
});

// UI Card to NCERT Data Path Mapping
const subjectMap: Record<string, string> = {
  'Maths Board Mastery': 'maths',
  'Science Concept Lab': 'science',
  'Social Science Score Booster': 'social-science',
  'Mathematics': 'maths',
  'Science': 'science',
  'Social Science': 'social-science'
};

// Full Chapter List Index
const chapterIndex: Record<string, any> = {
  'maths': [
    { id: 'real-numbers', title: 'Real Numbers', lessons: 4, exerciseCount: 2 },
    { id: 'polynomials', title: 'Polynomials', lessons: 5, exerciseCount: 4 },
    { id: 'trigonometry', title: 'Introduction to Trigonometry', lessons: 8, exerciseCount: 4 }
  ],
  'science': [
    { id: 'chemical-reactions', title: 'Chemical Reactions and Equations', lessons: 6, exerciseCount: 3 },
    { id: 'life-processes', title: 'Life Processes', lessons: 10, exerciseCount: 5 }
  ],
  'social-science': [
    { id: 'rise-of-nationalism', title: 'The Rise of Nationalism in Europe', lessons: 7, exerciseCount: 3 }
  ]
};

// New Endpoint: Fetch Chapter List for "Browse topics"
app.get('/api/lessons', (req, res) => {
  const subjectQuery = req.query.subject as string;
  const normalizedSubject = subjectMap[subjectQuery] || subjectQuery?.toLowerCase();
  
  const lessons = chapterIndex[normalizedSubject];
  if (lessons) {
    console.log(`[Lessons] Retrieved ${lessons.length} chapters for ${normalizedSubject}`);
    return res.json({ success: true, lessons });
  }

  res.status(404).json({ success: false, message: "Subject not found in index." });
});

// Search Endpoint (Updated to use mapping)
app.post('/api/ncert-search', async (req, res) => {
  const { query, subject } = req.body;
  const normalizedSubject = subjectMap[subject] || subject?.toLowerCase();
  
  console.log(`[NCERT Search] Query: "${query}" | Mapped Subject: "${normalizedSubject}"`);

  const lowerQuery = query.toLowerCase();

  // 1. Try pattern matching for Exercise/Question (High Priority)
  const mathMatch = lowerQuery.match(/exercise\s*([\d.]+).*?q(\d+)/i);
  if (mathMatch) {
    const [_, ex, qNum] = mathMatch;
    const solution = (ncertIndex as any).math?.[ex]?.[`q${qNum}`];
    if (solution) {
      console.log(`[Success] Found solution for Ex ${ex} Q${qNum}`);
      return res.json({ 
        success: true, 
        source: 'LearnCBSE Index', 
        type: 'solution',
        data: solution 
      });
    }
  }

  // 2. Try matching by Topic Name (Internal Lessons)
  const internalLessons: Record<string, any> = {
    "trigonometry": {
      "title": "Introduction to Trigonometry",
      "content": "# Introduction to Trigonometry\n\nTrigonometry is the branch of mathematics that deals with the relationship between the sides and angles of a triangle.\n\n## Core Concepts\n- **Sine (sin):** Ratio of Opposite side to Hypotenuse.\n- **Cosine (cos):** Ratio of Adjacent side to Hypotenuse.\n- **Tangent (tan):** Ratio of Opposite side to Adjacent side.\n\n## Example\nIn a right triangle with sides 3, 4, and 5 (hypotenuse), sin θ = 3/5."
    }
  };

  const lessonKey = Object.keys(internalLessons).find(key => lowerQuery.includes(key) || key.includes(lowerQuery));
  
  if (lessonKey) {
    console.log(`[Success] Found lesson for key: ${lessonKey}`);
    return res.json({ 
      success: true, 
      source: 'LearnCBSE Index', 
      type: 'lesson',
      data: internalLessons[lessonKey] 
    });
  }

  console.log(`[Fallback] No indexed content for "${query}". Falling back to AI.`);
  
  try {
    const prompt = `You are an NCERT 10th Expert. Provide a detailed, easy-to-understand, step-by-step solution for: "${query}" in subject: "${subject}". 
    Use simple language, break down complex concepts, and be encouraging.
    Format the response clearly with Question, Concept, Steps, and Final Answer.`;
    
    const text = await aiComplete(
      'You are an expert NCERT Class 10 tutor. Answer clearly, simply, and engagingly with markdown.',
      prompt,
    );

    return res.json({ 
      success: true, 
      source: 'Groq AI', 
      type: 'solution',
      data: {
        question: query,
        concept: "AI Generated Solution",
        steps: text.split('\n').filter(line => line.trim() !== ''),
        answer: "See steps above"
      } 
    });
  } catch (error) {
    console.error('Groq AI Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "AI generation failed." 
    });
  }
});

app.listen(PORT, () => {
  console.log(`
  🚀 Edu Spark Backend is running!
  --------------------------------
  URL: http://localhost:${PORT}
  API: http://localhost:${PORT}/api/ncert-search
  `);
});
