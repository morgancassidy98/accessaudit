import { NextResponse } from 'next/server';

// Parse hex color to RGB
function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 3 && cleaned.length !== 6) return null;
  const full =
    cleaned.length === 3
      ? cleaned.split('').map((c) => c + c).join('')
      : cleaned;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Calculate relative luminance
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// GET /api/contrast?fg=#000000&bg=#ffffff
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fg = searchParams.get('fg');
    const bg = searchParams.get('bg');

    if (!fg || !bg) {
      return NextResponse.json(
        { error: 'fg and bg query params are required' },
        { status: 400 }
      );
    }

    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);

    if (!fgRgb || !bgRgb) {
      return NextResponse.json(
        { error: 'Invalid hex color format' },
        { status: 400 }
      );
    }

    const fgLum = luminance(...fgRgb);
    const bgLum = luminance(...bgRgb);
    const ratio = contrastRatio(fgLum, bgLum);
    const ratioRounded = Math.round(ratio * 100) / 100;

    return NextResponse.json({
      ratio: ratioRounded,
      passesAA: ratio >= 4.5,
      passesAALarge: ratio >= 3,
      passesAAA: ratio >= 7,
      passesAAALarge: ratio >= 4.5,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Contrast calculation failed' },
      { status: 500 }
    );
  }
}