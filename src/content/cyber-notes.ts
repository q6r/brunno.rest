export type CyberNote = { filename: string; japanese: string; content: string; asciiId?: string };

export const cyberNoteFiles = [
  { filename: "Exploit.md", japanese: "脆弱性の検証" },
  { filename: "IDOR.md", japanese: "アクセス制御" },
  { filename: "XSS.md", japanese: "スクリプト注入" },
  { filename: "SQLi.md", japanese: "データと命令" },
  { filename: "SSRF.md", japanese: "信頼の境界" },
  { filename: "CSRF.md", japanese: "リクエスト偽造", asciiId: "lain" },
  { filename: "PathTraversal.md", japanese: "パストラバーサル", asciiId: "riri" },
] as const;
