import React, { useState, useEffect } from "react";
import { Header } from "./components/Header.tsx";
import { ExamUploader, ExamPage } from "./components/ExamUploader.tsx";
import { QuestionEditor } from "./components/QuestionEditor.tsx";
import { EvaluationProgress } from "./components/EvaluationProgress.tsx";
import { EvaluationResult } from "./components/EvaluationResult.tsx";
import { DEFAULT_QUESTIONS, QuestionSpec, generateSampleExamCanvas } from "./sampleExam.ts";
import { ExamEvaluationResponse } from "../server.ts";
import { Play, Sparkles, BookOpen, Clock, Trash2, History, AlertTriangle, ChevronRight } from "lucide-react";

export default function App() {
  const [pages, setPages] = useState<ExamPage[]>([]);
  const [questions, setQuestions] = useState<QuestionSpec[]>(DEFAULT_QUESTIONS);
  const [courseName, setCourseName] = useState<string>("מבני נתונים ואלגוריתמים (Data Structures)");
  const [customRubric, setCustomRubric] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<ExamEvaluationResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; timestamp: string; studentName?: string; grade: number; result: ExamEvaluationResponse }>>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cs_eval_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load history from storage", e);
    }

    // Auto-load the sample exam on initial load for instant demonstration!
    try {
      const sampleDataUrl = generateSampleExamCanvas();
      setPages([
        {
          id: "initial_sample_rina",
          dataUrl: sampleDataUrl,
          name: "מבחן_לדוגמה_רינה_קימל_עמוד1.jpg",
          rotation: 0,
        },
      ]);
    } catch (e) {
      console.warn("Could not auto-generate sample exam canvas", e);
    }
  }, []);

  const saveToHistory = (res: ExamEvaluationResponse) => {
    try {
      const item = {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toLocaleString("he-IL"),
        studentName: res.studentName || "רינה קימל",
        grade: res.overallGrade,
        result: res,
      };
      const updated = [item, ...history.slice(0, 19)];
      setHistory(updated);
      localStorage.setItem("cs_eval_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to history", e);
    }
  };

  const handleRunEvaluation = async () => {
    if (pages.length === 0) {
      alert("אנא העלה לפחות עמוד אחד של מבחן (או לחץ על 'טען מבחן לדוגמה').");
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);
    setEvaluationResult(null);

    // Prepare questions text
    const formattedQuestionsText = questions
      .map(
        (q, idx) => `
שאלה ${idx + 1}: ${q.title} (${q.difficulty})
תיאור הדרישות: ${q.description}
${q.examples ? `דוגמאות:\n${q.examples}` : ""}
${q.constraints ? `מגבלות:\n${q.constraints}` : ""}
`
      )
      .join("\n--------------------------\n");

    try {
      const imagesPayload = pages.map((p) => ({
        data: p.dataUrl,
        mimeType: "image/jpeg",
      }));

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: imagesPayload,
          questionsText: formattedQuestionsText,
          courseName,
          customRubric,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data: ExamEvaluationResponse = await res.json();
      setEvaluationResult(data);
      saveToHistory(data);

      // Scroll to top of results smoothly
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Evaluation failed:", err);
      setEvalError(err.message || "שגיאה בתקשורת עם שרת ההערכה.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setEvaluationResult(null);
    setEvalError(null);
  };

  const handleClearHistory = () => {
    if (confirm("האם למחוק את כל היסטוריית המבחנים שנבדקו?")) {
      setHistory([]);
      localStorage.removeItem("cs_eval_history");
    }
  };

  return (
    <div className="min-h-screen bg-industrial-grid text-neutral-900 flex flex-col font-hebrew">
      {/* Top Retro-Brutalist Header */}
      <Header
        status={isEvaluating ? "evaluating" : evaluationResult ? "completed" : "idle"}
        evaluatedCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Bar / History Link */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#e8e4d8] border-2 border-black p-2.5 shadow-[3px_3px_0_#000]">
          <div className="flex items-center gap-2 text-xs font-mono-code">
            <span className="font-bold uppercase tracking-wide bg-black text-[#ffea00] px-2 py-0.5">
              מצב בדיקה
            </span>
            <span className="text-neutral-700">
              {evaluationResult ? "צפייה בגיליון ציון סופי" : "הזנת דפי בחינה ומפתח שאלות"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="brutalist-button text-xs font-mono-code font-bold bg-white hover:bg-neutral-100 px-3 py-1 flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>היסטוריית מבחנים ({history.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Error Banner if any */}
        {evalError && (
          <div className="brutalist-card p-4 bg-red-100 border-red-700 text-red-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-700 mt-0.5" />
            <div className="space-y-1 text-sm font-hebrew">
              <div className="font-bold">שגיאה בתהליך ההערכה:</div>
              <div>{evalError}</div>
              <button
                type="button"
                onClick={handleRunEvaluation}
                className="mt-2 brutalist-button text-xs font-mono-code font-bold bg-red-700 text-white px-3 py-1"
              >
                נסה שוב כעת
              </button>
            </div>
          </div>
        )}

        {/* Progress Terminal when running */}
        {isEvaluating && <EvaluationProgress totalPages={pages.length} />}

        {/* Evaluation Result View */}
        {evaluationResult && !isEvaluating ? (
          <EvaluationResult
            result={evaluationResult}
            courseName={courseName}
            onReset={handleReset}
          />
        ) : !isEvaluating ? (
          /* Input & Setup Workspace */
          <div className="space-y-6">
            {/* Action Callout Banner */}
            <div className="brutalist-card p-4 sm:p-5 bg-[#fffae0] border-3 border-black shadow-[4px_4px_0_#000] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-black" />
                  <h2 className="font-display font-black text-lg sm:text-xl uppercase">
                    הערכה חכמה של מבחני מדעי המחשב בכתב יד
                  </h2>
                </div>
                <p className="font-hebrew text-xs sm:text-sm text-neutral-700 mt-1 max-w-2xl">
                  העלה סריקה או צילום של דף המבחן (תמונה או PDF). המערכת תפענח את הקוד, תפריד בין הסברים בעברית ללוגיקה, תבצע ניתוח מעמיק ותספק ציון לפי מפתח (50% לוגיקה, 30% תחביר, 20% סגנון).
                </p>
              </div>

              {/* Big Run Evaluation Button */}
              <button
                type="button"
                onClick={handleRunEvaluation}
                disabled={pages.length === 0 || isEvaluating}
                className="brutalist-button bg-black hover:bg-neutral-800 text-[#ffea00] font-display text-base sm:text-lg font-black px-6 py-3.5 flex items-center gap-2.5 shadow-[4px_4px_0_#ffea00] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                <Play className="w-5 h-5 fill-[#ffea00]" />
                <span>הפעל בדיקה אוטומטית (RUN EVALUATION)</span>
              </button>
            </div>

            {/* Exam Uploader (Images / PDFs / Presets) */}
            <ExamUploader
              pages={pages}
              onPagesChange={setPages}
              isEvaluating={isEvaluating}
            />

            {/* Question Spec & Rubric Editor */}
            <QuestionEditor
              questions={questions}
              onQuestionsChange={setQuestions}
              courseName={courseName}
              onCourseNameChange={setCourseName}
            />

            {/* Bottom Evaluation Action Trigger */}
            <div className="brutalist-card p-5 bg-[#121316] text-white flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-display font-bold text-base text-[#ffea00]">
                  מוכן להפעלת מנוע הבדיקה?
                </div>
                <p className="font-mono-code text-xs text-neutral-400">
                  {pages.length} דפי בחינה טעונים // {questions.length} שאלות במפתח הבדיקה
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunEvaluation}
                disabled={pages.length === 0 || isEvaluating}
                className="brutalist-button bg-[#ffea00] hover:bg-yellow-300 text-black font-display text-base font-black px-8 py-3 flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>התחל בדיקת מבחן</span>
              </button>
            </div>
          </div>
        ) : null}
      </main>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="brutalist-card bg-white max-w-2xl w-full max-h-[85vh] flex flex-col p-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg uppercase">
                  היסטוריית מבחנים שנבדקו ({history.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="brutalist-button text-xs font-mono-code px-2 py-1 bg-red-100 text-red-800"
                >
                  נקה היסטוריה
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="brutalist-button text-xs font-mono-code px-2.5 py-1 bg-black text-white"
                >
                  סגור
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-black p-3 bg-[#faf8f2] hover:bg-[#fff9e6] flex items-center justify-between gap-3 cursor-pointer transition-colors shadow-[2px_2px_0_#000]"
                  onClick={() => {
                    setEvaluationResult(item.result);
                    setShowHistoryModal(false);
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="font-display font-bold text-sm text-neutral-900">
                      {item.studentName || "סטודנט ללא שם"}
                    </div>
                    <div className="font-mono-code text-[11px] text-neutral-500">
                      תאריך: {item.timestamp}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="font-digital text-2xl font-black px-2.5 py-0.5 bg-black text-[#ffea00] border border-black">
                      {Math.round(item.grade)}
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Industrial Footer */}
      <footer className="no-print border-t-3 border-black bg-[#121316] text-neutral-400 py-4 px-4 text-center font-mono-code text-xs mt-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#ffea00]">
            <span className="font-bold">CS-EVAL // COMPUTER SCIENCE EXAM GRADER</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-300">בדיקת מבחני קוד בכתב יד בעברית ואנגלית</span>
          </div>
          <div className="text-neutral-500 text-[11px]">
            מופעל באמצעות מודל Gemini Multimodal // שקלול ציונים: 50% לוגיקה, 30% תחביר, 20% סגנון
          </div>
        </div>
      </footer>
    </div>
  );
}
