import pdf from "pdf-parse";

export async function extractPdfText(buffer) {
  if (!buffer) return "";
  const { text } = await pdf(buffer);
  return (text || "").replace(/\u0000/g, "").trim();
}
