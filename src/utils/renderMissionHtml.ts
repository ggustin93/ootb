export function renderMissionHtml(text: string): string {
  const parts: string[] = [];
  let inActionBlock = false;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line === '<!---->') continue;

    if (line.startsWith('📚')) {
      inActionBlock = false;
      parts.push(`<h4 class="font-bold text-[--ootb-turquoise] mt-8 mb-2">${line}</h4>`);
    } else if (line.startsWith('🎓') && /\d/.test(line) && !inActionBlock) {
      parts.push(`<h4 class="font-bold text-[--ootb-turquoise] mt-8 mb-2">${line}</h4>`);
    } else if (
      inActionBlock &&
      (line.startsWith('🏫') || line.startsWith('🏆') || (line.startsWith('🎓') && /\d/.test(line)))
    ) {
      parts.push(`<div class="font-medium text-gray-800 mt-4 mb-2 pl-4">${line}</div>`);
    } else if (line.startsWith('✅')) {
      inActionBlock = true;
      parts.push(`<div class="font-semibold text-gray-900 mt-6 mb-3">${line}</div>`);
    } else if (line.startsWith('🔍') || line.startsWith('📊') || line.startsWith('🎤')) {
      inActionBlock = false;
      parts.push(`<div class="font-semibold text-gray-800 mt-5 mb-2">${line}</div>`);
    } else if (line.startsWith('🔹')) {
      const content = line.slice(2).trim();
      parts.push(
        `<div class="flex gap-2 items-start pl-8 mb-1.5 text-sm text-gray-600 leading-relaxed"><span class="shrink-0 text-[--ootb-turquoise] font-bold">◆</span><span>${content}</span></div>`
      );
    } else if (line.startsWith('✔')) {
      const content = line.replace(/^✔️?\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      parts.push(
        `<div class="flex gap-2 items-start pl-6 mb-1.5 text-gray-700 leading-relaxed"><span class="shrink-0 text-green-500">✓</span><span>${content}</span></div>`
      );
    } else if (line.startsWith('📌')) {
      const content = line.slice(2).trim();
      parts.push(
        `<div class="flex gap-2 items-start pl-4 mb-2 text-gray-700 font-medium"><span class="shrink-0">📌</span><span>${content}</span></div>`
      );
    } else if (line.startsWith('* ')) {
      const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      parts.push(
        `<div class="flex gap-2 items-start pl-2 mb-2 text-gray-700"><span class="shrink-0 text-[--ootb-turquoise] font-bold mt-0.5">•</span><span>${content}</span></div>`
      );
    } else {
      const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      parts.push(`<p class="text-gray-700 mb-3 leading-relaxed">${content}</p>`);
    }
  }

  return parts.join('');
}
