import { toPng } from "html-to-image";

export async function generateShareCard(element: HTMLElement) {
  if (!element) return;

  const dataUrl = await toPng(element, {
    backgroundColor: "#0f0f10",
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = "points-golf-result.png";
  link.href = dataUrl;
  link.click();
  
}