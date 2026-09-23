import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable large body payloads for high-resolution exam scans and photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Google GenAI client (User-Agent header required by skill)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface ExamEvaluationResponse {
  isLegible: boolean;
  illegibleReason?: string;
  studentName?: string;
  studentEmail?: string;
  detectedLanguage: string;
  overallGrade: number;
  gradeBreakdown: {
    correctnessScore: number; // out of 50
    syntaxScore: number; // out of 30
    styleScore: number; // out of 20
  };
  summaryHebrew: string;
  questions: Array<{
    questionNumber: number;
    questionTitle: string;
    transcription: string;
    strengths: string[];
    errors: Array<{
      lineOrLocation?: string;
      description: string;
      severity: "critical" | "warning" | "minor";
    }>;
    handwritingNotes: string;
    correctedCode: string;
    questionScore: number;
  }>;
  motivationalFeedbackHebrew: string;
  rawMarkdownReport: string;
}

// API endpoint to grade the handwritten exam
app.post("/api/evaluate", async (req, res) => {
  try {
    const { images, questionsText, courseName, customRubric } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: "Missing image data. Please upload at least one exam page image.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
    }

    const systemInstruction = `
אתה מעריך מומחה למדעי המחשב ועוזר בדיקה אוטומטי למבחנים שנכתבו בכתב יד.
תפקידך:
1. לנתח תמונות של מבחני מדעי המחשב שנכתבו בכתב יד (כולל טקסט עברי מעורב עם קטעי קוד בשפות כגון Python, Java, C++, C#, JS).
2. לבצע OCR ותעתיק מדויק של הקוד שנכתב בכתב יד.
   - להפריד בין הסברים בעברית לבין לוגיקת הקוד.
   - להתעלם מאי-שלמויות קלות של כתב יד (כמו קו עקום או אות לא מושלמת), אך להבדיל בין שגיאת תחביר אמיתית לבין עמימות שנובעת מכתב יד.
   - להתייחס למחיקות וסימונים של הסטודנט (קווי מחיקה, סימוני חץ וכו').
3. קריטריוני הערכה ומשקלם:
   - נכונות ולוגיקה (50% מהציון): האם הקוד פותר את הבעיה ביעילות ונכונות? האם מטופלים מקרי קצה?
   - תחביר וסמנטיקה (30% מהציון): האם יש שגיאות תחביר או שגיאות סמנטיות תלויות שפה? (יש לגלות הבנה וסלחנות לגבי תקלות קלות האופייניות לכתיבה ביד, כגון חוסר בפסיק-נקודה ; אלא אם זה קריטי לחלוטין לשפה, אך לשים לב להחלפת מתודות כמו stack.push במקום append בפייתון, או השמה של מבנים לא חוקיים).
   - איכות קוד וסגנון (20% מהציון): קריאות, שמות משתנים הולמים, מבנה הגיוני.
4. מגבלות:
   - אם התמונה אינה קריאה כלל או חתוכה בצורה קיצונית שאינה מאפשרת הערכה, סמן isLegible = false ונמק בבירור בעברית (למשל "התמונה אינה קריאה מספיק לבדיקה").
   - שמור על נימה מקצועית, הוגנת, חינוכית ומעודדת בעברית.
5. מבנה הפלט (חובה להחזיר JSON תקין ומדויק בעברית לפי הסכמה):
   - זיהוי פרטי סטודנט (שם, אימייל אם מופיעים בראש הדף).
   - לכל שאלה: תעתיק קוד נקי ב-Markdown, נקודות חוזק, שגיאות ונקודות לתיקון מפורטות צעד-אחר-צעד, הערות פענוח כתב יד, פתרון מתוקן ונקי שעובד.
   - ציון סופי מספרי (0-100) עם פירוט לפי שלושת המרכיבים (50%, 30%, 20%).
   - משוב מסכם ומעודד לסטודנט בעברית תומכת, ברורה ומניעה, המסבירה בדיוק איפה הסטודנט הצליח ואיפה כדאי לשים לב לפעם הבאה.
`;

    const contentsParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Add prompt instructions with question descriptions
    const userPrompt = `
אנא בדוק את דפי המבחן הבאים בכתב יד.
${courseName ? `קורס: ${courseName}` : "קורס: מבני נתונים ואלגוריתמים"}
${customRubric ? `הנחיות ניקוד מיוחדות: ${customRubric}` : ""}

שאלות המבחן הרשמיות לבדיקה מולן:
${questionsText || "בדוק את כל השאלות שמופיעות בדף המבחן."}

בצע תעתיק מדויק של הקוד עבור כל שאלה, נתח חוזקות, שגיאות והערות כתב יד, הצע קוד מתוקן, וחשב ציון מדויק לפי מפתח 50-30-20. החזר גם דו"ח Markdown עשיר ומעוצב בסגנון מקצועי.
`;

    contentsParts.push({ text: userPrompt });

    // Append each image
    for (const img of images) {
      let base64Data = img.data;
      let mimeType = img.mimeType || "image/jpeg";

      if (base64Data.includes(";base64,")) {
        const parts = base64Data.split(";base64,");
        const header = parts[0];
        base64Data = parts[1];
        if (header.includes("image/png")) mimeType = "image/png";
        else if (header.includes("image/webp")) mimeType = "image/webp";
        else if (header.includes("application/pdf")) mimeType = "application/pdf";
      }

      contentsParts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const CANDIDATE_MODELS = [
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
    ];

    let lastError: any = null;
    let responseText: string | undefined;

    for (const modelName of CANDIDATE_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Exam Evaluator] Calling model: ${modelName} (attempt ${attempt})...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: contentsParts },
            config: {
              systemInstruction,
              temperature: 0.2,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  isLegible: {
                    type: Type.BOOLEAN,
                    description: "Whether the handwritten image is legible enough for proper grading.",
                  },
                  illegibleReason: {
                    type: Type.STRING,
                    description: "Explanation if image is unreadable.",
                  },
                  studentName: {
                    type: Type.STRING,
                    description: "Detected student name if written on exam, e.g. Rina Kimmel",
                  },
                  studentEmail: {
                    type: Type.STRING,
                    description: "Detected student email if written on exam",
                  },
                  detectedLanguage: {
                    type: Type.STRING,
                    description: "Detected programming language, e.g. Python, Java, C++",
                  },
                  overallGrade: {
                    type: Type.NUMBER,
                    description: "Final numerical exam grade between 0 and 100",
                  },
                  gradeBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      correctnessScore: {
                        type: Type.NUMBER,
                        description: "Score for logic and correctness (0 to 50)",
                      },
                      syntaxScore: {
                        type: Type.NUMBER,
                        description: "Score for syntax and semantics (0 to 30)",
                      },
                      styleScore: {
                        type: Type.NUMBER,
                        description: "Score for code quality and style (0 to 20)",
                      },
                    },
                    required: ["correctnessScore", "syntaxScore", "styleScore"],
                  },
                  summaryHebrew: {
                    type: Type.STRING,
                    description: "Concise summary of performance in Hebrew",
                  },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        questionNumber: { type: Type.INTEGER },
                        questionTitle: { type: Type.STRING },
                        transcription: {
                          type: Type.STRING,
                          description: "Accurately transcribed code extracted from handwriting in markdown format",
                        },
                        strengths: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "List of things the student did correctly in Hebrew",
                        },
                        errors: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              lineOrLocation: { type: Type.STRING },
                              description: { type: Type.STRING },
                              severity: {
                                type: Type.STRING,
                                enum: ["critical", "warning", "minor"],
                              },
                            },
                            required: ["description", "severity"],
                          },
                          description: "Step-by-step bugs, syntax issues, or logic errors in Hebrew",
                        },
                        handwritingNotes: {
                          type: Type.STRING,
                          description: "Notes on handwriting legibility, crossed-out sections, or ambiguities in Hebrew",
                        },
                        correctedCode: {
                          type: Type.STRING,
                          description: "Clean, working corrected solution code fixing all errors",
                        },
                        questionScore: {
                          type: Type.NUMBER,
                          description: "Score for this question out of 100",
                        },
                      },
                      required: [
                        "questionNumber",
                        "questionTitle",
                        "transcription",
                        "strengths",
                        "errors",
                        "handwritingNotes",
                        "correctedCode",
                        "questionScore",
                      ],
                    },
                  },
                  motivationalFeedbackHebrew: {
                    type: Type.STRING,
                    description: "Encouraging, supportive note in Hebrew highlighting achievements and guidance",
                  },
                  rawMarkdownReport: {
                    type: Type.STRING,
                    description: "Complete formal Hebrew exam report in Markdown for export and printing",
                  },
                },
                required: [
                  "isLegible",
                  "detectedLanguage",
                  "overallGrade",
                  "gradeBreakdown",
                  "summaryHebrew",
                  "questions",
                  "motivationalFeedbackHebrew",
                  "rawMarkdownReport",
                ],
              },
            },
          });

          if (response.text) {
            responseText = response.text.trim();
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(
            `[Exam Evaluator] Model ${modelName} failed on attempt ${attempt}:`,
            err?.message || err
          );

          const isOverloaded =
            err?.message?.includes("503") ||
            err?.message?.includes("high demand") ||
            err?.message?.includes("UNAVAILABLE") ||
            err?.message?.includes("429");

          if (isOverloaded && attempt < 2) {
            // Wait 1.5s before retry
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } else {
            // Break inner retry to try next model in CANDIDATE_MODELS
            break;
          }
        }
      }

      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Failed to get response from Gemini models.");
    }

    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsedData = JSON.parse(cleanedText);
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Error evaluating exam:", err);
    let errMsg = err.message || String(err);
    if (errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE")) {
      errMsg = "שרתי המודל חווים עומס זמני גבוה (503 High Demand). המערכת ביצעה ניסיונות חוזרים במספר דגמים. אנא לחץ שוב על 'הפעל בדיקה' בעוד מספר שניות.";
    }
    return res.status(500).json({
      error: errMsg,
    });
  }
});

// Serve frontend in dev or prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Exam Evaluator Server] running on http://localhost:${PORT}`);
  });
}

startServer();
