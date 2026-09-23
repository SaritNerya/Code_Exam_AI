import React, { useRef, useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Camera,
  Trash2,
  RotateCw,
  Eye,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { processFileToImages } from "../pdfHelper.ts";
import { generateSampleExamCanvas } from "../sampleExam.ts";

export interface ExamPage {
  id: string;
  dataUrl: string;
  name: string;
  rotation: number;
}

interface ExamUploaderProps {
  pages: ExamPage[];
  onPagesChange: (pages: ExamPage[]) => void;
  isEvaluating: boolean;
}

export const ExamUploader: React.FC<ExamUploaderProps> = ({
  pages,
  onPagesChange,
  isEvaluating,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Zoom preview modal
  const [previewPage, setPreviewPage] = useState<ExamPage | null>(null);

  // Clean up camera on unmount or close
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);
    setErrorMessage(null);

    const newPages: ExamPage[] = [];

    try {
      for (const file of Array.from(files)) {
        const imageList = await processFileToImages(file);
        imageList.forEach((imgUrl, index) => {
          newPages.push({
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            dataUrl: imgUrl,
            name: `${file.name}${imageList.length > 1 ? ` (עמוד ${index + 1})` : ""}`,
            rotation: 0,
          });
        });
      }

      onPagesChange([...pages, ...newPages]);
    } catch (err: any) {
      console.error("Error processing file:", err);
      setErrorMessage(err.message || "שגיאה בטעינת הקובץ. אנא נסה שוב.");
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleLoadSample = () => {
    try {
      const sampleDataUrl = generateSampleExamCanvas();
      const samplePage: ExamPage = {
        id: "sample_rina_kimmel",
        dataUrl: sampleDataUrl,
        name: "מבחן לדוגמה - רינה קימל (דף 1).jpg",
        rotation: 0,
      };
      onPagesChange([samplePage]);
      setErrorMessage(null);
    } catch (err) {
      console.error("Failed to generate sample canvas:", err);
    }
  };

  const handleRotatePage = (id: string) => {
    onPagesChange(
      pages.map((p) => {
        if (p.id === id) {
          const newRot = (p.rotation + 90) % 360;
          return { ...p, rotation: newRot };
        }
        return p;
      })
    );
  };

  const handleDeletePage = (id: string) => {
    onPagesChange(pages.filter((p) => p.id !== id));
  };

  // Web Camera Capture
  const handleStartCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      alert("לא ניתן לגשת למצלמה: " + (err.message || "חסרות הרשאות"));
      setIsCameraOpen(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const capturedPage: ExamPage = {
        id: `cam_${Date.now()}`,
        dataUrl,
        name: `צילום מבחן ${pages.length + 1}.jpg`,
        rotation: 0,
      };
      onPagesChange([...pages, capturedPage]);
    }
    handleCloseCamera();
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  return (
    <div className="brutalist-card p-4 sm:p-5 bg-white mb-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3 mb-4">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-black" />
          <h2 className="font-display font-black text-lg tracking-wide uppercase">
            קליטת דפי מבחן בכתב יד (HANDWRITTEN EXAM SCAN / UPLOAD)
          </h2>
          <span className="bg-black text-[#ffea00] font-mono-code text-xs px-2 py-0.5 font-bold">
            {pages.length} עמודים טעונים
          </span>
        </div>

        {/* Quick 1-Click Sample Exam button */}
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isEvaluating}
          className="brutalist-button bg-[#ffea00] hover:bg-yellow-300 text-black font-mono-code text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="טען מיד את המבחן המצורף של רינה קימל"
        >
          <Zap className="w-4 h-4 text-black fill-black" />
          <span>⚡ טען מבחן לדוגמה (רינה קימל)</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 bg-red-100 border-2 border-red-600 text-red-900 p-3 flex items-center gap-2 font-mono-code text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`border-3 border-dashed p-6 sm:p-8 text-center transition-colors ${
          isDragging
            ? "border-black bg-[#ffea00]/20"
            : "border-neutral-500 bg-[#faf8f4] hover:bg-[#f5f1e8]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 bg-black text-[#ffea00] mx-auto flex items-center justify-center border-2 border-black shadow-[3px_3px_0_#000]">
            <FileText className="w-7 h-7" />
          </div>

          <div>
            <p className="font-display font-bold text-base sm:text-lg uppercase">
              גרור לכאן תמונות של המבחן (PNG, JPG) או קובץ PDF
            </p>
            <p className="font-hebrew text-xs sm:text-sm text-neutral-600 mt-1">
              המערכת מפענחת אוטומטית טקסט עברי וקטעי קוד בשפות שונות, מחלצת מחלקות ופונקציות
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFiles || isEvaluating}
              className="brutalist-button bg-black text-white hover:bg-neutral-800 font-mono-code text-xs sm:text-sm font-bold px-4 py-2 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>בחר קובץ מהמחשב...</span>
            </button>

            <button
              type="button"
              onClick={handleStartCamera}
              disabled={isProcessingFiles || isEvaluating}
              className="brutalist-button bg-white text-black hover:bg-neutral-100 font-mono-code text-xs sm:text-sm font-bold px-4 py-2 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>צלם במצלמה (Camera)</span>
            </button>
          </div>

          {isProcessingFiles && (
            <p className="text-xs font-mono-code font-bold text-amber-700 animate-pulse pt-2">
              מעבד קובץ וממיר עמודים לרזולוציית בדיקה...
            </p>
          )}
        </div>
      </div>

      {/* Pages Thumbnail Strip */}
      {pages.length > 0 && (
        <div className="mt-5 border-t-2 border-black pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono-code font-bold text-xs uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>דפי מבחן מוכנים לבדיקה ({pages.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => onPagesChange([])}
              className="text-xs font-mono-code text-red-600 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>נקה את כל הדפים</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {pages.map((p, index) => (
              <div
                key={p.id}
                className="brutalist-card p-2 bg-[#fbfaf6] relative group flex flex-col justify-between"
              >
                {/* Badge */}
                <div className="absolute top-1.5 right-1.5 bg-black text-white font-mono-code text-[10px] font-bold px-1.5 py-0.5 z-10">
                  עמוד {index + 1}
                </div>

                {/* Thumbnail Preview */}
                <div
                  className="aspect-[3/4] bg-neutral-200 overflow-hidden border border-black flex items-center justify-center cursor-pointer relative"
                  onClick={() => setPreviewPage(p)}
                >
                  <img
                    src={p.dataUrl}
                    alt={p.name}
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="w-full h-full object-contain transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-mono-code font-bold transition-opacity">
                    <Eye className="w-5 h-5 mr-1" />
                    <span>הגדל</span>
                  </div>
                </div>

                {/* Name and Toolbar */}
                <div className="mt-2 space-y-1.5">
                  <div className="text-[11px] font-mono-code truncate text-neutral-800" title={p.name}>
                    {p.name}
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-dashed border-neutral-300">
                    <button
                      type="button"
                      onClick={() => handleRotatePage(p.id)}
                      className="brutalist-button p-1 bg-white hover:bg-neutral-100 text-black"
                      title="סובב ב-90 מעלות עם כיוון השעון"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPage(p)}
                      className="brutalist-button p-1 bg-white hover:bg-neutral-100 text-black"
                      title="הצג בגודל מלא"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePage(p.id)}
                      className="brutalist-button p-1 bg-red-100 hover:bg-red-200 text-red-700"
                      title="מחק דף זה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="brutalist-card bg-white max-w-4xl w-full max-h-[90vh] flex flex-col p-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="font-mono-code font-bold text-sm">{previewPage.name}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRotatePage(previewPage.id)}
                  className="brutalist-button text-xs font-mono-code px-2 py-1 bg-neutral-100 flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>סובב</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPage(null)}
                  className="brutalist-button text-xs font-mono-code px-2 py-1 bg-black text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-neutral-900 p-2 flex items-center justify-center">
              <img
                src={previewPage.dataUrl}
                alt={previewPage.name}
                style={{ transform: `rotate(${previewPage.rotation}deg)` }}
                className="max-h-[75vh] object-contain shadow-2xl transition-transform"
              />
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="brutalist-card bg-white max-w-2xl w-full p-4 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-bold text-base uppercase flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <span>צילום דף מבחן באמצעות מצלמה</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseCamera}
                className="brutalist-button p-1 bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden border-2 border-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-4 border-2 border-dashed border-[#ffea00] pointer-events-none opacity-60 flex items-center justify-center">
                <span className="font-mono-code text-xs bg-black/70 text-[#ffea00] px-2 py-1">
                  מקם את דף המבחן בתוך המסגרת
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseCamera}
                className="brutalist-button px-4 py-2 font-mono-code text-sm font-bold bg-neutral-200"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="brutalist-button px-6 py-2 font-display text-base font-black bg-[#ffea00] hover:bg-yellow-300 text-black flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>לכוד תמונה (Capture)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
