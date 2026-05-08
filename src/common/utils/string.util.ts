export function sanitizeVoiceText(text: string): string {
  if (!text) return '';

  let cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  const noise = [
    /\bsearch\s+for\b/g, /\bfind\b/g, /\bshow\s+me\b/g, /\bi\s+want\b/g,
    /\blooking\s+for\b/g, /\bi\s+am\b/g, /\bgive\s+me\b/g, /\bget\s+me\b/g,
    /\bsome\b/g, /\bbrand\b/g, /\bproducts\b/g, /\bitem\b/g, /\bplease\b/g,
    /\bof\b/g, /\bthe\b/g, /\ba\b/g, /\ban\b/g
  ];

  noise.forEach((regex) => {
    cleaned = cleaned.replace(regex, ' ');
  });

  return cleaned.replace(/\s+/g, ' ').trim();
}