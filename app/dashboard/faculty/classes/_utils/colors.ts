export function getClassColor(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate base hue from hash
  const hue = Math.abs(hash % 360);
  
  // Return HSL values
  return {
    hue,
    base: `hsl(${hue}, 85%, 45%)`,
    light: `hsl(${hue}, 85%, 60%)`,
    dark: `hsl(${hue}, 85%, 30%)`,
    subtle: `hsla(${hue}, 85%, 45%, 0.1)`,
    gradient: `linear-gradient(to bottom right, hsl(${hue}, 85%, 45%), hsl(${(hue + 40) % 360}, 85%, 45%))`,
    transparentGradient: `linear-gradient(to bottom, hsl(${hue}, 85%, 45%) 0%, transparent 100%)`,
  };
}
