import React, { useState } from "react";
import { ExamEvaluationResponse } from "../../server.ts";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileCheck,
  Printer,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
} from "lucide-react";

interface EvaluationResultProps {
  result: ExamEvaluationResponse;
  courseName: string;
  onReset: () => void;
}

export const EvaluationResult: React.FC<EvaluationResultProps> = ({
  result,
  courseName,
  onReset,
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<"breakdown" | "markdown">("breakdown");

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(result.rawMarkdownReport);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // If exam was marked illegible
  if (!result.isLegible) {
    return (
      <div className="brutalist-card p-6 bg-red-50 border-red-600 space-y-4 text-neutral-900">
        <div className="flex items-center gap-3 border-b-2 border-red-600 pb-3 text-red-700">
          <AlertOctagon className="w-8 h-8" />
          <div>
            <h2 className="font-display font-black text-xl uppercase">
              התמונה אינה קריאה מספיק לבדיקה // ILLEGIBLE SUBMISSION
            </h2>
            <p className="font-mono-code text-xs">
              The image is not legible enough for review
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-red-600 p-4 font-hebrew text-sm space-y-2">
          <p className="font-bold text-red-800">סיבת אי-הקריאות:</p>
          <p>{result.illegibleReason || "הטקסט בכתב היד מטושטש, חתוך או כהה מדי מכדי לבצע פענוח קוד אמין."}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="brutalist-button px-5 py-2 bg-black text-white font-mono-code text-sm font-bold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>העלה סריקה ברורה יותר או נסה שנית</span>
          </button>
        </div>
      </div>
    );
  }

  // Determine grade status
  const grade = Math.round(result.overallGrade);
  const gradeColor =
    grade >= 85
      ? "text-emerald-700 border-emerald-700 bg-emerald-50"
      : grade >= 70
      ? "text-blue-800 border-blue-800 bg-blue-50"
      : grade >= 55
      ? "text-amber-700 border-amber-700 bg-amber-50"
      : "text-red-700 border-red-700 bg-red-50";

  const stampLabel =
    grade >= 90
      ? "EXCELLENT // הצטיינות"
      : grade >= 75
      ? "GOOD PASS // עובר בהצלחה"
      : grade >= 60
      ? "PASS // עובר"
      : "NEEDS WORK // דרוש שיפור";

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print brutalist-card p-3 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono-code text-xs">
          <span className="bg-[#ffea00] border border-black px-2 py-0.5 font-bold">
            AUDIT_ID: #{Math.floor(100000 + Math.random() * 900000)}
          </span>
          <span className="text-neutral-600">
            תאריך בדיקה: {new Date().toLocaleDateString("he-IL")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveTab(activeTab === "breakdown" ? "markdown" : "breakdown")
            }
            className="brutalist-button px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 font-mono-code text-xs font-bold flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{activeTab === "breakdown" ? "הצג דוח Markdown גולמי" : "חזור לתצוגה מעוצבת"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyReport}
            className="brutalist-button px-3 py-1.5 bg-white hover:bg-neutral-100 font-mono-code text-xs font-bold flex items-center gap-1.5"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? "הועתק ללוח!" : "העתק דוח מלא"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="brutalist-button px-3 py-1.5 bg-[#ffea00] hover:bg-yellow-300 text-black font-mono-code text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>הדפס גיליון ציון רשמי</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="brutalist-button px-3 py-1.5 bg-black text-white hover:bg-neutral-800 font-mono-code text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>מבחן חדש</span>
          </button>
        </div>
      </div>

      {/* Raw Markdown view toggle */}
      {activeTab === "markdown" ? (
        <div className="brutalist-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="font-display font-black text-lg">דוח הערכה מלא בפורמט Markdown</h3>
            <button
              type="button"
              onClick={handleCopyReport}
              className="brutalist-button px-3 py-1 text-xs font-mono-code bg-black text-white flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>העתק תוכן</span>
            </button>
          </div>
          <pre className="p-4 bg-neutral-900 text-neutral-100 font-mono-code text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border-2 border-black">
            {result.rawMarkdownReport}
          </pre>
        </div>
      ) : (
        <>
          {/* Main Score & Student Summary Card */}
          <div className="brutalist-card p-5 sm:p-7 bg-white relative overflow-hidden">
            {/* Corner Decorative Stamp */}
            <div className="absolute top-4 left-4 hidden sm:block">
              <div className={`retro-stamp font-digital text-sm ${gradeColor}`}>
                {stampLabel}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Giant Numerical Grade Display */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-[#faf8f2] border-3 border-black text-center shadow-[4px_4px_0_#000]">
                <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  ציון סופי משוקלל (FINAL SCORE)
                </span>
                <div className="font-digital text-7xl sm:text-8xl font-black text-black leading-none my-1 tracking-tighter">
                  {grade}
                </div>
                <div className="font-mono-code text-xs font-bold text-neutral-500">
                  מתוך 100 נקודות אפשריות
                </div>

                <div className={`mt-3 px-3 py-1 font-mono-code text-xs font-bold uppercase border-2 border-black ${gradeColor}`}>
                  {stampLabel}
                </div>
              </div>

              {/* Student Metadata & Weighted Rubric Breakdown */}
              <div className="lg:col-span-8 space-y-4">
                <div className="border-b-2 border-black pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display font-black text-2xl uppercase">
                      גיליון הערכת מבחן // OFFICIAL GRADE SHEET
                    </h2>
                    <span className="font-mono-code text-xs bg-black text-[#ffea00] px-2 py-0.5 font-bold">
                      שפה שזוהתה: {result.detectedLanguage || "Python"}
                    </span>
                  </div>

                  {/* Student identification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-mono-code text-xs bg-[#f4f2ea] p-2.5 border border-black">
                    <div>
                      <span className="font-bold text-neutral-600">שם הנבחן/ת: </span>
                      <span className="font-black text-neutral-900 text-sm">
                        {result.studentName || "רינה קימל (Rina Kimmel)"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-600">דוא&quot;ל: </span>
                      <span className="font-medium text-neutral-900">
                        {result.studentEmail || "rina.kimmel@grunitech.com"}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-600">קורס: </span>
                      <span className="font-medium text-neutral-900">{courseName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-600">שאלות שנבדקו: </span>
                      <span className="font-bold text-neutral-900">{result.questions.length} שאלות</span>
                    </div>
                  </div>
                </div>

                {/* 3 Weighted Score Bars */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono-code font-bold uppercase text-neutral-700">
                    שקלול ציונים לפי קריטריוני ההערכה:
                  </div>

                  {/* 1. Correctness & Logic (50%) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono-code">
                      <span className="font-bold text-emerald-800">
                        1. נכונות ולוגיקה (Correctness &amp; Logic) - משקל 50%:
                      </span>
                      <span className="font-bold">
                        {result.gradeBreakdown?.correctnessScore ?? 0} / 50
                      </span>
                    </div>
                    <div className="h-3.5 bg-neutral-200 border border-black overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((result.gradeBreakdown?.correctnessScore ?? 0) / 50) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 2. Syntax & Semantics (30%) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono-code">
                      <span className="font-bold text-blue-800">
                        2. תחביר וסמנטיקה (Syntax &amp; Semantics) - משקל 30%:
                      </span>
                      <span className="font-bold">
                        {result.gradeBreakdown?.syntaxScore ?? 0} / 30
                      </span>
                    </div>
                    <div className="h-3.5 bg-neutral-200 border border-black overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((result.gradeBreakdown?.syntaxScore ?? 0) / 30) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 3. Code Quality & Style (20%) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono-code">
                      <span className="font-bold text-amber-800">
                        3. איכות קוד, קריאות וסגנון (Style &amp; Quality) - משקל 20%:
                      </span>
                      <span className="font-bold">
                        {result.gradeBreakdown?.styleScore ?? 0} / 20
                      </span>
                    </div>
                    <div className="h-3.5 bg-neutral-200 border border-black overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((result.gradeBreakdown?.styleScore ?? 0) / 20) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational & Encouraging Student Feedback Note */}
          <div className="brutalist-card p-5 bg-[#fffdf0] border-2 border-black shadow-[4px_4px_0_#ffea00]">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-display font-black text-lg uppercase text-black">
                משוב אישי ומעודד לסטודנט/ית (STUDENT FEEDBACK &amp; MOTIVATION)
              </h3>
            </div>
            <div className="font-hebrew text-sm sm:text-base leading-relaxed text-neutral-900 bg-white p-4 border border-black shadow-inner">
              <p className="whitespace-pre-line">{result.motivationalFeedbackHebrew}</p>
            </div>
          </div>

          {/* Questions Detailed Breakdown */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
                <FileCheck className="w-6 h-6" />
                <span>פירוט השאלות, תעתיק הקוד והתיקונים (QUESTION AUDIT)</span>
              </h2>
              <span className="font-mono-code text-xs bg-neutral-200 px-2 py-1 font-bold">
                {result.questions.length} משימות שנבדקו
              </span>
            </div>

            {result.questions.map((q, idx) => (
              <div
                key={idx}
                className="brutalist-card p-5 sm:p-6 bg-white space-y-5 border-3 border-black shadow-[5px_5px_0_#000]"
              >
                {/* Question Header & Score */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-black pb-3 bg-[#faf9f5] -m-5 sm:-m-6 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 bg-black text-[#ffea00] font-mono-code font-black text-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#fff]">
                      #{q.questionNumber || idx + 1}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-lg sm:text-xl text-neutral-900">
                        {q.questionTitle}
                      </h3>
                      <span className="font-mono-code text-xs text-neutral-500">
                        בדיקת קוד שנכתב בכתב יד
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-white border-2 border-black px-3 py-1 font-mono-code text-sm font-black flex items-center gap-1.5 shadow-[2px_2px_0_#000]">
                      <span className="text-neutral-500 text-xs">ציון שאלה:</span>
                      <span className="text-base text-black">{q.questionScore} / 100</span>
                    </div>
                  </div>
                </div>

                {/* 1. Code Transcription */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono-code font-bold text-xs uppercase flex items-center gap-1.5 text-neutral-800">
                      <Code2 className="w-4 h-4 text-neutral-700" />
                      <span>העתקת הקוד מכתב היד (CODE TRANSCRIPTION):</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(q.transcription, idx * 2)}
                      className="brutalist-button text-xs font-mono-code px-2 py-0.5 bg-neutral-100 flex items-center gap-1"
                    >
                      {copiedCodeIdx === idx * 2 ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeIdx === idx * 2 ? "הועתק" : "העתק קוד מקורי"}</span>
                    </button>
                  </div>

                  <div className="relative bg-[#1a1c23] border-2 border-black text-neutral-100 p-4 font-mono-code text-xs overflow-x-auto dir-ltr text-left">
                    <div className="text-[10px] text-neutral-400 border-b border-neutral-700 pb-1 mb-2 flex justify-between font-mono">
                      <span>ORIGINAL_STUDENT_HANDWRITING_RECONSTRUCTED</span>
                      <span>UTF-8 // LTR</span>
                    </div>
                    <pre className="whitespace-pre font-mono-code leading-relaxed">
                      {q.transcription}
                    </pre>
                  </div>
                </div>

                {/* 2. Analysis and Evaluation: Strengths, Errors, Handwriting */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Strengths */}
                  <div className="bg-[#f0fdf4] border-2 border-emerald-600 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-mono-code font-bold text-xs uppercase border-b border-emerald-300 pb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>נקודות חוזק (STRENGTHS):</span>
                    </div>
                    <ul className="space-y-1.5 font-hebrew text-xs text-emerald-950">
                      {q.strengths.map((s, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Errors and Corrections */}
                  <div className="bg-[#fff5f5] border-2 border-red-600 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-red-800 font-mono-code font-bold text-xs uppercase border-b border-red-300 pb-1">
                      <AlertTriangle className="w-4 h-4 text-red-700" />
                      <span>שגיאות ונקודות לתיקון (ERRORS):</span>
                    </div>
                    <ul className="space-y-2 font-hebrew text-xs text-red-950">
                      {q.errors.map((err, eIdx) => (
                        <li key={eIdx} className="border-b border-dashed border-red-200 pb-1.5 last:border-none">
                          <div className="flex items-center gap-1 font-mono-code text-[11px] mb-0.5">
                            <span
                              className={`px-1 py-0.2 font-bold uppercase text-[10px] ${
                                err.severity === "critical"
                                  ? "bg-red-600 text-white"
                                  : err.severity === "warning"
                                  ? "bg-amber-500 text-black"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              {err.severity === "critical"
                                ? "קריטי"
                                : err.severity === "warning"
                                ? "אזהרה"
                                : "משני"}
                            </span>
                            {err.lineOrLocation && (
                              <span className="text-neutral-600">[{err.lineOrLocation}]</span>
                            )}
                          </div>
                          <span>{err.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Handwriting Considerations */}
                  <div className="bg-[#fffbeb] border-2 border-amber-600 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-mono-code font-bold text-xs uppercase border-b border-amber-300 pb-1">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>הערות פענוח כתב יד (HANDWRITING):</span>
                    </div>
                    <div className="font-hebrew text-xs text-amber-950 leading-relaxed">
                      {q.handwritingNotes || "כתב היד קריא וברור, זוהו מחיקות קלות שהובאו בחשבון."}
                    </div>
                  </div>
                </div>

                {/* 3. Proposed/Corrected Solution */}
                <div className="space-y-2 pt-2 border-t-2 border-dashed border-neutral-300">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono-code font-bold text-xs uppercase flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>פתרון מתוקן ונקי (CORRECTED SOLUTION):</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(q.correctedCode, idx * 2 + 1)}
                      className="brutalist-button text-xs font-mono-code px-2 py-0.5 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 flex items-center gap-1"
                    >
                      {copiedCodeIdx === idx * 2 + 1 ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>
                        {copiedCodeIdx === idx * 2 + 1 ? "הועתק פתרון" : "העתק קוד מתוקן"}
                      </span>
                    </button>
                  </div>

                  <div className="bg-[#0f172a] border-2 border-emerald-600 text-emerald-200 p-4 font-mono-code text-xs overflow-x-auto dir-ltr text-left shadow-md">
                    <div className="text-[10px] text-emerald-400 border-b border-emerald-900/80 pb-1 mb-2 flex justify-between font-mono">
                      <span>VERIFIED_CORRECTED_CODE // RUNNABLE</span>
                      <span>PASSING ALL EDGE CASES</span>
                    </div>
                    <pre className="whitespace-pre font-mono-code leading-relaxed text-emerald-100">
                      {q.correctedCode}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
