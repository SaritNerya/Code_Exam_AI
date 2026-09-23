import React from "react";
import { Terminal, ShieldAlert, Cpu, Award } from "lucide-react";

interface HeaderProps {
  status: "idle" | "evaluating" | "completed";
  evaluatedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ status, evaluatedCount }) => {
  return (
    <header className="border-b-4 border-black bg-[#ffea00] text-black shadow-[0_4px_0_#000]">
      {/* Top hazard tape */}
      <div className="h-3 w-full hazard-stripes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black text-[#ffea00] border-2 border-black flex items-center justify-center font-digital text-3xl font-black shadow-[2px_2px_0_#fff]">
            CS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight uppercase">
                בודק מבחנים ממוחשב // CS-EVAL 2.4
              </h1>
              <span className="hidden sm:inline-block bg-black text-[#ffea00] font-mono-code text-xs px-2 py-0.5 font-bold uppercase">
                HEBREW OCR &amp; CODE AUDIT
              </span>
            </div>
            <p className="text-xs sm:text-sm font-hebrew font-medium text-neutral-800">
              מערכת בינה מלאכותית מומחית להערכת מבחני קוד בכתב יד, חילוץ תחביר ומתן משוב מקצועי
            </p>
          </div>
        </div>

        {/* Status Indicators & Metadata */}
        <div className="flex items-center gap-3 font-mono-code text-xs">
          <div className="flex items-center gap-1.5 bg-black text-white px-2.5 py-1.5 border border-black shadow-[2px_2px_0_#333]">
            <span
              className={`w-2.5 h-2.5 rounded-none ${
                status === "evaluating"
                  ? "bg-[#ffea00] animate-ping"
                  : status === "completed"
                  ? "bg-[#00ff66]"
                  : "bg-neutral-500"
              }`}
            />
            <span className="font-bold uppercase tracking-wider">
              {status === "evaluating" ? "מנתח..." : status === "completed" ? "נבדק בהצלחה" : "מוכן לקליטה"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/80 border-2 border-black px-2.5 py-1 text-black font-semibold">
            <Award className="w-3.5 h-3.5 text-black" />
            <span>מבחנים בזיכרון: {evaluatedCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
