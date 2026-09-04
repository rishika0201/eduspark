import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { localStorage_safe } from '../utils/helpers';

type Language = 'EN' | 'HI' | 'TA' | 'ES';

const LS_UI_LANG = 'eduspark_ui_language';

function readStoredLanguage(): Language {
  const v = localStorage_safe.getItem(LS_UI_LANG);
  if (v === 'HI' || v === 'TA' || v === 'ES' || v === 'EN') return v;
  return 'EN';
}

export function outputLanguageName(lang: Language): string {
  const map: Record<Language, string> = {
    EN: 'English',
    HI: 'Hindi',
    TA: 'Tamil',
    ES: 'Spanish',
  };
  return map[lang];
}

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  'Dashboard': { EN: 'Dashboard', HI: 'डैशबोर्ड', TA: 'டாஷ்போர்டு', ES: 'Panel' },
  'Study Plans': { EN: 'Study Plans', HI: 'अध्ययन योजना', TA: 'ஆய்வுத் திட்டங்கள்', ES: 'Planes' },
  'Subjects': { EN: 'Subjects', HI: 'विषय', TA: 'பாடங்கள்', ES: 'Materias' },
  'Flashcards': { EN: 'Flashcards', HI: 'फ्लैशकार्ड', TA: 'மின்னட்டை', ES: 'Tarjetas' },
  'Gamify': { EN: 'Gamify', HI: 'गेमिफाई', TA: 'கேமிஃபை', ES: 'Jugar' },
  'Paper Gen': { EN: 'Paper Gen', HI: 'पेपर जनरेटर', TA: 'வினாத்தாள்', ES: 'Papeles' },
  'Doubts': { EN: 'Doubts', HI: 'शंकाएं', TA: 'சந்தேகங்கள்', ES: 'Dudas' },
  'Progress': { EN: 'Progress', HI: 'प्रगति', TA: 'முன்னேற்றம்', ES: 'Progreso' },
  'Logout': { EN: 'Logout', HI: 'लॉगआउट', TA: 'வெளியேறு', ES: 'Cerrar sesión' },
  'Search resources...': { EN: 'Search resources...', HI: 'संसाधन खोजें...', TA: 'தேடல்...', ES: 'Buscar...' },

  // Dashboard / General
  'Welcome back,': { EN: 'Welcome back,', HI: 'आपका स्वागत है,', TA: 'மீண்டும் வருக,', ES: 'Bienvenido de nuevo,' },
  'Your next best lesson is ready.': { EN: 'Your next best lesson is ready.', HI: 'आपका अगला पाठ तैयार है।', TA: 'உங்கள் அடுத்த பாடம் தயார்.', ES: 'Tu lección está lista.' },
  'Learning Hub': { EN: 'Learning Hub', HI: 'लर्निंग हब', TA: 'கற்றல் மையம்', ES: 'Centro de Aprendizaje' },
  'Explore courses': { EN: 'Explore courses', HI: 'कोर्स देखें', TA: 'பாடங்களை ஆராயுங்கள்', ES: 'Explorar cursos' },
  'Start practice': { EN: 'Start practice', HI: 'अभ्यास शुरू करें', TA: 'பயிற்சி தொடங்கவும்', ES: 'Iniciar práctica' },
  'Streak': { EN: 'Streak', HI: 'लगातार', TA: 'தொடர்ச்சி', ES: 'Racha' },
  'Topics': { EN: 'Topics', HI: 'विषय', TA: 'தலைப்புகள்', ES: 'Temas' },
  'Accuracy': { EN: 'Accuracy', HI: 'सटीकता', TA: 'துல்லியம்', ES: 'Precisión' },
  'My Courses': { EN: 'My Courses', HI: 'मेरे कोर्स', TA: 'என் பாடங்கள்', ES: 'Mis Cursos' },
  'Continue learning': { EN: 'Continue learning', HI: 'सीखना जारी रखें', TA: 'கற்றலைத் தொடரவும்', ES: 'Seguir aprendiendo' },

  // Subjects
  'Mathematics': { EN: 'Mathematics', HI: 'गणित', TA: 'கணிதம்', ES: 'Matemáticas' },
  'Science': { EN: 'Science', HI: 'विज्ञान', TA: 'அறிவியல்', ES: 'Ciencia' },
  'Social Science': { EN: 'Social Science', HI: 'सामाजिक विज्ञान', TA: 'சமூக அறிவியல்', ES: 'Ciencias Sociales' },
  'English': { EN: 'English', HI: 'अंग्रेजी', TA: 'ஆங்கிலம்', ES: 'Inglés' },

  // Analytics
  'Intelligence Hub': { EN: 'Intelligence Hub', HI: 'इंटेलिजेंस हब', TA: 'நுண்ணறிவு மையம்', ES: 'Centro de Inteligencia' },
  'Your Progress.': { EN: 'Your Progress.', HI: 'आपकी प्रगति।', TA: 'உங்கள் முன்னேற்றம்.', ES: 'Tu Progreso.' },
  'Mastery Level': { EN: 'Mastery Level', HI: 'महारत स्तर', TA: 'தேர்ச்சி நிலை', ES: 'Nivel de Maestría' },
  'Study Streak': { EN: 'Study Streak', HI: 'अध्ययन स्ट्रीक', TA: 'படிப்புத் தொடர்ச்சி', ES: 'Racha de Estudio' },
  'Total XP': { EN: 'Total XP', HI: 'कुल XP', TA: 'மொத்த XP', ES: 'XP Total' },
  'Time Spent': { EN: 'Time Spent', HI: 'व्यतीत समय', TA: 'செலவழித்த நேரம்', ES: 'Tiempo Dedicado' },
  'Subject Mastery': { EN: 'Subject Mastery', HI: 'विषय महारत', TA: 'பாடத் தேர்ச்சி', ES: 'Maestría de Materia' },
  'Achievements': { EN: 'Achievements', HI: 'उपलब्धियां', TA: 'சாதனைகள்', ES: 'Logros' },
  'Days': { EN: 'Days', HI: 'दिन', TA: 'நாட்கள்', ES: 'Días' },

  // Doubts
  'Doubt Center': { EN: 'Doubt Center', HI: 'शंका केंद्र', TA: 'சந்தேகம் மையம்', ES: 'Centro de Dudas' },
  'Ask mentor': { EN: 'Ask mentor', HI: 'मेंटर से पूछें', TA: 'வழிகாட்டியிடம் கேளுங்கள்', ES: 'Preguntar a mentor' },
  'Explanation': { EN: 'Explanation', HI: 'व्याख्या', TA: 'விளக்கம்', ES: 'Explicación' },
  'Thinking...': { EN: 'Thinking...', HI: 'सोच रहा है...', TA: 'சிந்திக்கிறது...', ES: 'Pensando...' },
  'Sorry, I encountered an error. Please try again.': { EN: 'Sorry, I encountered an error. Please try again.', HI: 'क्षमा करें, एक त्रुटि हुई। पुनः प्रयास करें।', TA: 'மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.', ES: 'Error. Inténtalo de nuevo.' },
  'Example threads': { EN: 'Example threads', HI: 'उदाहरण थ्रेड', TA: 'உதாரணப் பதிவுகள்', ES: 'Ejemplos' },
  'Sample solved doubts': { EN: 'Sample solved doubts', HI: 'नमूना हल की गई शंकाएं', TA: 'மாதிரி தீர்ந்த சந்தேகங்கள்', ES: 'Dudas resueltas de ejemplo' },
  'New mentor answers appear live in the chat on the left. This list is static reference only.': { EN: 'New mentor answers appear live in the chat on the left. This list is static reference only.', HI: 'नए उत्तर बाएं चैट में दिखते हैं। यह सूची केवल संदर्भ है।', TA: 'புதிய பதில்கள் இடது உரையாடலில் தோன்றும். இப்பட்டியல் நிலையானது.', ES: 'Las respuestas nuevas aparecen en el chat izquierdo. Esta lista es solo referencia.' },
  'You': { EN: 'You', HI: 'आप', TA: 'நீங்கள்', ES: 'Tú' },
  'AI Mentor': { EN: 'AI Mentor', HI: 'AI मेंटर', TA: 'AI வழிகாட்டி', ES: 'Mentor IA' },
  'Ask anything about your syllabus to start the chat.': { EN: 'Ask anything about your syllabus to start the chat.', HI: 'चैट शुरू करने के लिए पाठ्यक्रम से पूछें।', TA: 'அரட்டையைத் தொடங்க பாடத்திட்டம் பற்றி கேளுங்கள்.', ES: 'Pregunta sobre tu temario para empezar el chat.' },
  'Type your doubt...': { EN: 'Type your doubt...', HI: 'अपनी शंका लिखें...', TA: 'உங்கள் சந்தேகத்தை எழுதுங்கள்...', ES: 'Escribe tu duda...' },
  'Snap': { EN: 'Snap', HI: 'फोटो', TA: 'படம்', ES: 'Foto' },
  'Attach': { EN: 'Attach', HI: 'संलग्न', TA: 'இணை', ES: 'Adjuntar' },
  'Voice': { EN: 'Voice', HI: 'आवाज़', TA: 'குரல்', ES: 'Voz' },
  'Listening': { EN: 'Listening…', HI: 'सुन रहा है…', TA: 'கேட்கிறது…', ES: 'Escuchando…' },
  'Voice not supported': { EN: 'Voice typing is not supported in this browser. Try Chrome or Edge.', HI: 'इस ब्राउज़र में आवाज़ टाइपिंग उपलब्ध नहीं।', TA: 'இந்த உலாவியில் குரல் உள்ளீடு இல்லை. Chrome முயற்சிக்கவும்.', ES: 'El dictado por voz no está disponible en este navegador.' },
  'Voice error': { EN: 'Voice input stopped. Check microphone permission.', HI: 'आवाज़ इनपुट रुका। माइक अनुमति जांचें।', TA: 'மைக் அனுமதியைச் சரிபார்க்கவும்.', ES: 'Error de voz. Revisa el micrófono.' },
  'Auth server returned no user': { EN: 'Server did not return account data. The auth API may be offline or misconfigured.', HI: 'सर्वर ने खाता डेटा नहीं दिया।', TA: 'சேவையகம் கணக்குத் தரவைத் தரவில்லை.', ES: 'El servidor no devolvió datos de cuenta.' },
  'Live interaction for instant understanding': { EN: 'Live interaction for instant understanding', HI: 'तुरंत समझ के लिए लाइव संवाद', TA: 'உடனடி புரிதலுக்கு நேரடி உரையாடல்', ES: 'Chat en vivo para entender al instante' },

  // Flashcards
  'Flip card': { EN: 'Flip card', HI: 'कार्ड पलटें', TA: 'கார்டைத் திருப்பு', ES: 'Voltear tarjeta' },
  'Answer': { EN: 'Answer', HI: 'उत्तर', TA: 'பதில்', ES: 'Respuesta' },
  'Prompt': { EN: 'Prompt', HI: 'संकेत', TA: 'கேள்வி', ES: 'Pregunta' },
  'Next': { EN: 'Next', HI: 'अगला', TA: 'அடுத்து', ES: 'Siguiente' },
  'Previous': { EN: 'Previous', HI: 'पिछला', TA: 'முந்தைய', ES: 'Anterior' },

  // Study Plans
  'Your Journey': { EN: 'Your Journey', HI: 'आपकी यात्रा', TA: 'உங்கள் பயணம்', ES: 'Tu Viaje' },
  'Study Plans.': { EN: 'Study Plans.', HI: 'अध्ययन योजनाएं।', TA: 'ஆய்வுத் திட்டங்கள்.', ES: 'Planes de Estudio.' },
  'Daily Goals': { EN: 'Daily Goals', HI: 'दैनिक लक्ष्य', TA: 'தினசரி இலக்குகள்', ES: 'Objetivos Diarios' },
  'Weekly Milestones': { EN: 'Weekly Milestones', HI: 'साप्ताहिक मील के पत्थर', TA: 'வாராந்திர மைல்கற்கள்', ES: 'Hitos Semanales' },

  // Auth
  'Portal login title': { EN: 'Log in', HI: 'लॉग इन करें', TA: 'உள்நுழையவும்', ES: 'Iniciar sesión' },
  'Log in': { EN: 'Log in', HI: 'लॉग इन', TA: 'உள்நுழை', ES: 'Iniciar sesión' },
  'Start free': { EN: 'Start free', HI: 'मुफ्त शुरू करें', TA: 'இலவசமாகத் தொடங்கு', ES: 'Empezar gratis' },
  'Create Account.': { EN: 'Create Account.', HI: 'खाता बनाएं।', TA: 'கணக்கை உருவாக்கு.', ES: 'Crear Cuenta.' },
  'Full Name': { EN: 'Full Name', HI: 'पूरा नाम', TA: 'முழு பெயர்', ES: 'Nombre Completo' },
  'Academic Email': { EN: 'Academic Email', HI: 'अकादमिक ईमेल', TA: 'மின்னஞ்சல்', ES: 'Correo Académico' },
  'Secure Password': { EN: 'Secure Password', HI: 'सुरक्षित पासवर्ड', TA: 'கடவுச்சொல்', ES: 'Contraseña Segura' },
  'Login failed': { EN: 'Login failed. Check email and password, or sign up.', HI: 'लॉगिन असफल।', TA: 'உள்நுழைவு தோல்வி.', ES: 'Error al iniciar sesión.' },
  'Signup failed': { EN: 'Could not create account. Try again.', HI: 'खाता नहीं बना।', TA: 'கணக்கு உருவாக்க முடியவில்லை.', ES: 'No se pudo crear la cuenta.' },
  'Authenticating...': { EN: 'Signing in…', HI: 'साइन इन…', TA: 'உள்நுழைகிறது…', ES: 'Entrando…' },
  'Access Portal': { EN: 'Access Portal', HI: 'पोर्टल खोलें', TA: 'போர்ட்டலைத் திற', ES: 'Entrar al portal' },
  'Enter your email first for Emergency Login': { EN: 'Enter your email first.', HI: 'पहले ईमेल दर्ज करें।', TA: 'முதலில் மின்னஞ்சலை உள்ளிடவும்.', ES: 'Introduce tu correo primero.' },
  'Emergency Login (Password Override)': { EN: 'Emergency Login', HI: 'आपात लॉगिन', TA: 'அவசர உள்நுழைவு', ES: 'Acceso de emergencia' },
  "Don't have an account?": { EN: "Don't have an account?", HI: 'खाता नहीं है?', TA: 'கணக்கு இல்லையா?', ES: '¿No tienes cuenta?' },
  'Sign up here': { EN: 'Sign up here', HI: 'यहाँ साइन अप करें', TA: 'இங்கே பதிவு செய்யவும்', ES: 'Regístrate aquí' },
  'Already have an account?': { EN: 'Already have an account?', HI: 'पहले से खाता है?', TA: 'ஏற்கனவே கணக்கு உள்ளதா?', ES: '¿Ya tienes cuenta?' },
  'Login here': { EN: 'Log in here', HI: 'यहाँ लॉग इन करें', TA: 'இங்கே உள்நுழையவும்', ES: 'Entra aquí' },
  'Join the future of AI-powered education.': { EN: 'Join the future of AI-powered learning.', HI: 'AI शिक्षा में शामिल हों।', TA: 'AI கற்றலில் சேரவும்.', ES: 'Únete al aprendizaje con IA.' },
  'Initializing...': { EN: 'Creating account…', HI: 'खाता बन रहा है…', TA: 'கணக்கு உருவாகிறது…', ES: 'Creando cuenta…' },
  'Create Account': { EN: 'Create Account', HI: 'खाता बनाएं', TA: 'கணக்கை உருவாக்கு', ES: 'Crear cuenta' },
  'Enter your credentials to access your portal.': { EN: 'Enter your email and password to open your student portal.', HI: 'अपना ईमेल और पासवर्ड दर्ज करें।', TA: 'மின்னஞ்சலும் கடவுச்சொல்லும் உள்ளிடவும்.', ES: 'Introduce correo y contraseña.' },
  'Select grade': { EN: 'Grade', HI: 'कक्षा', TA: 'வகுப்பு', ES: 'Curso' },
  'Board syllabus': { EN: 'Board / syllabus', HI: 'बोर्ड / पाठ्यक्रम', TA: 'வாரியம் / பாடத்திட்டம்', ES: 'Plan de estudios' },
  'Continue as guest': { EN: 'Continue as guest', HI: 'अतिथि के रूप में जारी रखें', TA: 'விருந்தினராகத் தொடரவும்', ES: 'Continuar como invitado' },
  'Guest learner': { EN: 'Guest learner', HI: 'अतिथि छात्र', TA: 'விருந்தினர் மாணவர்', ES: 'Invitado' },
  'Guest setup hint': { EN: 'Pick your grade and board so lessons match your syllabus.', HI: 'कक्षा और बोर्ड चुनें।', TA: 'வகுப்பும் வாரியமும் தேர்ந்தெடுக்கவும்.', ES: 'Elige curso y plan.' },
  'Enter as Guest': { EN: 'Enter as Guest', HI: 'अतिथि के रूप में प्रवेश', TA: 'விருந்தினராக உள்ளே', ES: 'Entrar como invitado' },
  'CBSE': { EN: 'CBSE', HI: 'CBSE', TA: 'CBSE', ES: 'CBSE' },
  'ICSE': { EN: 'ICSE', HI: 'ICSE', TA: 'ICSE', ES: 'ICSE' },
  'State Board': { EN: 'State Board', HI: 'राज्य बोर्ड', TA: 'மாநில வாரியம்', ES: 'Estatal' },
  'Class 10': { EN: 'Class 10', HI: 'कक्षा 10', TA: 'வகுப்பு 10', ES: 'Clase 10' },
  'Class 12': { EN: 'Class 12', HI: 'कक्षा 12', TA: 'வகுப்பு 12', ES: 'Clase 12' },
  'AI Learning Protocol': { EN: 'AI Learning Protocol', HI: 'AI लर्निंग प्रोटोकॉल', TA: 'AI கற்றல் நெறிமுறை', ES: 'Protocolo IA' },

  // Gamify
  'Select Subject': { EN: 'Select Subject', HI: 'विषय चुनें', TA: 'பாடத்தைத் தேர்ந்தெடுக்கவும்', ES: 'Seleccionar Materia' },
  'Select Chapter': { EN: 'Select Chapter', HI: 'अध्याय चुनें', TA: 'அத்தியாயத்தைத் தேர்ந்தெடுக்கவும்', ES: 'Seleccionar Capítulo' },
  'Start Level': { EN: 'Start Level', HI: 'स्तर शुरू करें', TA: 'நிலையைத் தொடங்கவும்', ES: 'Iniciar Nivel' },
  'Level': { EN: 'Level', HI: 'स्तर', TA: 'நிலை', ES: 'Nivel' },
  'Score': { EN: 'Score', HI: 'स्कोर', TA: 'மதிப்பெண்', ES: 'Puntuación' },
  'Question': { EN: 'Question', HI: 'प्रश्न', TA: 'கேள்வி', ES: 'Pregunta' },
  'Questions': { EN: 'Questions', HI: 'प्रश्नों', TA: 'கேள்விகள்', ES: 'Preguntas' },
  'Correct Answer': { EN: 'Correct Answer', HI: 'सही उत्तर', TA: 'சரியான பதில்', ES: 'Respuesta Correcta' },
  'Next Question': { EN: 'Next Question', HI: 'अगला प्रश्न', TA: 'अடுத்த கேள்வி', ES: 'Siguiente Pregunta' },
  'Finish Quiz': { EN: 'Finish Quiz', HI: 'क्विज़ समाप्त करें', TA: 'முடிவு செய்', ES: 'Finalizar' },
  'Quiz Complete!': { EN: 'Quiz Complete!', HI: 'क्विज़ पूरा हुआ!', TA: 'வினாடி வினா முடிந்தது!', ES: '¡Prueba Completada!' },
  'Your Marks:': { EN: 'Your Marks:', HI: 'आपके अंक:', TA: 'உங்கள் மதிப்பெண்கள்:', ES: 'Tus Marcas:' },

  // Common UI
  'Back': { EN: 'Back', HI: 'वापस', TA: 'பின்', ES: 'Volver' },
  'Home': { EN: 'Home', HI: 'होम', TA: 'முகப்பு', ES: 'Inicio' },
  'Chapters': { EN: 'Chapters', HI: 'अध्याय', TA: 'அத்தியாயங்கள்', ES: 'Capítulos' },
  'Initialize Session.': { EN: 'Loading questions…', HI: 'प्रश्न लोड हो रहे हैं…', TA: 'கேள்விகள் ஏற்றுகிறது…', ES: 'Cargando…' },
  'Gamify loading label': { EN: 'Loading questions…', HI: 'प्रश्न लोड हो रहे हैं…', TA: 'கேள்விகள் ஏற்றுகிறது…', ES: 'Cargando…' },
  'Flashcard Learning': { EN: 'Flashcard Learning', HI: 'फ़्लैशकार्ड अध्ययन', TA: 'மின்னட்டை கற்றல்', ES: 'Tarjetas' },
  'Flip through the chapter.': { EN: 'Flip through the chapter.', HI: 'अध्याय के कार्ड पलटें।', TA: 'அத்தியாயத்தைத் திருப்பிப் படியுங்கள்.', ES: 'Repasa el capítulo.' },
  'Choose a subject and chapter, then use animated cards for quick recall and revision.': { EN: 'Choose a subject and chapter, then use animated cards for quick recall and revision.', HI: 'विषय और अध्याय चुनें, फिर त्वरित पुनरावृत्ति के लिए कार्ड का उपयोग करें।', TA: 'பாடமும் அத்தியாயமும் தேர்ந்தெடுத்து அட்டைகளுடன் மீள்பார்வை செய்யுங்கள்.', ES: 'Elige materia y capítulo y repasa con tarjetas.' },
  'Subject': { EN: 'Subject', HI: 'विषय', TA: 'பாடம்', ES: 'Materia' },
  'Chapter': { EN: 'Chapter', HI: 'अध्याय', TA: 'அத்தியாயம்', ES: 'Capítulo' },
  'Minutes': { EN: 'Minutes', HI: 'मिनट', TA: 'நிமிடங்கள்', ES: 'Minutos' },
  'Time': { EN: 'Time', HI: 'समय', TA: 'நேரம்', ES: 'Tiempo' },
  'Maximum Marks': { EN: 'Maximum Marks', HI: 'अधिकतम अंक', TA: 'அதிகபட்ச மதிப்பெண்கள்', ES: 'Máxima puntuación' },
  'SCHOOL EXAMINATION 2025-26': { EN: 'SCHOOL EXAMINATION 2025-26', HI: 'स्कूल परीक्षा 2025-26', TA: 'பள்ளி தேர்வு 2025-26', ES: 'EXAMEN ESCOLAR 2025-26' },
  'Courses': { EN: 'Courses', HI: 'पाठ्यक्रम', TA: 'பாடநெறிகள்', ES: 'Cursos' },
  'Results': { EN: 'Results', HI: 'परिणाम', TA: 'முடிவுகள்', ES: 'Resultados' },
  'Classes 6-12 - CBSE, ICSE, State Boards': { EN: 'Classes 6-12 - CBSE, ICSE, State Boards', HI: 'कक्षा 6-12 - CBSE, ICSE, राज्य बोर्ड', TA: 'வகுப்பு 6-12 - CBSE, ICSE, மாநில வாரியம்', ES: 'Clases 6-12 - CBSE, ICSE, estatales' },
  'Learn like toppers revise.': { EN: 'Learn like toppers revise.', HI: 'टॉपर्स की तरह रिवाइज़ करें।', TA: 'முன்னணி மாணவர்களைப் போல் மீள்பார்வை.', ES: 'Aprende como los mejores repasan.' },
  'Animated lessons, instant doubt solving, adaptive practice, analytics, rewards, and exam paper generation in one student app.': { EN: 'Animated lessons, instant doubt solving, adaptive practice, analytics, rewards, and exam paper generation in one student app.', HI: 'एनीमेटेड पाठ, तत्काल संदेह निवारण, अभ्यास, विश्लेषण, पुरस्कार और प्रश्न-पत्र — एक ऐप में।', TA: 'அனிமேஷன் பாடங்கள், சந்தேகம், பயிற்சி, புள்ளிவிவரம், வெகுமதி, வினாத்தாள் — ஒரே செயலியில்.', ES: 'Lecciones, dudas, práctica, analítica, recompensas y exámenes en una app.' },
  'Build my plan': { EN: 'Build my plan', HI: 'मेरी योजना बनाएं', TA: 'என் திட்டத்தை உருவாக்கு', ES: 'Crea mi plan' },
  'View courses': { EN: 'View courses', HI: 'कोर्स देखें', TA: 'பாடங்களைக் காண்க', ES: 'Ver cursos' },
  'personalized plan': { EN: 'personalized plan', HI: 'व्यक्तिगत योजना', TA: 'தனிப்பயன் திட்டம்', ES: 'plan personal' },
  "Today's momentum": { EN: "Today's momentum", HI: 'आज की गति', TA: 'இன்றைய உந்து', ES: 'Impulso de hoy' },
  'Learning score': { EN: 'Learning score', HI: 'लर्निंग स्कोर', TA: 'கற்றல் மதிப்பெண்', ES: 'Puntuación' },
  'Weekly challenge': { EN: 'Weekly challenge', HI: 'साप्ताहिक चुनौती', TA: 'வாராந்திர சவால்', ES: 'Reto semanal' },
  'Complete 3 topic drills and one mock test to unlock the Board Sprint badge.': { EN: 'Complete 3 topic drills and one mock test to unlock the Board Sprint badge.', HI: '3 विषय ड्रिल और एक मॉक टेस्ट पूरा करें।', TA: '3 பயிற்சிகள் மற்றும் ஒரு மாதிரி தேர்வு.', ES: 'Completa 3 prácticas y un simulacro.' },
  'View rewards': { EN: 'View rewards', HI: 'पुरस्कार देखें', TA: 'வெகுமதி', ES: 'Ver recompensas' },
  'Quick Syllabus': { EN: 'Quick Syllabus', HI: 'त्वरित पाठ्यक्रम', TA: 'விரைவு பாடத்திட்டம்', ES: 'Temario rápido' },
  'Pick a subject to learn now': { EN: 'Pick a subject to learn now', HI: 'अभी सीखने के लिए विषय चुनें', TA: 'இப்போது பாடம் தேர்ந்தெடு', ES: 'Elige una materia' },
  'Full learning hub': { EN: 'Full learning hub', HI: 'पूर्ण लर्निंग हब', TA: 'முழு கற்றல் மையம்', ES: 'Centro completo' },
  'Continue your adaptive learning path, clear doubts in the mentor chat, and move from concepts to exam-ready practice.': { EN: 'Continue your adaptive learning path, clear doubts in the mentor chat, and move from concepts to exam-ready practice.', HI: 'अपनी लर्निंग जारी रखें, चैट में संदेह साफ करें, और परीक्षा अभ्यास की ओर बढ़ें।', TA: 'கற்றலைத் தொடருங்கள், உரையாடலில் சந்தேகம் தீர்க்கவும்.', ES: 'Sigue tu ruta, resuelve dudas en el chat y practica para el examen.' },

  // PaperGen
  'PaperGen.': { EN: 'PaperGen.', HI: 'पेपरजेन.', TA: 'பேப்பர்ஜென்.', ES: 'PaperGen.' },
  'Custom topic label': { EN: 'Custom topic / instructions', HI: 'कस्टम विषय / निर्देश', TA: 'தனிப்பயன் தலைப்பு / வழிமுறைகள்', ES: 'Tema / instrucciones' },
  'Custom topic placeholder': { EN: 'e.g. Focus on quadratic equations or include map-based question…', HI: 'उदा. द्विघात समीकरण पर ध्यान दें…', TA: 'எ.கா. இருபடி சமன்பாடுகள்…', ES: 'Ej.: enfoque en ecuaciones…' },
  'Subject Area': { EN: 'Subject area', HI: 'विषय क्षेत्र', TA: 'பாடப் பகுதி', ES: 'Área' },
  'Total Marks label': { EN: 'Total marks', HI: 'कुल अंक', TA: 'மொத்த மதிப்பெண்', ES: 'Puntos totales' },
  'Time Min label': { EN: 'Time (min)', HI: 'समय (मिनट)', TA: 'நேரம் (நிமி)', ES: 'Tiempo (min)' },
  'Chapters Selection': { EN: 'Chapter selection', HI: 'अध्याय चयन', TA: 'அத்தியாயத் தேர்வு', ES: 'Selección de capítulos' },
  'Assemble Paper': { EN: 'Assemble paper', HI: 'पेपर बनाएं', TA: 'வினாத்தாள் உருவாக்கு', ES: 'Generar examen' },
  'Examination Blueprint': { EN: 'Examination blueprint', HI: 'परीक्षा खाका', TA: 'தேர்வு வரைபடம்', ES: 'Plano del examen' },
  'Export PDF': { EN: 'Export PDF', HI: 'PDF निर्यात', TA: 'PDF ஏற்றுமதி', ES: 'Exportar PDF' },
  'Print': { EN: 'Print', HI: 'प्रिंट', TA: 'அச்சிடு', ES: 'Imprimir' },
  'General Instructions': { EN: 'General instructions', HI: 'सामान्य निर्देश', TA: 'பொதுவழிமுறைகள்', ES: 'Instrucciones generales' },
  'Paper inst compulsory': { EN: 'All questions are compulsory.', HI: 'सभी प्रश्न अनिवार्य हैं।', TA: 'அனைத்துக் கேள்விகளும் கட்டாயம்.', ES: 'Todas las preguntas son obligatorias.' },
  'Paper inst sections': { EN: 'The paper contains multiple sections.', HI: 'पेपर में कई खंड हैं।', TA: 'பல பிரிவுகள் உள்ளன.', ES: 'El examen tiene varias secciones.' },
  'Paper inst marks': { EN: 'Marks for each question are indicated against it.', HI: 'प्रत्येक प्रश्न के सामने अंक दिए गए हैं।', TA: 'ஒவ்வொரு கேள்விக்கும் மதிப்பெண் குறிப்பிடப்பட்டுள்ளது.', ES: 'La puntuación figura junto a cada pregunta.' },
  'Paper inst diagrams': { EN: 'Draw diagrams wherever necessary.', HI: 'आवश्यकता अनुसार आरेख बनाएं।', TA: 'தேவையான இடங்களில் வரைபடம் வரையவும்.', ES: 'Dibuja diagramas cuando sea necesario.' },
  'End of Question Paper': { EN: '— End of question paper —', HI: '— प्रश्न-पत्र समाप्त —', TA: '— வினாத்தாள் முடிவு —', ES: '— Fin del examen —' },
  'Academic session line': { EN: 'Academic Session 2025-26 | Internal Assessment', HI: 'शैक्षणिक सत्र 2025-26 | आंतरिक मूल्यांकन', TA: 'கல்வி ஆண்டு 2025-26 | உள் மதிப்பீடு', ES: 'Curso 2025-26 | Evaluación interna' },
  'Paper empty hint': { EN: 'Pick chapters or add a custom topic, then tap Assemble paper to generate your blueprint here.', HI: 'अध्याय चुनें या विषय लिखें, फिर पेपर बनाएं।', TA: 'அத்தியாயங்கள் தேர்ந்தெடு அல்லது தலைப்பு எழுதி வினாத்தாள் உருவாக்கு.', ES: 'Elige capítulos o un tema y genera el examen.' },
  'Official watermark': { EN: 'OFFICIAL COPY', HI: 'आधिकारिक प्रति', TA: 'அதிகாரப்பூர்வ நகல்', ES: 'COPIA OFICIAL' },
  'Choose answer files': { EN: 'Choose files (optional)', HI: 'फ़ाइलें चुनें (वैकल्पिक)', TA: 'கோப்புகள் (விருப்பம்)', ES: 'Elegir archivos (opcional)' },
  'Time Allowed': { EN: 'Time allowed', HI: 'दिया गया समय', TA: 'அனுமதிக்கப்பட்ட நேரம்', ES: 'Tiempo' },
  'Upload answers': { EN: 'Upload answers for teacher', HI: 'शिक्षक के लिए उत्तर अपलोड करें', TA: 'ஆசிரியருக்கு பதில்கள் ஏற்றவும்', ES: 'Sube respuestas' },
  'Answer notes': { EN: 'Typed answers (paste here if no file)', HI: 'टाइप किए उत्तर (फाइल न हो तो यहाँ चिपकाएं)', TA: 'தட்டச்சு செய்த பதில்கள்', ES: 'Respuestas escritas' },
  'Submit to teacher': { EN: 'Submit to teacher portal', HI: 'शिक्षक पोर्टल पर भेजें', TA: 'ஆசிரியர் போர்ட்டலுக்கு அனுப்பு', ES: 'Enviar al profesor' },
  'Submission sent': { EN: 'Submitted. Your teacher can grade it from their portal.', HI: 'जमा हो गया। शिक्षक ग्रेड कर सकते हैं।', TA: 'அனுப்பப்பட்டது. ஆசிரியர் மதிப்பிடலாம்.', ES: 'Enviado. Tu profesor puede calificarlo.' },
  'My graded papers': { EN: 'My graded papers', HI: 'मेरे ग्रेड किए गए पेपर', TA: 'என் மதிப்பிடப்பட்ட தாள்கள்', ES: 'Mis exámenes corregidos' },
  'Teachers portal': { EN: 'Teachers portal', HI: 'शिक्षक पोर्टल', TA: 'ஆசிரியர் போர்ட்டல்', ES: 'Portal docente' },
  'Teachers portal hero': { EN: 'Track submissions, run AI-assisted grading, and see student progress on this device.', HI: 'इस डिवाइस पर जमा प्रगति देखें।', TA: 'இந்தச் சாதனத்தில் சமர்ப்பிப்புகளைக் காண்க.', ES: 'Seguimiento y calificación con IA.' },
  'Teacher portal login': { EN: 'Teacher portal login', HI: 'शिक्षक लॉगिन', TA: 'ஆசிரியர் உள்நுழைவு', ES: 'Acceso docentes' },
  'Teacher login hint': { EN: 'Demo: any password works. Students must log in on the same browser to appear in your registry.', HI: 'डेमो: कोई भी पासवर्ड।', TA: 'சோதனை: எந்த கடவுச்சொல்லும்.', ES: 'Demo: cualquier contraseña.' },
  'Enter portal': { EN: 'Enter portal', HI: 'पोर्टल में जाएं', TA: 'போர்ட்டலுக்குள்', ES: 'Entrar' },
  'Student login': { EN: 'Student login', HI: 'छात्र लॉगिन', TA: 'மாணவர் உள்நுழைவு', ES: 'Acceso alumnos' },
  'Teachers': { EN: 'Teachers', HI: 'शिक्षक', TA: 'ஆசிரியர்கள்', ES: 'Docentes' },
  'Teacher dashboard': { EN: 'Teacher dashboard', HI: 'शिक्षक डैशबोर्ड', TA: 'ஆசிரியர் டாஷ்போர்டு', ES: 'Panel docente' },
  'Students seen on this device': { EN: 'Students (this device)', HI: 'छात्र (यह डिवाइस)', TA: 'மாணவர்கள் (இந்தச் சாதனம்)', ES: 'Alumnos (este dispositivo)' },
  'Teacher registry hint': { EN: 'When students log in here, they are listed for your review.', HI: 'जब छात्र यहाँ लॉग इन करते हैं, सूची में दिखते हैं।', TA: 'மாணவர் உள்நுழையும்போது பட்டியலில் சேர்வார்கள்.', ES: 'Al iniciar sesión aparecen aquí.' },
  'No students yet': { EN: 'No students yet', HI: 'अभी कोई छात्र नहीं', TA: 'இன்னும் மாணவர்கள் இல்லை', ES: 'Sin alumnos aún' },
  'Paper submissions': { EN: 'Paper submissions', HI: 'पेपर जमा', TA: 'தாள் சமர்ப்பிப்புகள்', ES: 'Entregas' },
  'No submissions yet': { EN: 'No submissions yet', HI: 'अभी कोई जमा नहीं', TA: 'இன்னும் சமர்ப்பிப்புகள் இல்லை', ES: 'Sin entregas' },
  'Graded': { EN: 'Graded', HI: 'ग्रेड किया', TA: 'மதிப்பிடப்பட்டது', ES: 'Corregido' },
  'Pending': { EN: 'Pending', HI: 'लंबित', TA: 'நிலுவை', ES: 'Pendiente' },
  'AI grade submission': { EN: 'AI grade', HI: 'AI ग्रेड', TA: 'AI மதிப்பீடு', ES: 'Calificar con IA' },
  'Enter email and password.': { EN: 'Enter email and password.', HI: 'ईमेल और पासवर्ड दर्ज करें।', TA: 'மின்னஞ்சல் மற்றும் கடவுச்சொல்.', ES: 'Introduce email y contraseña.' },
  'Display name': { EN: 'Display name', HI: 'प्रदर्शन नाम', TA: 'காட்சி பெயர்', ES: 'Nombre' },
  'Optional': { EN: 'Optional', HI: 'वैकल्पिक', TA: 'விருப்பமானது', ES: 'Opcional' },

  // Gamify treasure / badges
  'Coins': { EN: 'Coins', HI: 'सिक्के', TA: 'நாணயங்கள்', ES: 'Monedas' },
  'Quiz points': { EN: 'Quiz points', HI: 'क्विज़ अंक', TA: 'வினாடி புள்ளிகள்', ES: 'Puntos' },
  'Treasure reward': { EN: 'Level treasure', HI: 'स्तर का खजाना', TA: 'நிலை புதையல்', ES: 'Tesoro' },
  'Tap to open chest': { EN: 'Tap to open', HI: 'खोलने के लिए टैप करें', TA: 'திறக்க தட்டவும்', ES: 'Toca para abrir' },
  'You earned coins': { EN: 'You earned coins!', HI: 'आपने सिक्के कमाए!', TA: 'நாணயங்கள் கிடைத்தன!', ES: '¡Monedas ganadas!' },
  'Level badges': { EN: 'Milestone badges (every 5 levels)', HI: 'माइलस्टोन बैज (हर 5 स्तर)', TA: 'நிலை பதக்கங்கள் (ஒவ்வொரு 5)', ES: 'Insignias (cada 5 niveles)' },
  'Badge unlocked': { EN: 'Badge unlocked!', HI: 'बैज अनलॉक!', TA: 'பதக்கம் திறக்கப்பட்டது!', ES: '¡Insignia desbloqueada!' },
  'Gamify result amazing': { EN: 'Amazing!', HI: 'शानदार!', TA: 'அருமை!', ES: '¡Increíble!' },
  'Gamify result great': { EN: 'Great job!', HI: 'बहुत बढ़िया!', TA: 'சிறப்பு!', ES: '¡Muy bien!' },
  'Gamify result clear': { EN: 'Level clear!', HI: 'स्तर पूरा!', TA: 'நிலை முடிந்தது!', ES: '¡Nivel superado!' },
  'Gamify result retry': { EN: 'Try again!', HI: 'फिर कोशिश करें!', TA: 'மீண்டும் முயற்சி!', ES: '¡Inténtalo de nuevo!' },
  'Final Score': { EN: 'Final score', HI: 'अंतिम स्कोर', TA: 'இறுதி மதிப்பெண்', ES: 'Puntuación final' },
  'Next Level': { EN: 'Next level', HI: 'अगला स्तर', TA: 'அடுத்த நிலை', ES: 'Siguiente nivel' },
  'Retry': { EN: 'Retry', HI: 'पुनः प्रयास', TA: 'மீண்டும்', ES: 'Reintentar' },
  'Exit to Menu': { EN: 'Exit to menu', HI: 'मेनू में जाएं', TA: 'மெனுவுக்கு', ES: 'Salir al menú' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage_safe.setItem(LS_UI_LANG, lang);
  }, []);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
