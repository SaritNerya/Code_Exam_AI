import React, { useState } from "react";
import { QuestionSpec, DEFAULT_QUESTIONS } from "../sampleExam.ts";
import { BookOpen, Plus, Trash2, Edit3, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

interface QuestionEditorProps {
  questions: QuestionSpec[];
  onQuestionsChange: (questions: QuestionSpec[]) => void;
  courseName: string;
  onCourseNameChange: (name: string) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  onQuestionsChange,
  courseName,
  onCourseNameChange,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleResetToDefault = () => {
    onQuestionsChange(DEFAULT_QUESTIONS);
    onCourseNameChange("מבני נתונים ואלגוריתמים (Data Structures)");
  };

  const handleAddQuestion = () => {
    const newNum = questions.length + 1;
    const newQ: QuestionSpec = {
      id: "q_" + Date.now(),
      number: newNum,
      title: `שאלה ${newNum}: בעיית קוד חדשה`,
      difficulty: "Medium",
      description: "תיאור השאלה, הקלט והפלט הנדרשים...",
      examples: "קלט: ... \nפלט: ...",
      constraints: "מגבלות זמן ומקום...",
    };
    onQuestionsChange([...questions, newQ]);
    setEditingId(newQ.id);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<QuestionSpec>) => {
    onQuestionsChange(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert("יש להשאיר לפחות שאלה אחת לבדיקת המבחן.");
      return;
    }
    onQuestionsChange(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="brutalist-card p-4 sm:p-5 bg-white mb-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-black" />
          <h2 className="font-display font-black text-lg tracking-wide uppercase">
            שאלות המבחן ומפתח הבדיקה (EXAM QUESTIONS SPEC)
          </h2>
          <span className="bg-[#ffea00] border border-black font-mono-code text-xs px-2 py-0.5 font-bold">
            {questions.length} שאלות
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="brutalist-button text-xs font-mono-code font-bold bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 flex items-center gap-1.5"
            title="טען מחדש את שאלות המבחן המקוריות (Reverse Linked List + Valid Parentheses)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>איפוס לשאלות המקוריות</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="brutalist-button text-xs font-mono-code font-bold bg-black text-white px-2 py-1 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <span>כווץ</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>הצג שאלות ({questions.length})</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Course Name Input & Weights info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#f7f5ed] border-2 border-black">
            <div className="md:col-span-2">
              <label className="block font-mono-code text-xs font-bold uppercase mb-1">
                שם הקורס / מועד הבחינה:
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => onCourseNameChange(e.target.value)}
                className="w-full bg-white border-2 border-black px-3 py-1.5 font-mono-code text-sm focus:outline-none focus:bg-[#fffae6]"
                placeholder="לדוגמה: מבני נתונים ואלגוריתמים - סמסטר א'"
              />
            </div>
            <div>
              <label className="block font-mono-code text-xs font-bold uppercase mb-1">
                מפתח שקלול הציונים:
              </label>
              <div className="bg-white border-2 border-black p-1.5 font-mono-code text-[11px] leading-tight space-y-0.5">
                <div className="text-emerald-700 font-bold">50% נכונות ולוגיקה (Correctness)</div>
                <div className="text-blue-700 font-bold">30% תחביר וסמנטיקה (Syntax)</div>
                <div className="text-amber-700 font-bold">20% איכות וסגנון (Style &amp; Quality)</div>
              </div>
            </div>
          </div>

          {/* List of questions */}
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isEditing = editingId === q.id;

              return (
                <div
                  key={q.id}
                  className="border-2 border-black bg-white p-3.5 shadow-[2px_2px_0_#000]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-neutral-300 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-black text-white font-mono-code font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <h3 className="font-display font-bold text-base text-neutral-900">
                        {q.title}
                      </h3>
                      <span
                        className={`font-mono-code text-[11px] px-2 py-0.5 font-bold uppercase border border-black ${
                          q.difficulty === "Easy"
                            ? "bg-green-200 text-green-900"
                            : q.difficulty === "Medium"
                            ? "bg-yellow-200 text-yellow-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : q.id)}
                        className="brutalist-button text-xs font-mono-code px-2 py-1 bg-white hover:bg-neutral-100 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? "סגור עריכה" : "ערוך שאלה"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="brutalist-button text-xs font-mono-code px-2 py-1 bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1"
                        title="מחק שאלה זו"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2.5 mt-2 bg-[#fffdf5] p-3 border border-neutral-400">
                      <div>
                        <label className="block text-xs font-mono-code font-bold">
                          כותרת השאלה:
                        </label>
                        <input
                          type="text"
                          value={q.title}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { title: e.target.value })
                          }
                          className="w-full border-2 border-black px-2 py-1 text-sm font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono-code font-bold">
                          תיאור והגדרת הבעיה:
                        </label>
                        <textarea
                          rows={3}
                          value={q.description}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full border-2 border-black px-2 py-1 text-xs font-mono-code"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-mono-code font-bold">
                            דוגמאות (Examples):
                          </label>
                          <textarea
                            rows={3}
                            value={q.examples}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                examples: e.target.value,
                              })
                            }
                            className="w-full border-2 border-black px-2 py-1 text-xs font-mono-code"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono-code font-bold">
                            מגבלות (Constraints):
                          </label>
                          <textarea
                            rows={3}
                            value={q.constraints}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                constraints: e.target.value,
                              })
                            }
                            className="w-full border-2 border-black px-2 py-1 text-xs font-mono-code"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-mono-code text-neutral-800 space-y-1 mt-1">
                      <p className="line-clamp-2">{q.description}</p>
                      {q.examples && (
                        <div className="bg-neutral-50 p-1.5 border border-neutral-200 text-[11px] whitespace-pre-line text-neutral-600">
                          {q.examples.split("\n").slice(0, 3).join("\n")}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full brutalist-button bg-[#ffea00] hover:bg-yellow-300 font-display font-bold py-2 px-3 flex items-center justify-center gap-2 text-sm uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף שאלת מבחן נוספת לטופס</span>
          </button>
        </div>
      )}
    </div>
  );
};
