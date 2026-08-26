'use client';

import { useState, useCallback } from 'react';
import { CheckIcon, XIcon } from '@/components/icons';

export function ContrastChecker() {
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [result, setResult] = useState<{
    ratio: number;
    passesAA: boolean;
    passesAALarge: boolean;
    passesAAA: boolean;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkContrast = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch(
        `/api/contrast?fg=${encodeURIComponent(fg)}&bg=${encodeURIComponent(bg)}`
      );
      const data = await res.json();
      setResult(data);
    } finally {
      setIsChecking(false);
    }
  }, [fg, bg]);

  return (
    <div className="contrast-checker">
      <div className="contrast-inputs">
        <div className="form-group">
          <label className="form-label" htmlFor="fg-color">
            Foreground Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="fg-color"
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="color-swatch"
              aria-label="Foreground color picker"
            />
            <input
              type="text"
              className="form-input"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              placeholder="#000000"
              aria-label="Foreground hex color"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bg-color">
            Background Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="bg-color"
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="color-swatch"
              aria-label="Background color picker"
            />
            <input
              type="text"
              className="form-input"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              placeholder="#ffffff"
              aria-label="Background hex color"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={checkContrast}
          disabled={isChecking}
          aria-busy={isChecking}
        >
          {isChecking ? 'Checking…' : 'Check Contrast'}
        </button>
      </div>

      {/* Preview */}
      <div
        className="contrast-preview"
        style={{ background: bg, color: fg }}
        aria-label="Color combination preview"
      >
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          Large Text Sample
        </span>
        <span style={{ fontSize: '14px' }}>
          Normal text sample — this is what body text looks like.
        </span>
      </div>

      {/* Results */}
      {result && (
        <div className="contrast-results" role="status" aria-live="polite">
          <div className="contrast-ratio">
            <span className="contrast-ratio-value">{result.ratio}:1</span>
            <span className="contrast-ratio-label">Contrast Ratio</span>
          </div>
          <div className="contrast-levels">
            {[
              { label: 'AA Normal',    passes: result.passesAA,      req: '4.5:1' },
              { label: 'AA Large',     passes: result.passesAALarge, req: '3:1'   },
              { label: 'AAA Normal',   passes: result.passesAAA,     req: '7:1'   },
            ].map((level) => (
              <div key={level.label} className="contrast-level">
                <span
                  style={{
                    color: level.passes ? '#2d5a1e' : '#6e0d2a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  {level.passes ? <CheckIcon size={15} /> : <XIcon size={15} />}
                </span>
                <span style={{ fontSize: '14px' }}>{level.label}</span>
                <span className="text-muted" style={{ fontSize: '13px' }}>
                  {level.req}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}