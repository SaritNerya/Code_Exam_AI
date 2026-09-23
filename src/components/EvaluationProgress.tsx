import React, { useEffect, useState } from "react";
import { Terminal, Cpu, Check, Loader2 } from "lucide-react";

interface EvaluationProgressProps {
  totalPages: number;
}

const STEPS = [
  { id: 1, label: "סריקת OCR וחילוץ קטעי קוד מכתב יד (Hebrew/English Parsing)" },
  { id: 2, label: "אבחנה בין שגיאות תחביר אמיתיות לבין עמימות כתב יד ומחיקות" },
  { id: 3, label: "בדיקת נכונות ולוגיקה אלגוריתמית (משקל 50% מהציון)" },
  { id: 4, label: "בדיקת תחביר וסמנטיקה תלויות שפה (משקל 30% מהציון)" },
  { id: 5, label: "הערכת איכות, שמות משתנים וסגנון קוד (משקל 20% מהציון)" },
  { id: 6, label: "הפקת פתרון מתוקן ונקי וכתיבת משוב מסכם ומעודד בעברית" },
];

export const EvaluationProgress: React.FC<EvaluationProgressProps> = ({ totalPages }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING_EVALUATION_KERNEL...",
    `MOUNTING_DOCUMENTS [TOTAL_PAGES: ${totalPages}]`,
    "INVOKING_MULTIMODAL_OCR_ENGINE [gemini-3.8-flash]...",
  ]);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 2400);

    const logTimer = setInterval(() => {
      const messages = [
        "PARSING_AST_NODES: functions 'isValid', 'reverseList' detected...",
        "ANALYZING_INDENTATION_AND_CONTROL_FLOW...",
        "EVALUATING_EDGE_CASES: empty list, single element, unmatched brackets...",
        "DIFF_ANALYSIS: crossed-out variables and corrected assignments noted...",
        "CALCULATING_WEIGHTED_SCORE: 50/30/20 rubric matrix applied...",
        "SYNTHESIZING_SUPPORTIVE_HEBREW_FEEDBACK...",
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLogs((prev) => [...prev.slice(-6), `> ${randomMsg}`]);
    }, 1900);

    return () => {
      clearInterval(stepTimer);
      clearInterval(logTimer);
    };
  }, [totalPages]);

  return (
    <div className="brutalist-card-dark p-6 mb-8 relative overflow-hidden">
      {/* Top Hazard Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 hazard-stripes" />

      <div className="flex items-center justify-between border-b border-neutral-700 pb-3 mb-5 mt-1">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#ffea00]" />
          <h3 className="font-display font-black text-lg text-white tracking-wider uppercase">
            מעבדת בדיקה אוטומטית בפעולה // EVALUATION IN PROGRESS
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono-code text-xs text-[#ffea00]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>RUNNING AI ENGINE</span>
        </div>
      </div>

      {/* Step checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`p-3 border-2 flex items-start gap-3 transition-colors ${
                isDone
                  ? "border-emerald-500 bg-emerald-950/30 text-emerald-300"
                  : isCurrent
                  ? "border-[#ffea00] bg-[#ffea00]/10 text-white"
                  : "border-neutral-800 bg-neutral-900 text-neutral-500"
              }`}
            >
              <div
                className={`w-5 h-5 flex items-center justify-center shrink-0 text-xs font-mono-code font-bold ${
                  isDone
                    ? "bg-emerald-500 text-black"
                    : isCurrent
                    ? "bg-[#ffea00] text-black animate-pulse"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : step.id}
              </div>

              <div className="text-xs font-hebrew font-medium leading-tight">
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Log Console */}
      <div className="bg-black border border-neutral-800 p-3 font-mono-code text-xs text-[#00ff66] space-y-1 select-none">
        <div className="text-neutral-500 text-[10px] pb-1 border-b border-neutral-900 flex justify-between">
          <span>CONSOLE OUTPUT STREAM // UTF-8</span>
          <span>SPEED: REAL-TIME</span>
        </div>
        {logs.map((log, idx) => (
          <div key={idx} className="leading-tight font-mono-code">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
