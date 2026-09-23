/**
 * Default questions and authentic sample exam data
 */

export interface QuestionSpec {
  id: string;
  number: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: string;
  constraints: string;
}

export const DEFAULT_QUESTIONS: QuestionSpec[] = [
  {
    id: "q1",
    number: 1,
    title: "Reverse Linked List (היפוך רשימה מקושרת)",
    difficulty: "Easy",
    description: `Given the beginning of a singly linked list head, reverse the list, and return the new beginning of the list.`,
    examples: `Example 1:
Input: head = [0,1,2,3]
Output: [3,2,1,0]

Example 2:
Input: head = []
Output: []`,
    constraints: `0 <= The length of the list <= 1000
-1000 <= Node.val <= 1000`,
  },
  {
    id: "q2",
    number: 2,
    title: "Valid Parentheses (בדיקת תקינות סוגריים)",
    difficulty: "Easy",
    description: `You are given a string s consisting of the following characters: '(', ')', '{', '}', '[' and ']'.
The input string s is valid if and only if:
1. Every open bracket is closed by the same type of close bracket.
2. Open brackets are closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.
Return true if s is a valid string, and false otherwise.`,
    examples: `Example 1:
Input: s = "[]"
Output: true

Example 2:
Input: s = "([{}])"
Output: true

Example 3:
Input: s = "[(])"
Output: false`,
    constraints: `1 <= s.length <= 1000`,
  },
];

/**
 * Creates an authentic high-resolution rendering of Rina Kimmel's handwritten exam
 * on textured notebook paper with natural pen strokes, cursive imperfections,
 * crossed-out lines, and circled question numbers matching the submitted exam.
 */
export function generateSampleExamCanvas(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1700;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Paper background - off-white aged exam notebook sheet
  ctx.fillStyle = "#faf7f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain and margin shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.015)";
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Faint notebook horizontal rule lines
  ctx.strokeStyle = "rgba(180, 200, 220, 0.35)";
  ctx.lineWidth = 1;
  for (let y = 140; y < canvas.height - 80; y += 42) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(canvas.width - 80, y);
    ctx.stroke();
  }

  // Vertical margin line (classic exam sheet)
  ctx.strokeStyle = "rgba(230, 150, 150, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(110, 80);
  ctx.lineTo(110, canvas.height - 60);
  ctx.stroke();

  // Dark blue-black ballpoint pen style
  ctx.strokeStyle = "#1b2838";
  ctx.fillStyle = "#1b2838";

  // Helper for natural handwritten line jitter
  const drawHandwrittenText = (
    text: string,
    x: number,
    y: number,
    size: number = 24,
    bold: boolean = false
  ) => {
    ctx.font = `${bold ? "600 " : ""}${size}px "Chakra Petch", "Courier New", monospace`;
    ctx.save();
    // slight natural slant and offset
    const slant = (Math.random() - 0.5) * 0.03;
    ctx.rotate(slant);
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Helper for crossed-out handwriting line
  const strikeOut = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.save();
    ctx.strokeStyle = "#1c2c3e";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    // wavy scribble strike
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.quadraticCurveTo(midX + (Math.random() - 0.5) * 10, midY - 6, x2, y2);
    ctx.stroke();

    // second aggressive strike
    ctx.beginPath();
    ctx.moveTo(x1 + 5, y1 - 4);
    ctx.lineTo(x2 - 4, y2 + 2);
    ctx.stroke();
    ctx.restore();
  };

  // Header info
  drawHandwrittenText("Rina Kimmel", 170, 95, 36, true);
  drawHandwrittenText("rina.kimmel@grunitech.com", 170, 142, 28);

  // Question 1 mark: circled '1'
  ctx.save();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = "#1b2838";
  ctx.beginPath();
  ctx.ellipse(105, 235, 18, 22, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  drawHandwrittenText("1", 99, 242, 24, true);
  ctx.restore();

  // Question 1 (Valid Parentheses) handwritten code
  drawHandwrittenText("def isValid(s: str) -> bool:", 160, 260, 29);
  drawHandwrittenText("stack = []", 250, 305, 27);

  // Crossed out line: stack = [{: }, (:) , [ : ] ]
  drawHandwrittenText("stack = [{: }, (:) , [ : ] ]", 250, 350, 26);
  strikeOut(245, 342, 590, 342);

  // Revised dict line
  drawHandwrittenText("dict = [{: }, (:) , [ : ] ]", 250, 395, 26);
  drawHandwrittenText("for c in s:", 250, 440, 27);
  drawHandwrittenText("if c in dict:", 330, 485, 27);

  // Crossed out inner loop
  drawHandwrittenText("for i in dictionary:", 380, 530, 25);
  strikeOut(375, 524, 620, 524);

  drawHandwrittenText("if: c = i[1]", 420, 575, 25);
  strikeOut(415, 568, 560, 568);

  drawHandwrittenText("if: i[0] != stack.pop()", 450, 620, 25);
  drawHandwrittenText("return false", 500, 665, 26);

  drawHandwrittenText("else:", 330, 715, 27);
  drawHandwrittenText("stack.push(c)", 410, 755, 27);

  drawHandwrittenText("return true", 250, 805, 27);

  // Question 2 (Reverse Linked List)
  drawHandwrittenText(
    "def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:",
    160,
    910,
    28
  );

  drawHandwrittenText("head = head", 250, 958, 27);
  drawHandwrittenText("ptr = head.next", 250, 1005, 27);

  // Crossed out line
  drawHandwrittenText("prev = NULL", 250, 1052, 25);
  strikeOut(245, 1045, 410, 1045);

  drawHandwrittenText("while ptr != NULL:", 250, 1100, 27);
  drawHandwrittenText("temp_ptr = ptr.next.next", 330, 1148, 27);
  drawHandwrittenText("ptr.next.next = ptr", 330, 1195, 27);
  drawHandwrittenText("temp_ptr.next = ptr.next", 330, 1242, 27);
  drawHandwrittenText("ptr = temp_ptr", 330, 1290, 27);

  drawHandwrittenText("return head", 250, 1420, 28);

  // Stamp / Teacher corner marker placeholder
  ctx.save();
  ctx.strokeStyle = "rgba(180, 0, 0, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(canvas.width - 240, 50, 180, 90);
  ctx.font = 'bold 20px "Chakra Petch", monospace';
  ctx.fillStyle = "rgba(180, 0, 0, 0.5)";
  ctx.fillText("EXAM SHEET #1", canvas.width - 225, 85);
  ctx.font = '14px "Chakra Petch", monospace';
  ctx.fillText("CS AUDIT QUEUE", canvas.width - 215, 115);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.92);
}
