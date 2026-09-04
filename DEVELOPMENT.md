# EDU SPARK Development Guide

## Overview

This guide covers the enhanced architecture and best practices for developing EDU SPARK.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx              # Main layout wrapper
│   ├── PerformanceStats.tsx    # Stats dashboard
│   ├── StudyPlan.tsx           # Study planner
│   ├── AchievementBadge.tsx    # Achievements display
│   ├── NotificationCenter.tsx  # Toast notifications
│   ├── ErrorBoundary.tsx       # Error handling
│   ├── Skeleton.tsx            # Loading states
│   ├── ScrollReveal.tsx        # Scroll animations
│   ├── PageTransition.tsx      # Page transitions
│   ├── ShinyText.tsx           # Shiny text effect
│   ├── CustomCursor.tsx        # Custom cursor
│   └── EduButtons.tsx          # Custom buttons
│
├── contexts/            # React Context providers
│   ├── StudentContext.tsx      # Student state management
│   └── NotificationContext.tsx # Notification management
│
├── pages/              # Page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Practice.tsx     # Practice questions
│   ├── Analytics.tsx    # Performance analytics
│   ├── PaperGen.tsx     # Question paper generator
│   ├── GamifiedLearning.tsx # Gamified learning
│   ├── Home.tsx         # Landing page
│   └── Login.tsx        # Login page
│
├── services/           # API & external services
│   └── ai.ts           # AI service (NVIDIA/Mistral)
│
├── data/              # Static data & constants
│   └── syllabus.ts     # Curriculum data (CBSE)
│
├── hooks/             # Custom React hooks
│   └── useCustomHooks.ts
│
├── utils/             # Utility functions
│   └── helpers.ts
│
├── config/            # Configuration
│   └── constants.ts
│
├── types/             # TypeScript definitions
│   └── index.ts
│
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Getting Started

### 1. Environment Setup

Create `.env.local`:

```env
# AI API Configuration
VITE_AI_API_KEY=your_nvidia_api_key
VITE_AI_MODEL=qwen/qwen-2.5-coder-32b
VITE_AI_BASE_URL=https://integrate.api.nvidia.com/v1

# Optional: Groq API (used by EduSpark AI in `src/services/ai.ts`)
VITE_GROQ_API_KEY=your_groq_key
VITE_GROQ_MODEL=llama-3.3-70b-versatile

# Optional: Mistral API (alternative)
VITE_MISTRAL_API_KEY=your_mistral_key
```

### 2. Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Core Concepts

### State Management

**StudentContext** manages:
- User profile information
- Performance metrics
- Active topic and subject
- Authentication state

```tsx
const { studentInfo, performance, recordTopicCompletion } = useStudent();
```

**NotificationContext** manages:
- Toast notifications
- Success/error/warning/info messages
- Auto-dismiss timing

```tsx
const { addNotification } = useNotification();
addNotification("Success!", "success", 3000);
```

### Data Persistence

All data is saved to localStorage:

```tsx
// Automatic persistence via contexts
const { localStorage_safe } = useStudent();

// Manual access
localStorage_safe.setItem('key', JSON.stringify(data));
const data = localStorage_safe.getItem('key');
```

### AI Integration

Supported AI backends:

1. **NVIDIA API** (Primary)
   - Model: Qwen 2.5 Coder 32B
   - Endpoint: https://integrate.api.nvidia.com/v1

2. **Mistral AI** (Alternative)
   - Models: Mistral 7B, 8x7B

3. **Groq** (default in app)
   - Models: Llama 3.3 70B, Llama 3.1 8B Instant, Mixtral 8x7B
   - Console: https://console.groq.com/

Usage:

```tsx
import { generateLessonContent, generatePracticeQuestions } from './services/ai';

// Generate lesson
const lesson = await generateLessonContent("Polynomials", "Mathematics");

// Generate questions
const questions = await generatePracticeQuestions("Algebra", "Math", "medium", 5);

// Generate study guide
const guide = await generateStudyGuide("Trigonometry", "Math");
```

## Creating New Components

### Example: New Feature Component

```tsx
import { motion } from 'motion/react';
import ScrollReveal from './ScrollReveal';
import { useStudent } from '../contexts/StudentContext';
import { useNotification } from '../contexts/NotificationContext';

interface MyComponentProps {
  title: string;
  data?: any;
}

export default function MyComponent({ title, data }: MyComponentProps) {
  const { studentInfo } = useStudent();
  const { addNotification } = useNotification();

  const handleAction = () => {
    addNotification("Action completed!", "success");
  };

  return (
    <ScrollReveal direction="up">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-white/10"
      >
        <h3 className="text-xl font-black text-white mb-4">{title}</h3>
        {/* Component content */}
        <button
          onClick={handleAction}
          className="px-4 py-2 bg-primary rounded-lg text-white font-semibold hover:shadow-lg transition-all"
        >
          Action
        </button>
      </motion.div>
    </ScrollReveal>
  );
}
```

## Using Custom Hooks

### useAsync - Async Operations

```tsx
const { data, status, error, execute } = useAsync(
  () => generateLessonContent(topic, subject),
  true // Execute immediately
);

if (status === 'pending') return <Skeleton />;
if (status === 'error') return <ErrorMessage error={error} />;
if (status === 'success') return <Content data={data} />;
```

### useLocalStorage - Persistent State

```tsx
const [preferences, setPreferences] = useLocalStorage('prefs', {});

const updatePreference = (key: string, value: any) => {
  setPreferences({ ...preferences, [key]: value });
};
```

### useOnline - Network Detection

```tsx
const isOnline = useOnline();

if (!isOnline) {
  return <OfflineMessage />;
}
```

### useSessionTimer - Track Time

```tsx
const sessionTime = useSessionTimer();

useEffect(() => {
  const minutes = Math.floor(sessionTime / 60);
  updateLearningTime(minutes);
}, [sessionTime]);
```

## Performance Tracking

Record user activities:

```tsx
const { recordTopicCompletion, recordTestAttempt, updateLearningTime } = useStudent();

// When user completes a topic
recordTopicCompletion("Polynomials");

// When user completes a test
recordTestAttempt(85); // Score out of 100

// Update learning time periodically
updateLearningTime(15); // 15 minutes
```

## Styling Guidelines

### Tailwind CSS + Custom Classes

```tsx
// Dark glassmorphism component
<div className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-white/10">
  {/* Content */}
</div>

// Gradient text
<h1 className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
  Gradient Text
</h1>

// Animation
<motion.div
  whileHover={{ y: -5 }}
  animate={{ opacity: [0.5, 1] }}
  transition={{ duration: 0.3 }}
>
  Animated Content
</motion.div>
```

## Error Handling

### Try-Catch in AI Calls

```tsx
try {
  const content = await generateLessonContent(topic, subject);
  addNotification("Lesson loaded!", "success");
} catch (error) {
  console.error("Error:", error);
  addNotification("Failed to load lesson. Showing fallback content.", "error");
}
```

### Error Boundary for Components

```tsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## Testing Checklist

- [ ] Performance metrics track correctly
- [ ] Notifications appear and dismiss
- [ ] Achievements unlock properly
- [ ] AI generates content successfully
- [ ] localStorage persists data
- [ ] Network detection works
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors
- [ ] Page transitions smooth
- [ ] Error boundaries catch crashes

## Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` folder

### Preview Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Performance Optimization

### Code Splitting

Routes are lazy-loaded automatically by React Router.

### Image Optimization

Use next/image equivalent or just serve optimized images.

### Caching

- API responses cached in localStorage
- Lessons cached with 24-hour expiry
- Performance metrics cached locally

### Bundle Size

Current: ~500KB gzipped (with all dependencies)

## Monitoring & Debugging

### Enable Debug Logging

```tsx
if (isDevelopment()) {
  console.log("Debug info:", data);
}
```

### Check Network Status

Open DevTools → Network tab:
- Watch AI API calls
- Monitor response times
- Check error responses

### LocalStorage Inspection

```javascript
// In browser console
localStorage.getItem('student_info')
JSON.parse(localStorage.getItem('student_performance'))
```

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Motion/Framer Motion](https://www.motion.dev)
- [Lucide Icons](https://lucide.dev)

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create new issue with details
3. Include error messages and steps to reproduce

---

**Happy coding! 🚀**
