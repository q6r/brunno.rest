"use client";

import { useRef, useState, type KeyboardEvent, type UIEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cyberAscii, cyberAreas, cyberBio, cyberProfile } from "@/content/cyber";
import { GITHUB_URL } from "@/content/profile";
import { useLang } from "@/hooks/useLang";
import type { Lang } from "@/lib/i18n";
import type { CyberNote } from "@/content/cyber-notes";

function wrapParagraph(text: string) {
  const lines = [""];
  for (const word of text.split(/\s+/)) {
    const last = lines.length - 1;
    if (lines[last] && lines[last].length + word.length + 1 > 82) lines.push(word);
    else lines[last] += `${lines[last] ? " " : ""}${word}`;
  }
  return lines;
}

function initialReadme(art: string, lang: Lang) {
  const about = lang === "pt" ? "Sobre mim" : "About me";
  const interests = lang === "pt" ? "Interesses de estudo" : "Study interests";
  const projects = lang === "pt" ? "Projetos" : "Projects";
  const biography = cyberBio[lang].map((part) => typeof part === "string" ? part : part.label).join("");
  return [
    "```text", art.replace(/^(?:\r?\n)+|(?:\r?\n)+$/g, ""), "```", "",
    "# Brunno / Cybersecurity / 脆弱性", "",
    "> 観察する。理解する。記録する。", "",
    ...wrapParagraph(biography), "",
    "## Table of contents", "",
    `- [${about}](#${lang === "pt" ? "sobre-mim" : "about-me"})`,
    `- [${interests}](#${lang === "pt" ? "interesses-de-estudo" : "study-interests"})`,
    `- [${projects}](#${lang === "pt" ? "projetos" : "projects"})`, "",
    `## ${about}`, "",
    `Stack: ${cyberProfile.stack.join(", ")}.`, "",
    `## ${interests}`, "",
    ...cyberAreas.map((area) => `- **${area[lang].title}**: ${area[lang].description}`), "",
    `## ${projects}`, "",
    `[GitHub / q6r](${GITHUB_URL})`,
  ].join("\n");
}

export function ReadmeEditor({ notes }: { notes: CyberNote[] }) {
  const lang = useLang();
  const files = ["README.md", ...notes.map((note) => note.filename)];
  const [activeFile, setActiveFile] = useState("README.md");
  const [selected, setSelected] = useState(cyberAscii[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const gutter = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const art = cyberAscii.find((item) => item.id === selected) ?? cyberAscii[0];
  const isReadme = activeFile === "README.md";
  const activeNote = notes.find((note) => note.filename === activeFile);
  const activeIndex = files.indexOf(activeFile);
  const draftKey = isReadme ? `${activeFile}:${selected}:${lang}` : activeFile;
  const initialContent = isReadme ? initialReadme(art?.art ?? "", lang)
    : activeNote?.asciiId ? ["```text", cyberAscii.find((item) => item.id === activeNote.asciiId)?.art ?? "", "```", "", activeNote.content].join("\n")
    : activeNote?.content ?? "";
  const value = drafts[draftKey] ?? initialContent;
  const lines = value.split("\n").length;

  function syncScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop;
  }

  function updateCursor() {
    const input = editor.current;
    if (!input) return;
    const before = input.value.slice(0, input.selectionStart).split("\n");
    setCursor({ line: before.length, column: before[before.length - 1].length + 1 });
  }

  function changeArt(id: string) {
    setSelected(id);
    if (editor.current) editor.current.scrollTop = 0;
    if (gutter.current) gutter.current.scrollTop = 0;
    setCursor({ line: 1, column: 1 });
  }

  function changeFile(filename: string) {
    setActiveFile(filename);
    if (editor.current) editor.current.scrollTop = 0;
    if (gutter.current) gutter.current.scrollTop = 0;
    setCursor({ line: 1, column: 1 });
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % files.length
      : event.key === "ArrowLeft" ? (index - 1 + files.length) % files.length
      : event.key === "Home" ? 0 : event.key === "End" ? files.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    changeFile(files[next]);
    const target = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
    target?.focus();
    target?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <Reveal delay={0.2} className="overflow-hidden rounded-lg border border-white/20 bg-[#080808]">
      <div role="tablist" aria-label={lang === "pt" ? "Arquivos Markdown" : "Markdown files"} className="scrollbar-none flex overflow-x-auto border-b border-white/15 bg-[#0c0c0c]">
        {files.map((filename, index) => (
          <button key={filename} type="button" role="tab" id={`cyber-tab-${index}`} aria-controls="cyber-editor-panel" aria-selected={activeFile === filename} tabIndex={activeFile === filename ? 0 : -1} onClick={() => changeFile(filename)} onKeyDown={(event) => navigateTabs(event, index)} className="flex min-h-10 shrink-0 cursor-pointer items-center gap-2 border-r border-white/10 border-t-2 border-t-transparent px-3 font-mono text-[11px] text-neutral-500 outline-none transition-colors hover:bg-white/5 hover:text-neutral-200 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white aria-selected:border-t-white aria-selected:bg-[#171717] aria-selected:text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 3h9l5 5v13H5zM14 3v6h5M8 13h8M8 17h6" /></svg>
            {filename}
            {Object.keys(drafts).some((key) => key === filename || key.startsWith(`${filename}:`)) && <span aria-hidden="true" className="size-1 rounded-full bg-neutral-400" />}
          </button>
        ))}
      </div>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-white/15 bg-[#101010] px-4 py-2">
        <h2 className="flex items-center gap-2 font-mono text-[12px] font-semibold text-neutral-100">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 3h9l5 5v13H5zM14 3v6h5M8 13h8M8 17h6" /></svg>
          {activeFile}
          {drafts[draftKey] !== undefined && <span aria-label={lang === "pt" ? "Editado nesta sessão" : "Edited this session"} className="size-1.5 rounded-full bg-neutral-400" />}
        </h2>
        {isReadme ? <label className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
          ASCII
          <select aria-label={lang === "pt" ? "ASCII do README" : "README ASCII"} value={selected} onChange={(event) => changeArt(event.target.value)} className="max-w-[150px] cursor-pointer rounded border border-white/15 bg-black px-2 py-1 text-neutral-200 outline-none focus-visible:ring-1 focus-visible:ring-white">
            {cyberAscii.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label> : <span lang="ja" className="font-mono text-[11px] tracking-wide text-neutral-400">{activeNote?.japanese}</span>}
      </div>

      <div id="cyber-editor-panel" role="tabpanel" aria-labelledby={`cyber-tab-${activeIndex}`} className="flex h-[610px] min-w-0 sm:h-[700px]">
        <div ref={gutter} aria-hidden="true" className="scrollbar-none w-12 shrink-0 overflow-hidden border-r border-white/10 bg-[#101010] py-4 text-right font-mono text-[12px] leading-[16px] text-neutral-600 select-none">
          {Array.from({ length: lines }, (_, index) => <div key={index} className="pr-3">{index + 1}</div>)}
        </div>
        <textarea
          ref={editor}
          aria-label={lang === "pt" ? `Editor de ${activeFile}` : `${activeFile} editor`}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
          value={value}
          onChange={(event) => setDrafts((previous) => ({ ...previous, [draftKey]: event.target.value }))}
          onScroll={syncScroll}
          onSelect={updateCursor}
          className="scrollbar-none min-w-0 flex-1 resize-none overflow-auto bg-[#080808] p-4 font-mono text-[12px] leading-[16px] whitespace-pre text-neutral-200 caret-white outline-none focus-visible:bg-[#0b0b0b]"
        />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-white/15 bg-[#101010] px-3 py-2 font-mono text-[10px] text-neutral-500">
        <span>{lang === "pt" ? "Edição local · não salva no site" : "Local edits · not saved to the site"}</span>
        <span className="shrink-0">Ln {cursor.line}, Col {cursor.column} <span className="ml-2 hidden sm:inline">UTF-8 · Markdown</span></span>
      </div>
    </Reveal>
  );
}
