import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix for ENOTFOUND on local machines
// Fix for ENOTFOUND on local machines - removed as direct connection is now used

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4 to avoid common DNS/timeout issues
  connectTimeoutMS: 30000
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// User Model with Performance Tracking
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  grade: { type: String, default: 'Class 10' },
  board: { type: String, default: 'CBSE' },
  interests: { type: [String], default: ['Mathematics', 'Science'] },
  performance: {
    topicsCompleted: { type: Number, default: 0 },
    testsAttempted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now }
  }
});

const User = mongoose.model('User', UserSchema);

const GROQ_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL_SRV = process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL_SRV = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: GEMINI_MODEL_SRV }) : null;

async function aiComplete(system, user) {
  // 1. Try Gemini model candidates
  if (genAI) {
    const geminiCandidateModels = [GEMINI_MODEL_SRV, 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    const tested = new Set();
    for (const mName of geminiCandidateModels) {
      if (!mName || tested.has(mName)) continue;
      tested.add(mName);
      try {
        const geminiInstance = genAI.getGenerativeModel({ model: mName });
        const prompt = `${system}\n\nUser: ${user}`;
        const result = await geminiInstance.generateContent(prompt);
        const response = await result.response;
        const txt = response.text().trim();
        if (txt) return txt;
      } catch (err) {
        console.warn(`Gemini server candidate "${mName}" failed, trying next...`);
      }
    }
  }

  // 2. Fallback to Groq candidates
  if (GROQ_KEY) {
    const groqCandidateModels = [GROQ_MODEL_SRV, 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    const testedGroq = new Set();
    for (const gModel of groqCandidateModels) {
      if (!gModel || testedGroq.has(gModel)) continue;
      testedGroq.add(gModel);
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: gModel,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: 0.5,
            max_tokens: 8192,
          }),
        });
        const raw = await res.text();
        if (res.ok) {
          const data = JSON.parse(raw);
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) return text;
        }
      } catch (err) {
        console.warn(`Groq server candidate "${gModel}" failed, trying next...`);
      }
    }
  }

  throw new Error('All AI service candidates failed');
}

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, grade, board } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);
    user = new User({ name, email, password: hashedPassword, grade, board });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).send('Server error');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log(`[Auth] Login attempt for: ${req.body?.email} | Name: ${req.body?.name}`);
    const { email, password, name, forceLogin } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ email });
    
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || 'password123', salt);
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        grade: 'Class 10',
        board: 'CBSE'
      });
      await user.save();
    } else {
      // Update name if provided
      if (name && name !== user.name) {
        user.name = name;
        await user.save();
      }
      
      const isMatch = password ? await bcrypt.compare(password, user.password) : true;
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    // Remove password from user object before sending
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send('Server error');
  }
});

// Update Performance
app.post('/api/user/performance', async (req, res) => {
  try {
    const { email, performance } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOneAndUpdate({ email }, { performance }, { new: true, upsert: true });
    res.json({ success: true, performance: user ? user.performance : performance });
  } catch (err) {
    console.error('Performance Update Error:', err);
    res.status(500).send('Server error');
  }
});

// NCERT Search
app.post('/api/ncert-search', async (req, res) => {
  const { query, subject } = req.body;
  try {
    const prompt = `You are an NCERT 10th Expert. Provide a detailed, easy-to-understand, step-by-step solution for: "${query}" in subject: "${subject}". 
    Use simple language, break down complex concepts, and be encouraging.
    Format the response clearly with Question, Concept, Steps, and Final Answer. Use markdown.`;
    const text = await aiComplete(
      'You are an expert NCERT Class 10 tutor. Answer clearly, simply, and engagingly with markdown.',
      prompt,
    );
    return res.json({ 
      success: true, 
      data: {
        question: query,
        steps: text.split('\n').filter(line => line.trim() !== ''),
        answer: "See steps above"
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI generation failed." });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Edu Spark Backend is Live!', db: mongoose.connection.readyState === 1 });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Edu Spark is running on http://localhost:${PORT}`);
});
