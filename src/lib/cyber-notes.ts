import { readFile } from "node:fs/promises";
import path from "node:path";
import { cyberNoteFiles, type CyberNote } from "@/content/cyber-notes";

export async function getCyberNotes(): Promise<CyberNote[]> {
  return Promise.all(cyberNoteFiles.map(async (note) => ({
    ...note,
    content: await readFile(path.join(process.cwd(), "public", "cyber", "notes", note.filename), "utf8"),
  })));
}
