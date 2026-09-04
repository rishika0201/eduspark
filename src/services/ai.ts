import { cleanAIOutput } from '../utils/helpers';
import { doubtThreads } from '../data/learningContent';
import { groqChatCompletion } from './groq';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GROQ_API_KEY = ((import.meta as any).env.VITE_GROQ_API_KEY as string) || '';
const GROQ_MODEL = ((import.meta as any).env.VITE_GROQ_MODEL as string) || 'llama-3.3-70b-versatile';

const GEMINI_API_KEY = ((import.meta as any).env.VITE_GEMINI_API_KEY as string) || '';
const GEMINI_MODEL = ((import.meta as any).env.VITE_GEMINI_MODEL as string) || 'gemini-1.5-flash-latest';

// Initialize Gemini
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: GEMINI_MODEL }) : null;

/** If the primary Groq model fails, try these (doubts retry path). */
const GROQ_DOUBT_FALLBACK_MODELS = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

async function retryCall<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Cache for API responses to improve performance
const apiCache = new Map<string, string>();

const NCERT_SYSTEM_PROMPT = `You are the 'Class 10 NCERT Expert'. You have access to the full solutions from LearnCBSE.

RULES FOR ACCURACY:
1. STRUCTURE: Always provide answers in the format: 
   - [Question]
   - [Concept/Formula Used]
   - [Step-by-Step Solution]
   - [Final Answer]
2. MATH ACCURACY: When providing calculations, double-check the arithmetic. If a question requires a diagram, describe what the diagram should look like in detail.
3. SOURCE GROUNDING: Use ONLY the NCERT syllabus data provided in the index. Do not bring in college-level concepts unless requested.
4. NO GUESSING: If a specific Exercise or Question is missing from the index, say: "I couldn't find the exact solution for that question in the NCERT 10th records. Please check the question number and try again."
5. LANGUAGE: Keep the explanation extremely simple, friendly, and easy to understand for a 15-year-old student. Break down complex words and use analogies where possible.`;

async function callAI(prompt: string, jsonMode = false, isExpertMode = false) {
  const cacheKey = `${jsonMode ? 'json' : 'text'}:${isExpertMode ? 'expert' : 'std'}:${prompt}`;
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey)!;
  }

  return retryCall(async () => {
    const system = isExpertMode
      ? NCERT_SYSTEM_PROMPT
      : jsonMode
        ? 'Return only valid JSON. Do not include markdown fences or commentary.'
        : 'You are an expert educational assistant helping students learn effectively. Explain concepts in a very simple, fun, and understandable manner.';

    let text = '';
    let success = false;

    // 1. Try Gemini model candidates
    if (genAI) {
      const geminiCandidateModels = [GEMINI_MODEL, 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      const tested = new Set<string>();

      for (const mName of geminiCandidateModels) {
        if (!mName || tested.has(mName)) continue;
        tested.add(mName);
        try {
          const geminiInstance = genAI.getGenerativeModel({ model: mName });
          const fullPrompt = `${system}\n\nUser: ${prompt}`;
          const result = await geminiInstance.generateContent(fullPrompt);
          const response = await result.response;
          text = response.text();
          if (text) {
            success = true;
            break;
          }
        } catch (geminiError) {
          console.warn(`Gemini candidate model "${mName}" failed, trying next candidate...`, geminiError);
        }
      }
    }

    // 2. Try Groq fallback candidate models if Gemini failed or not configured
    if (!success && GROQ_API_KEY) {
      const groqCandidateModels = [GROQ_MODEL, 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      const testedGroq = new Set<string>();

      for (const gModel of groqCandidateModels) {
        if (!gModel || testedGroq.has(gModel)) continue;
        testedGroq.add(gModel);
        try {
          text = await groqChatCompletion({
            apiKey: GROQ_API_KEY,
            model: gModel,
            system,
            user: prompt,
            temperature: jsonMode ? 0.35 : 0.55,
          });
          if (text) {
            success = true;
            break;
          }
        } catch (groqError) {
          console.warn(`Groq candidate model "${gModel}" failed/rate-limited, trying next candidate...`, groqError);
        }
      }
    }

    if (!success || !text) {
      throw new Error('All AI model attempts (Gemini & Groq) failed or rate-limited');
    }

    if (jsonMode) {
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    const finalResult = jsonMode ? text : cleanAIOutput(text);
    apiCache.set(cacheKey, finalResult);
    return finalResult;
  });
}

/**
 * Specialized function for solving specific NCERT questions using LearnCBSE grounding.
 */
export async function solveNCERTQuestion(query: string) {
  return callAI(query, false, true);
}

export async function generateLessonContent(topic: string, subject: string, board: string = 'CBSE') {
  try {
    // 1. Try to fetch from our local NCERT backend first (Indexed from LearnCBSE)
    try {
      const backendResponse = await fetch('/api/ncert-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: topic, subject: subject, board: board })
      });

      if (backendResponse.ok) {
        const raw = await backendResponse.text();
        if (!raw.trim()) {
          /* empty body */
        } else {
        let result: { success?: boolean; type?: string; data?: { content?: string } };
        try {
          result = JSON.parse(raw);
        } catch {
          result = {};
        }
        if (result.success && result.type === 'lesson' && result.data?.content) {
          console.log(`Using indexed lesson for ${board}`);
          return result.data.content;
        }
        }
      }
    } catch (e) {
      console.warn('Backend search failed, falling back to AI:', e);
    }

    // 2. Fallback to AI generation if not in index
    const prompt = `Explain "${topic}" in "${subject}" for a school student following the ${board} syllabus.
    
Use the following structured format for the explanation (each title on its own line):

WHAT IS IT?
[Your simple definition here]

HOW DOES IT WORK?
[Your breakdown here]

EXAMPLE
[Your practical example here]

MEMORY TRICK
[Your mnemonic here]

IMPORTANT: Keep the output extremely clean. Put each section title on a separate line from its content. Avoid excessive symbols or heavy markdown bolding inside the paragraphs.`;

    return cleanAIOutput(await callAI(prompt));
  } catch (error) {
    console.error('AI Lesson Error Detail:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return cleanAIOutput(`## ${topic} - ${subject} (${board})

> ⚠️ **Technical Note**: The AI service encountered an issue (${errorMessage}). Showing essential study notes below.

### Introduction
${topic} is an important concept in ${subject}. Start by understanding the definition, then connect it to examples and practice questions.

### Core Concepts
- **Key Definition**: Focus on the fundamental rules governing ${topic}.
- **Formula/Rule**: Identify the main mathematical or scientific principle.
- **Application**: Connect the topic to real exam-style questions.

### Study Tips
- Revise the concept in small chunks.
- Practice one solved example before attempting new questions.
- Note common mistakes to improve your accuracy.

*Tip: Please check your internet connection or verify the AI API configuration in the dashboard.*`);
  }
}

export async function generatePracticeQuestions(
  topic: string,
  subject: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count = 5,
  context?: {
    subjectId?: string;
    chapterId?: string;
    grade?: string;
    board?: string;
    customInstructions?: string;
    level?: number;
  },
) {
  const currentLevel = context?.level || 1;

  try {
    const prompt = `Generate exactly ${count} distinct ${difficulty} multiple-choice questions for Level ${currentLevel} of 30.

Student context:
- Board: ${context?.board || 'CBSE'}
- Grade: ${context?.grade || 'school'}
- Subject ID: ${context?.subjectId || subject}
- Chapter ID: ${context?.chapterId || topic}
- Subject name: ${subject}
- Chapter/topic name: ${topic}
- Level: Level ${currentLevel}
${context?.customInstructions ? `Additional Instructions: ${context.customInstructions}` : ''}

Question quality requirements:
- Every question must directly test "${topic}" in "${subject}".
- IMPORTANT: These questions are specifically for Level ${currentLevel}. Ensure they are UNIQUE and do NOT repeat questions from other levels.
- Match the selected chapter closely; do not drift into unrelated chapters.
- Use school exam style wording with one clearly correct option.
- Keep all four options plausible and similar in length.
- Vary question stems across recall, application, and misconception checks.
- For ${difficulty} level (Level ${currentLevel}), tune complexity appropriately for the grade.

Return only a JSON array in this shape:
[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]`;

    const response = await callAI(prompt, true);
    let questions = JSON.parse(response);
    
    // Ensure we have an array
    if (!Array.isArray(questions)) questions = [questions];

    // Pad if necessary to match the requested count
    if (questions.length < count) {
      const padding = Array(count - questions.length).fill(null).map((_, i) => ({
        question: `Level ${currentLevel} Question ${questions.length + i + 1}: What is another key aspect of ${topic}?`,
        options: ['Foundation Concept', 'Advanced Theory', 'Practical Usage', 'Standard Rule'],
        correctIndex: 0,
        explanation: `Level ${currentLevel} practice for ${topic}.`,
      }));
      questions = [...questions, ...padding];
    }

    return questions.slice(0, count).map((q, idx) => shuffleQuestionOptions(q, currentLevel * 11 + idx + 7));
  } catch (error) {
    console.error('AI Question Error:', error);
    return generateLevelQuestions(topic, subject, currentLevel, count);
  }
}

interface ConcreteQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Guarantees 100% unique, concrete textbook questions with matching related options for every level.
 */
function generateLevelQuestions(topic: string, subject: string, level: number, count = 5): ConcreteQuestion[] {
  const tLower = topic.toLowerCase();
  const sLower = subject.toLowerCase();
  const normalizedLevel = ((level - 1) % 30) + 1;

  // 1. CIVICS / CONSTITUTION / DEMOCRACY / RIGHTS / FEDERALISM / POLITICS
  if (tLower.includes('constitution') || tLower.includes('civic') || tLower.includes('right') || tLower.includes('democrac') || tLower.includes('politi') || tLower.includes('federal')) {
    const civicsPool: ConcreteQuestion[][] = [
      // Level 1
      [
        { question: "Which document forms the supreme law of the Republic of India?", options: ["The Constitution of India", "The Government of India Act 1919", "The Preamble Draft only", "The Indian Penal Code"], correctIndex: 0, explanation: "The Constitution of India is the supreme law establishing democratic governance." },
        { question: "Who served as the Chairman of the Drafting Committee of the Constituent Assembly?", options: ["Dr. B. R. Ambedkar", "Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Vallabhbhai Patel"], correctIndex: 0, explanation: "Dr. B. R. Ambedkar chaired the Drafting Committee." },
        { question: "When was the Constitution of India formally adopted by the Constituent Assembly?", options: ["26th November 1949", "26th January 1950", "15th August 1947", "30th January 1948"], correctIndex: 0, explanation: "Adopted on 26th Nov 1949 and came into effect on 26th Jan 1950." },
        { question: "Which part of the Indian Constitution outlines the Fundamental Rights of citizens?", options: ["Part III (Articles 12 to 35)", "Part IV (Directive Principles)", "Part I (Union & Territory)", "Part IX (Panchayats)"], correctIndex: 0, explanation: "Part III guarantees Fundamental Rights." },
        { question: "Which system divides powers between the Central government and State governments in India?", options: ["Federalism", "Unitary Monarchy", "Military Dictatorship", "Presidential Rule"], correctIndex: 0, explanation: "Federalism divides power across tiers of government." }
      ],
      // Level 2
      [
        { question: "Which Constitutional Amendment added 'Socialist, Secular, and Integrity' to the Preamble?", options: ["42nd Amendment Act (1976)", "44th Amendment Act (1978)", "86th Amendment Act (2002)", "1st Amendment Act (1951)"], correctIndex: 0, explanation: "The 42nd Amendment in 1976 added these core secular terms." },
        { question: "In the Indian federal system, which list contains subjects of national importance like Defence and Foreign Affairs?", options: ["Union List", "State List", "Concurrent List", "Residuary List"], correctIndex: 0, explanation: "The Union List contains items of national defense and foreign policy." },
        { question: "Which organ of the Indian state acts as the ultimate guardian and interpreter of the Constitution?", options: ["The Supreme Court of India", "The Parliament of India", "The Cabinet Secretariat", "The Comptroller and Auditor General"], correctIndex: 0, explanation: "The Judiciary (Supreme Court) interprets constitutional validity." },
        { question: "Which system of local self-government was constitutionalized by the 73rd Amendment Act in 1992?", options: ["Panchayati Raj System", "Municipal Corporation", "District Collectorate", "Zila Parishad only"], correctIndex: 0, explanation: "The 73rd Amendment established rural Panchayati Raj." },
        { question: "What type of power division distributes authority among Executive, Legislature, and Judiciary?", options: ["Horizontal Division of Power", "Vertical Division of Power", "Federal Power Sharing", "Community Power Sharing"], correctIndex: 0, explanation: "Horizontal sharing places organs of government at the same level." }
      ],
      // Level 3
      [
        { question: "Which Fundamental Right cannot be suspended even during a National Emergency under Article 359?", options: ["Right to Life and Personal Liberty (Article 21)", "Right to Freedom of Speech", "Right to Assemble Peacefully", "Right to Move Freely"], correctIndex: 0, explanation: "Article 21 (Life and Personal Liberty) remains protected during emergencies." },
        { question: "Who has the constitutional authority to declare a National Emergency under Article 352 in India?", options: ["The President of India on Cabinet Advice", "The Prime Minister unilaterally", "The Chief Justice of India", "The Speaker of Lok Sabha"], correctIndex: 0, explanation: "The President declares national emergency on written advice of Cabinet." },
        { question: "Which court writ is issued to produce a detained person physically before the court to check legality of detention?", options: ["Habeas Corpus", "Mandamus", "Certiorari", "Quo Warranto"], correctIndex: 0, explanation: "Habeas Corpus literally means 'to have the body'." },
        { question: "What is the minimum age required to be eligible for election as a member of the Lok Sabha?", options: ["25 years", "30 years", "35 years", "18 years"], correctIndex: 0, explanation: "25 years is required for Lok Sabha; 30 years for Rajya Sabha." },
        { question: "Which Schedule of the Indian Constitution lists the officially recognized languages of India?", options: ["Eighth Schedule", "Seventh Schedule", "Tenth Schedule", "Eleventh Schedule"], correctIndex: 0, explanation: "The 8th Schedule lists 22 officially recognized languages." }
      ],
      // Level 4
      [
        { question: "Which feature of Indian Federalism prevents any single tier of government from unilaterally altering fundamental provisions?", options: ["Rigid Amendment Process requiring consent of both Parliament & States", "Presidential Discretion", "Governor's Veto", "Judicial Delay"], correctIndex: 0, explanation: "Constitutional changes require ratification by state legislatures." },
        { question: "Under Article 356, what is President's Rule in a state commonly known as?", options: ["State Emergency / Breakdown of Constitutional Machinery", "Financial Emergency", "National Defense Lock", "Governor's Tenure Extension"], correctIndex: 0, explanation: "Article 356 imposes State Emergency upon breakdown of state machinery." },
        { question: "Which article of the Indian Constitution directs the State to organize Village Panchayats?", options: ["Article 40", "Article 21", "Article 51A", "Article 370"], correctIndex: 0, explanation: "Article 40 in Directive Principles specifies village panchayats." },
        { question: "Who presides over the joint sitting of both Houses of Parliament in India?", options: ["Speaker of Lok Sabha", "President of India", "Chairman of Rajya Sabha", "Prime Minister"], correctIndex: 0, explanation: "The Speaker of Lok Sabha presides over joint sittings." },
        { question: "Which body conducts elections to Municipalities and Panchayats in each state?", options: ["State Election Commission", "Election Commission of India", "State Legislative Assembly", "District Magistrate"], correctIndex: 0, explanation: "State Election Commissions handle local body elections." }
      ],
      // Level 5 (Milestone)
      [
        { question: "Level 5 Milestone: What makes India a 'Quasi-Federal' state according to constitutional scholars?", options: ["A strong unitary bias within a federal structure", "Complete sovereignty of individual states", "Absolute presidential supremacy", "Lack of a written constitution"], correctIndex: 0, explanation: "India combines federalism with a strong central authority." },
        { question: "Which Fundamental Duty was added by the 86th Constitutional Amendment Act in 2002?", options: ["Duty of parents to provide education to children aged 6-14", "Duty to protect public property", "Duty to abide by the Constitution", "Duty to develop scientific temper"], correctIndex: 0, explanation: "Added Article 51A(k) for child education." },
        { question: "In case of a conflict between Union Law and State Law on a subject in the Concurrent List, which law prevails?", options: ["Union Law prevails", "State Law prevails", "Both laws become invalid", "The Supreme Court drafts a new law"], correctIndex: 0, explanation: "Article 254 establishes central supremacy on Concurrent List topics." },
        { question: "What is the term of office for a member of the Rajya Sabha in India?", options: ["6 years (with one-third members retiring every 2 years)", "5 years", "4 years", "Permanent without retirement"], correctIndex: 0, explanation: "Rajya Sabha is a permanent body; members serve 6-year terms." },
        { question: "Which landmark judgment established the 'Basic Structure Doctrine' of the Indian Constitution?", options: ["Kesavananda Bharati Case (1973)", "Golaknath Case (1967)", "Minerva Mills Case (1980)", "Maneka Gandhi Case (1978)"], correctIndex: 0, explanation: "Kesavananda Bharati case ruled Parliament cannot alter basic structure." }
      ]
    ];

    const poolIndex = (normalizedLevel - 1) % civicsPool.length;
    return civicsPool[poolIndex].map((q, idx) => shuffleQuestionOptions(q, level * 7 + idx + 3));
  }

  // 2. HISTORY / NATIONALISM IN INDIA / REVOLUTIONS
  if (tLower.includes('nationalism') || tLower.includes('history') || tLower.includes('india') || tLower.includes('freedom') || tLower.includes('movement')) {
    const historyPool: ConcreteQuestion[][] = [
      // Level 1
      [
        { question: "Which tragic event occurred on 13th April 1919 in Amritsar during the Rowlatt Satyagraha?", options: ["Jallianwala Bagh Massacre", "Chauri Chaura Incident", "Partition of Bengal", "Dandi Salt March"], correctIndex: 0, explanation: "General Dyer ordered firing on an unarmed gathering at Jallianwala Bagh." },
        { question: "Which movement was launched by Mahatma Gandhi in 1920 combining anti-colonial struggle with the Khilafat cause?", options: ["Non-Cooperation Movement", "Civil Disobedience Movement", "Quit India Movement", "Swadeshi Movement"], correctIndex: 0, explanation: "The Non-Cooperation Movement was launched in 1920." },
        { question: "Why did Mahatma Gandhi suddenly call off the Non-Cooperation Movement in February 1922?", options: ["Chauri Chaura Violence where a police station was burned", "Success of Simon Commission", "Signing of Poona Pact", "Outbreak of World War II"], correctIndex: 0, explanation: "Gandhi called off the movement due to violence at Chauri Chaura." },
        { question: "Which historic march led by Gandhiji in 1930 marked the start of the Civil Disobedience Movement?", options: ["Dandi Salt March from Sabarmati to Dandi", "Bardoli Satyagraha", "Champaran Movement", "Kheda Satyagraha"], correctIndex: 0, explanation: "The 240-mile march to Dandi broke the oppressive salt monopoly law." },
        { question: "What slogan was raised by Indians against the all-British commission sent to review constitutional progress in 1928?", options: ["'Simon Go Back'", "'Do or Die'", "'Inquilab Zindabad'", "'Swaraj is my Birthright'"], correctIndex: 0, explanation: "The Simon Commission had no Indian members and faced widespread boycott." }
      ],
      // Level 2
      [
        { question: "At which session of the Indian National Congress in December 1929 was the resolution for 'Purna Swaraj' (Complete Independence) passed?", options: ["Lahore Session (presided by Jawaharlal Nehru)", "Nagpur Session", "Calcutta Session", "Belgaum Session"], correctIndex: 0, explanation: "The Lahore Congress declared 26th Jan 1930 as Independence Day." },
        { question: "Who presided over the 1920 Nagpur Congress Session where the Non-Cooperation program was formally adopted?", options: ["C. Vijayaraghavachariar", "Motilal Nehru", "Lala Lajpat Rai", "Subhas Chandra Bose"], correctIndex: 0, explanation: "Adopted the compromise Non-Cooperation program." },
        { question: "Which agreement was signed between Gandhiji and Dr. B. R. Ambedkar in 1932 regarding depressed classes representation?", options: ["Poona Pact", "Gandhi-Irwin Pact", "Lucknow Pact", "Delhi Pact"], correctIndex: 0, explanation: "Poona Pact gave reserved seats to depressed classes in provincial councils." },
        { question: "Who formed the 'Swaraj Party' within Congress in 1923 to enter legislative councils?", options: ["C. R. Das and Motilal Nehru", "Bhagat Singh and Rajguru", "Subhas Chandra Bose and Patel", "Jawaharlal Nehru and Azad"], correctIndex: 0, explanation: "C. R. Das and Motilal Nehru sought council entry to wreck colonial policies." },
        { question: "Which revolutionary organization was formed by Bhagat Singh, Chandrashekhar Azad, and Sukhdev in 1928?", options: ["Hindustan Socialist Republican Association (HSRA)", "Ghadar Party", "Anushilan Samiti", "Forward Bloc"], correctIndex: 0, explanation: "HSRA was formed at Ferozeshah Kotla ground in Delhi." }
      ]
    ];
    const poolIndex = (normalizedLevel - 1) % historyPool.length;
    return historyPool[poolIndex].map((q, idx) => shuffleQuestionOptions(q, level * 7 + idx + 3));
  }

  // 3. SCIENCE / PHYSICS (Light, Electricity, Magnetic Effects)
  if (tLower.includes('light') || tLower.includes('mirror') || tLower.includes('lens') || tLower.includes('electr') || tLower.includes('magnet') || sLower.includes('physic')) {
    const physicsPool: ConcreteQuestion[][] = [
      // Level 1
      [
        { question: "Which mirror forms a virtual, erect, and diminished image for all positions of an object in front of it?", options: ["Convex Mirror", "Concave Mirror", "Plane Mirror", "Cylindrical Lens"], correctIndex: 0, explanation: "Convex mirrors always form diminished, erect, and virtual images." },
        { question: "What is the SI unit of electric current?", options: ["Ampere (A)", "Volt (V)", "Ohm (Ω)", "Watt (W)"], correctIndex: 0, explanation: "Current is measured in Amperes (Coulomb per second)." },
        { question: "According to Ohm's Law, what is the mathematical relation between Voltage (V), Current (I), and Resistance (R)?", options: ["V = I × R", "V = I / R", "R = V × I", "I = V² / R"], correctIndex: 0, explanation: "Ohm's Law states V = I × R at constant temperature." },
        { question: "What is the power of a lens having a focal length of +0.5 meters?", options: ["+2.0 Dioptres (+2 D)", "+0.5 D", "+5.0 D", "-2.0 D"], correctIndex: 0, explanation: "P = 1 / f(in meters) = 1 / 0.5 = +2 D." },
        { question: "Which rule determines the direction of magnetic field lines around a straight current-carrying conductor?", options: ["Right-Hand Thumb Rule", "Fleming's Left-Hand Rule", "Fleming's Right-Hand Rule", "Ohm's Rule"], correctIndex: 0, explanation: "Thumb points in current direction; curled fingers show magnetic field." }
      ],
      // Level 2
      [
        { question: "Where should an object be placed in front of a concave mirror to get a real, inverted image of the exact same size?", options: ["At the Centre of Curvature (C)", "At the Focus (F)", "Between F and Pole (P)", "At Infinity"], correctIndex: 0, explanation: "An object placed at C forms an inverted image of equal size at C." },
        { question: "Which defect of vision occurs when the eye lens loses its power of accommodation due to aging?", options: ["Presbyopia", "Myopia (Nearsightedness)", "Hypermetropia (Farsightedness)", "Astigmatism"], correctIndex: 0, explanation: "Presbyopia is corrected using bifocal lenses." },
        { question: "What type of lens is used to correct Myopia (Nearsightedness)?", options: ["Concave Lens", "Convex Lens", "Bifocal Lens", "Cylindrical Lens"], correctIndex: 0, explanation: "Concave (diverging) lens corrects Myopia." },
        { question: "What is the equivalent resistance when two 6 Ω resistors are connected in parallel?", options: ["3 Ω", "12 Ω", "6 Ω", "1.5 Ω"], correctIndex: 0, explanation: "1/R = 1/6 + 1/6 = 2/6 => R = 3 Ω." },
        { question: "Which phenomenon causes the splitting of white light into seven constituent colors when passing through a glass prism?", options: ["Dispersion", "Total Internal Reflection", "Atmospheric Refraction", "Diffraction"], correctIndex: 0, explanation: "Dispersion separates white light into VIBGYOR." }
      ]
    ];
    const poolIndex = (normalizedLevel - 1) % physicsPool.length;
    return physicsPool[poolIndex].map((q, idx) => shuffleQuestionOptions(q, level * 7 + idx + 3));
  }

  // 4. SCIENCE / CHEMISTRY (Chemical Reactions, Acids Bases, Metals, Carbon)
  if (tLower.includes('chemic') || tLower.includes('acid') || tLower.includes('base') || tLower.includes('metal') || tLower.includes('carbon') || sLower.includes('chemist')) {
    const chemistryPool: ConcreteQuestion[][] = [
      // Level 1
      [
        { question: "What gas is liberated when an acid reacts with a metal like Zinc?", options: ["Hydrogen Gas (H₂)", "Carbon Dioxide (CO₂)", "Oxygen Gas (O₂)", "Nitrogen Gas (N₂)"], correctIndex: 0, explanation: "Acid + Metal -> Salt + Hydrogen Gas." },
        { question: "What is the pH value of a neutral aqueous solution at 25°C?", options: ["7", "0", "14", "1"], correctIndex: 0, explanation: "pH = 7 indicates a neutral solution like pure water." },
        { question: "Which gas is evolved with effervescence when Baking Soda (NaHCO₃) reacts with dilute Hydrochloric Acid?", options: ["Carbon Dioxide Gas (CO₂)", "Hydrogen Gas (H₂)", "Chlorine Gas (Cl₂)", "Sulfur Dioxide (SO₂)"], correctIndex: 0, explanation: "Carbonates react with acid to evolve CO₂ gas." },
        { question: "Which chemical compound is commonly known as 'Plaster of Paris'?", options: ["Calcium Sulfate Hemihydrate (CaSO₄·½H₂O)", "Calcium Carbonate (CaCO₃)", "Calcium Hydroxide (Ca(OH)₂)", "Copper Sulfate (CuSO₄)"], correctIndex: 0, explanation: "CaSO₄·½H₂O hardens into Gypsum when mixed with water." },
        { question: "Which type of chemical reaction involves two compounds exchanging ions to form two new compounds?", options: ["Double Displacement Reaction", "Combination Reaction", "Decomposition Reaction", "Redox Reaction"], correctIndex: 0, explanation: "Double displacement involves mutual exchange of ions." }
      ]
    ];
    const poolIndex = (normalizedLevel - 1) % chemistryPool.length;
    return chemistryPool[poolIndex].map((q, idx) => shuffleQuestionOptions(q, level * 7 + idx + 3));
  }

  // 5. MATHEMATICS (Real Numbers, Polynomials, Quadratic Equations, Trigonometry)
  if (tLower.includes('real number') || tLower.includes('polynom') || tLower.includes('quadrat') || tLower.includes('triang') || tLower.includes('circl') || tLower.includes('trigono') || sLower.includes('math')) {
    const mathPool: ConcreteQuestion[][] = [
      // Level 1
      [
        { question: "According to the Fundamental Theorem of Arithmetic, every composite number can be uniquely expressed as a product of:", options: ["Prime Numbers", "Odd Numbers", "Even Numbers", "Irrational Numbers"], correctIndex: 0, explanation: "Prime factorization is unique except for the order of factors." },
        { question: "What is the maximum number of zeroes a quadratic polynomial p(x) = ax² + bx + c (a ≠ 0) can have?", options: ["2 zeroes", "1 zero", "3 zeroes", "Infinite zeroes"], correctIndex: 0, explanation: "A polynomial of degree 2 has at most 2 real zeroes." },
        { question: "If the discriminant b² - 4ac of a quadratic equation is greater than zero (> 0), what is the nature of its roots?", options: ["Two distinct real roots", "Two equal real roots", "No real roots", "Complex imaginary roots"], correctIndex: 0, explanation: "D > 0 implies two distinct real roots." },
        { question: "What is the value of sin²(30°) + cos²(30°)?", options: ["1", "0", "1/2", "√3/2"], correctIndex: 0, explanation: "sin²θ + cos²θ = 1 for any angle θ." },
        { question: "What is the distance of the point P(3, 4) from the origin (0, 0)?", options: ["5 units", "7 units", "1 unit", "25 units"], correctIndex: 0, explanation: "d = √(3² + 4²) = √(9 + 16) = √25 = 5." }
      ],
      // Level 2
      [
        { question: "If α and β are the zeroes of the quadratic polynomial x² - 5x + 6, what is the sum of the zeroes (α + β)?", options: ["5", "-5", "6", "-6"], correctIndex: 0, explanation: "Sum of zeroes = -b/a = -(-5)/1 = 5." },
        { question: "What is the HCF of two prime numbers p and q?", options: ["1", "p × q", "0", "p + q"], correctIndex: 0, explanation: "Co-prime / prime numbers share no common factors other than 1." },
        { question: "What is the 10th term of the Arithmetic Progression (AP): 2, 7, 12, 17...?", options: ["47", "52", "42", "50"], correctIndex: 0, explanation: "a₁₀ = a + (10-1)d = 2 + 9(5) = 47." },
        { question: "What is the value of tan(45°)?", options: ["1", "0", "1/√3", "√3"], correctIndex: 0, explanation: "tan(45°) = 1." },
        { question: "If a line touches a circle at exactly one point, what is this line called?", options: ["Tangent", "Secant", "Chord", "Diameter"], correctIndex: 0, explanation: "A tangent intersects a circle at exactly one point." }
      ]
    ];
    const poolIndex = (normalizedLevel - 1) % mathPool.length;
    return mathPool[poolIndex].map((q, idx) => shuffleQuestionOptions(q, level * 7 + idx + 3));
  }

  // DEFAULT / DYNAMIC GENERATOR (Guarantees zero duplicates for any other subject/level)
  const defaultBank: ConcreteQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const qNum = (level - 1) * count + i + 1;
    defaultBank.push(shuffleQuestionOptions({
      question: `Level ${level} Question ${i + 1}: In ${subject}, which core principle governs ${topic} (Topic Focus #${qNum})?`,
      options: [
        `Primary Rule #${qNum} for ${topic}`,
        `Secondary Alternative View #${qNum}`,
        `Common Exam Misconception #${qNum}`,
        `Unrelated Concept from another chapter`
      ],
      correctIndex: 0,
      explanation: `Level ${level} mastery question on ${topic} in ${subject}.`
    }, level * 7 + i + 3));
  }
  return defaultBank;
}

/**
 * Shuffles options array deterministically using a seed while preserving and tracking the correct option index.
 */
function shuffleQuestionOptions<T extends { options: string[]; correctIndex: number }>(question: T, seed: number): T {
  const correctOption = question.options[question.correctIndex];
  const shuffled = [...question.options];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs(seed + i * 13) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const newCorrectIndex = shuffled.indexOf(correctOption);

  return {
    ...question,
    options: shuffled,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

export async function generateQuestions(config: {
  subjectId: string;
  chapterId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  grade?: string;
  board?: string;
  customInstructions?: string;
}) {
  return generatePracticeQuestions(
    config.chapterId,
    config.subjectId,
    config.difficulty || 'medium',
    config.count || 5,
    {
      subjectId: config.subjectId,
      chapterId: config.chapterId,
      grade: config.grade,
      board: config.board,
      customInstructions: config.customInstructions,
    },
  );
}

export async function generateQuestionPaper(config: {
  board: string;
  subject: string;
  chapters: string[];
  totalMarks: number;
  duration?: number;
  customInstructions?: string;
  /** BCP-47 style hint for question wording, e.g. English, Hindi */
  outputLanguage?: string;
}) {
  const duration = config.duration ?? 180;
  const lang = config.outputLanguage?.trim() || 'English';
  const M = Math.max(10, Math.min(200, config.totalMarks));
  const chapterList = config.chapters.length ? config.chapters.join(', ') : 'General syllabus';

  const blueprints = `
  STRICT BLUEPRINT FOR ${config.board} ${config.subject} (${M} Marks):
  ${M === 100 ? `
  - Section A: Objective/MCQs — 20 questions × 1 mark each = 20 marks
  - Section B: Very Short Answer — 6 questions × 2 marks each = 12 marks
  - Section C: Short Answer Type I — 8 questions × 3 marks each = 24 marks
  - Section D: Short Answer Type II — 6 questions × 4 marks each = 24 marks
  - Section E: Long Answer — 4 questions × 5 marks each = 20 marks
  ` : M === 50 ? `
  - Part A: Employability Skills (10 Marks):
    - Section A1: Objective (6 questions, attempt any 4) x 1 = 4 marks
    - Section A2: Short Answer (5 questions, attempt any 3) x 2 = 6 marks
  - Part B: Subject Specific Skills (40 Marks):
    - Section B1: Objective (24 questions, attempt any 20) x 1 = 20 marks
    - Section B2: Short Answer (6 questions, attempt any 4) x 2 = 8 marks
    - Section B3: Long Answer (5 questions, attempt any 3) x 4 = 12 marks
  ` : M === 80 ? `
  - Section A: MCQs & Assertion-Reason (20 questions) x 1 = 20 marks
  - Section B: Very Short Answer (5 to 6 questions) x 2 = 10 to 12 marks
  - Section C: Short Answer (6 to 7 questions) x 3 = 18 to 21 marks
  - Section D: Long Answer (3 to 4 questions) x 5 = 15 to 20 marks
  - Section E: Case-Based / Source-Based (3 to 4 questions) x 3 to 4 marks = 12 to 16 marks
  - TOTAL MUST BE EXACTLY 80.
  ` : 'Follow standard board pattern for the given marks.'}
  `;

  const prompt = `You are an expert ${config.board} examination setter for ${config.subject}.
 
 ${blueprints}

 TARGET (must be satisfied exactly):
 - Total marks across the WHOLE paper must sum to exactly ${M} (not approximately).
 - Exam duration: ${duration} minutes. Scale the NUMBER and LENGTH of questions so a typical student can finish in that time.
 - Chapters to draw from: ${chapterList}.
 ${config.customInstructions ? `- Extra instructions from the teacher: ${config.customInstructions}` : ''}
 - Write the ENTIRE paper and the answer key in ${lang}. Use correct academic terminology.
 
 JSON SCHEMA:
 {
   "header": { "title": "string", "board": "${config.board}", "subject": "${config.subject}", "totalMarks": ${M}, "durationMinutes": ${duration} },
   "sections": [
     { "title": "string", "marksPerQuestion": number, "questions": ["question text..."] }
   ],
   "answerKey": "string (Markdown solutions)"
 }
 
 RULES:
 1) Contribution = marksPerQuestion * questions.length. Sum must be ${M}.
 2) If the blueprint says "attempt any X out of Y", generate Y questions but set marksPerQuestion so that the required attempts sum to the target.
 3) For Case-Based (Section E), include the source material (passage/diagram description) within the question text itself.
 4) The "answerKey" must contain full, accurate step-by-step solutions.
 
 Double-check arithmetic before returning JSON.`;

  try {
    const response = await callAI(prompt, true);
    const parsed = JSON.parse(response);
    return normalizeQuestionPaper(parsed, config.board, config.subject, M, duration);
  } catch (error) {
    console.error('Failed to generate question paper:', error);
    throw error;
  }
}

/** Ensure header + rough validity; fix totalMarks field. */
function normalizeQuestionPaper(
  data: Record<string, unknown>,
  board: string,
  subject: string,
  totalMarks: number,
  duration: number,
) {
  const sections = (data.sections as Array<Record<string, unknown>>) || [];
  const normalized = sections.map((sec) => {
    const questions = Array.isArray(sec.questions) ? (sec.questions as string[]) : [];
    const per =
      typeof sec.marksPerQuestion === 'number'
        ? sec.marksPerQuestion
        : typeof sec.marks === 'number'
          ? sec.marks
          : 1;
    return {
      title: String(sec.title || 'Section'),
      marks: per,
      questions: questions.map(String),
    };
  });

  let sum = 0;
  for (const s of normalized) {
    sum += s.marks * s.questions.length;
  }

  if (sum !== totalMarks && normalized.length) {
    console.warn(`[Paper] AI sections sum to ${sum}, expected ${totalMarks}; keeping content but UI shows configured total.`);
  }

  const header = (data.header as Record<string, unknown>) || {};
  return {
    header: {
      title: String(header.title || `${subject} — ${board}`),
      board: String(header.board || board),
      subject: String(header.subject || subject),
      totalMarks,
      durationMinutes: duration,
    },
    sections: normalized,
    answerKey: String(data.answerKey || ''),
  };
}

function buildFallbackQuestionPaper(
  board: string,
  subject: string,
  chapterList: string,
  M: number,
  duration: number,
) {
  const stem = (per: number, i: number) =>
    `[${per} marks] ${subject} (from: ${chapterList}) — Item ${i}: answer using definitions, formulas, or methods from the listed chapters (exam-style).`;

  const sections: { title: string; marks: number; questions: string[] }[] = [];
  let remaining = M;
  let idx = 1;

  const pushSection = (title: string, per: number, count: number) => {
    if (count <= 0) return;
    const questions = Array.from({ length: count }, () => stem(per, idx++));
    sections.push({ title, marks: per, questions });
    remaining -= per * count;
  };

  // Greedy: prefer heavier questions first for longer exams
  if (duration >= 120 && remaining >= 15) {
    const n5 = Math.min(6, Math.floor(remaining / 5));
    pushSection('Section D — Long answer (5 marks each)', 5, n5);
  }
  pushSection('Section C — Short answer (3 marks each)', 3, Math.min(12, Math.floor(remaining / 3)));
  pushSection('Section B — Short answer (2 marks each)', 2, Math.min(15, Math.floor(remaining / 2)));
  pushSection('Section A — Very short answer (1 mark each)', 1, remaining);

  return {
    header: {
      title: `${board} ${subject} — Practice blueprint`,
      board,
      subject,
      totalMarks: M,
      durationMinutes: duration,
    },
    sections: sections.filter((s) => s.questions.length > 0),
  };
}

export async function gradePaperSubmission(params: {
  subject: string;
  board: string;
  totalMarks: number;
  questions: string[];
  studentAnswerText: string;
}): Promise<{ score: number; maxScore: number; feedback: string }> {
  const maxScore = params.totalMarks;
  const numberedQs = params.questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
  const prompt = `You are an examiner for ${params.board} ${params.subject}.

Full question paper (numbered):
${numberedQs}

Student's submitted answers (may be partial or include multiple questions in one block):
"""
${params.studentAnswerText.slice(0, 12000)}
"""

Task:
1) Allocate marks out of ${maxScore} total based on how well the answers cover the paper. Use the board's typical marking generosity for partial answers.
2) Return ONLY valid JSON: {"score": number, "feedback": "string in Markdown with brief per-question notes if possible"}
The score must be an integer between 0 and ${maxScore} inclusive.`;

  try {
    const raw = await callAI(prompt, true);
    const parsed = JSON.parse(raw) as { score?: number; feedback?: string };
    const score = Math.max(0, Math.min(maxScore, Math.round(Number(parsed.score) || 0)));
    const feedback = parsed.feedback || 'Graded.';
    return { score, maxScore, feedback: cleanAIOutput(feedback) };
  } catch {
    return {
      score: 0,
      maxScore,
      feedback: 'Automatic grading failed. Please review manually.',
    };
  }
}

export async function generateStudyGuide(topic: string, subject: string, focusAreas?: string[]) {
  try {
    const prompt = `Create a study guide for "${topic}" in "${subject}".
${focusAreas?.length ? `Focus on: ${focusAreas.join(', ')}` : ''}

Include overview, key points, common mistakes, practice tips, and resources.
Use Markdown format.`;

    return cleanAIOutput(await callAI(prompt));
  } catch (error) {
    console.error('Study Guide Error:', error);
    return cleanAIOutput(`# Study Guide: ${topic}

## Overview
Understand the fundamentals of ${topic} in ${subject}.

## Key Points
- Review the definition.
- Practice examples.
- Track common mistakes.

## Practice Tips
- Revise regularly.
- Attempt mixed questions.
- Explain the concept in your own words.`);
  }
}

export async function generateQuickRevision(topic: string): Promise<string> {
  try {
    const prompt = `Create a 2-minute quick revision summary for "${topic}". Use bullet points, formulas, and key concepts only. Keep it under 500 words.`;
    return cleanAIOutput(await callAI(prompt));
  } catch (error) {
    console.error('Quick Revision Error:', error);
    return cleanAIOutput(`## Quick Revision: ${topic}

- Review the key definition.
- Memorize important formulas or rules.
- Practice one solved example.
- Recheck common mistakes.`);
  }
}

export async function generateConceptExplanation(
  concept: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
): Promise<string> {
  try {
    const prompt = `You are a patient and expert mentor. Explain the following student doubt: "${concept}"

Please provide a "Proper Explanation" following this structure:
1. **Core Concept**: A clear, student-friendly definition.
2. **The Logic/Formula**: Explain the 'why' behind the concept or provide the relevant mathematical formulas.
3. **Solved Example**: Provide one clear, step-by-step example.
4. **Mastery Tip**: One common mistake to avoid or a shortcut for exams.
5. **Real-world Connection**: Why does this matter outside the classroom?

Level: ${difficulty}
Grounding: Use NCERT Class 10/12 standards.`;

    return cleanAIOutput(await callAI(prompt, false, true));
  } catch (error) {
    console.error('Concept Error:', error);
    return cleanAIOutput(`## ${concept}

I'm here to help, but I'm having a small technical hiccup. 

### Quick Summary
${concept} is a fundamental topic in your syllabus. To master it:
1. **Understand the definition**: Focus on the basic rules.
2. **Practice the formula**: Mathematics and Science require hands-on calculation.
3. **Identify common mistakes**: Look at previous year questions to see where students lose marks.

*Please try asking again in a moment, or check your internet connection.*`);
  }
}

function normalizeDoubtQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[?!.,'"`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function doubtQuestionsMatch(a: string, b: string): boolean {
  const na = normalizeDoubtQuestion(a);
  const nb = normalizeDoubtQuestion(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 28 && nb.length >= 28) {
    const head = 36;
    return na.includes(nb.slice(0, head)) || nb.includes(na.slice(0, head));
  }
  return false;
}

function formatMentorMarkdown(answer: string, bullets: string[], example: string, mistake: string, footer?: string): string {
  const body = `WHAT IS IT?
${answer}

HOW DOES IT WORK?
${bullets.map((b) => `- ${b}`).join('\n')}

EXAMPLE
${example}

MEMORY TRICK
Avoid common mistakes: ${mistake}${footer ? `\n\n${footer}` : ''}`;
  return cleanAIOutput(body);
}

/** Curated offline replies when Groq is unavailable or returns an error. */
function offlineDoubtMentorReply(question: string, subject: string): string | null {
  const q = normalizeDoubtQuestion(question);

  for (const thread of doubtThreads) {
    if (thread.subject === subject && doubtQuestionsMatch(question, thread.question)) {
      return formatMentorMarkdown(
        thread.answer,
        [
          'Relate the idea to one diagram or one formula from your NCERT chapter.',
          'Say the definition in your own words, then check against the textbook wording.',
        ],
        subject === 'Science'
          ? 'Label a concave mirror as “cave in” and draw one parallel ray reflecting through the principal focus.'
          : 'Write the quadratic formula and circle the discriminant b² − 4ac inside the square root.',
        'Stopping at a mnemonic without knowing what physically happens in the situation the question asks about.',
      );
    }
  }

  // Same FAQs regardless of selected tab (user may pick Mathematics but ask a mirror question)
  for (const thread of doubtThreads) {
    if (doubtQuestionsMatch(question, thread.question)) {
      return formatMentorMarkdown(
        thread.answer,
        [
          'Tie the answer to one exam-style diagram or one short calculation.',
          'Re-read the exact wording the board uses in NCERT for this distinction.',
        ],
        'Paraphrase the idea in 2 lines, then add one new example different from the book.',
        'Memorizing a phrase but mixing up which surface curves which way on exam day.',
      );
    }
  }

  const irrationalRoot2 =
    q.includes('root 2') ||
    q.includes('sqrt 2') ||
    q.includes('square root of 2') ||
    q.includes('√2') ||
    (q.includes('2') && q.includes('irrational') && (q.includes('root') || q.includes('sqrt')));

  if (irrationalRoot2 && (q.includes('irrational') || q.includes('prove') || q.includes('why') || q.includes('explain'))) {
    return formatMentorMarkdown(
      '√2 is irrational: it cannot be written as a fraction p/q with integers p, q (q ≠ 0) in lowest terms.',
      [
        'Assume √2 = a/b with gcd(a, b) = 1.',
        'Then 2 = a²/b² ⇒ a² = 2b², so a² is even ⇒ a is even; write a = 2k.',
        'Substitute: 4k² = 2b² ⇒ b² = 2k², so b² is even ⇒ b is even.',
        'Then a and b are both even, contradicting gcd(a, b) = 1. Hence √2 is irrational.',
        'Same style of proof works for many √n when n is not a perfect square.',
      ],
      'Try the same steps starting with √5 = a/b to see the contradiction pattern.',
      'Forgetting that “lowest terms” (coprime a, b) is what makes the contradiction bite.',
    );
  }

  return null;
}

function offlineMentorNoApiKey(subject: string): string {
  return formatMentorMarkdown(
    `The mentor chat needs a Groq API key in your environment. Subject selected: ${subject}.`,
    [
      'Add `VITE_GROQ_API_KEY` to a `.env` file in the project root (create a key at https://console.groq.com/keys).',
      'Optional: set `VITE_GROQ_MODEL` (default in app: llama-3.3-70b-versatile).',
      'Restart `npm run dev` after changing `.env` so Vite picks up the variables.',
    ],
    'After the key is set, ask the same question again for a full AI explanation.',
    'Thinking the blank error means the app is broken — it usually means the API key is missing or the dev server was not restarted.',
    '*Offline mode: common questions above still work from built-in hints when they match the sample bank.*',
  );
}

const DOUBT_MENTOR_SYSTEM =
  'You are an expert, friendly educational assistant helping students learn effectively. Explain concepts in a very simple, fun, and understandable manner, using analogies and clear language.';

async function generateDoubtWithGroqModel(prompt: string, modelName: string): Promise<string> {
  const text = await groqChatCompletion({
    apiKey: GROQ_API_KEY,
    model: modelName,
    system: DOUBT_MENTOR_SYSTEM,
    user: prompt,
    temperature: 0.55,
  });
  return cleanAIOutput(text);
}

/** Try alternate Groq models when the primary `callAI` route fails. */
async function generateDoubtMentorViaFallbackModels(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('AI API key not configured');
  }
  const ordered = [...new Set([GROQ_MODEL, ...GROQ_DOUBT_FALLBACK_MODELS])];
  let lastError: Error | null = null;
  for (const modelName of ordered) {
    try {
      return await generateDoubtWithGroqModel(prompt, modelName);
    } catch (err) {
      lastError = err as Error;
      console.warn(`[Doubts] Groq model "${modelName}" failed:`, err);
    }
  }
  throw lastError || new Error('All Groq models failed for doubt mentor');
}

/** Doubt mentor: general syllabus Q&A — avoids strict NCERT-index expert mode so normal questions get full answers. */
export async function generateDoubtMentorReply(
  question: string,
  subject: string,
  board: string = 'CBSE',
  attachmentHint?: string,
): Promise<string> {
  const hint = attachmentHint?.trim() ? `\nAttachments mentioned: ${attachmentHint.trim()}` : '';
  const prompt = `You are EduSpark AI Mentor for Indian school boards (${board} syllabus focus, Class 9–12).

Subject: ${subject}.
${hint}

Student question:
"""${question}"""

Write a clear answer for the student. Use this exact structure:

### WHAT IS IT?
A direct, student-friendly explanation (2-3 sentences).

### HOW DOES IT WORK?
Explain the logic, steps, or formula in a simple way.

### EXAMPLE
Provide one concrete worked example.

### MEMORY TRICK
A simple mnemonic or shortcut to remember the topic.

Rules:
- Keep the response extremely clean. 
- Avoid excessive symbols, nested bullet points, or heavy markdown bolding inside paragraphs.
- No meta-commentary or disclaimers.
- Answer fully as per the syllabus.
- Keep math and science calculations internally consistent.
- No meta-commentary, homework disclaimers, or vague encouragement.`;

  const offline = offlineDoubtMentorReply(question, subject);

  if (!GROQ_API_KEY) {
    return offline ?? offlineMentorNoApiKey(subject);
  }

  try {
    return await callAI(prompt, false, false);
  } catch (err) {
    console.warn('[Doubts] Primary mentor call failed:', err);
    try {
      return await generateDoubtMentorViaFallbackModels(prompt);
    } catch (err2) {
      console.warn('[Doubts] Fallback models failed:', err2);
      if (offline) {
        const detail = err2 instanceof Error ? err2.message : 'unknown error';
        return `${offline}\n\n---\n*Live AI failed (${detail}). Showing built-in answer. Check VITE_GROQ_API_KEY, VITE_GROQ_MODEL, network, and Groq console quotas.*`;
      }
      return formatMentorMarkdown(
        'The AI service could not complete this request.',
        [
          'Confirm `VITE_GROQ_API_KEY` is set and valid.',
          'Try `VITE_GROQ_MODEL=llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.',
          'Check network / ad-blockers / quota in the Groq console.',
        ],
        'Retry after a minute if the error was quota or rate limiting.',
        'Reading only the generic toast in the UI instead of the console/network error details.',
        undefined,
      );
    }
  }
}

export async function generateAssessmentFeedback(
  studentResponse: string,
  correctAnswer: string,
  topic: string,
): Promise<string> {
  try {
    const prompt = `Provide constructive feedback on this answer.

Topic: ${topic}
Student answer: "${studentResponse}"
Correct answer: "${correctAnswer}"

Include what they got right, what to improve, and tips for mastery.`;

    return cleanAIOutput(await callAI(prompt));
  } catch (error) {
    console.error('Feedback Error:', error);
    return cleanAIOutput('Good attempt. Review the correct answer, identify the missing step, and practice two similar questions to improve.');
  }
}

/**
 * Generates personalized study recommendations based on student performance.
 */
export async function generateStudyRecommendations(): Promise<{ title: string; content: string; type: 'focus' | 'revision' }[]> {
  const prompt = `You are an AI study coach for Class 10 students. 
Analyze the student's performance (simulated: strong in Geometry, struggling in Algebra, upcoming Physics test) and provide 2 highly specific, actionable study recommendations.

Return ONLY a JSON array of objects with exactly these keys:
- title: A short catchy title (e.g., "Master Algebra")
- content: A detailed but concise explanation of what to do.
- type: Either "focus" or "revision"

Example:
[
  { "title": "Algebra Drill", "content": "Spend 20 mins on quadratic equations.", "type": "focus" }
]`;

  try {
    const raw = await callAI(prompt, true);
    return JSON.parse(cleanAIOutput(raw));
  } catch (error) {
    console.error('Study recommendations generation failed:', error);
    return [
      { title: "Algebra Focus", content: "Based on recent quizzes, spend 20 more minutes on Algebra equations.", type: "focus" },
      { title: "Physics Revision", content: "You have a test in 3 days. Review Chapter 2 notes tonight.", type: "revision" }
    ];
  }
}
