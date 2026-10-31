import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 shadow-sm max-w-full">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-xs select-none">
        <span className="font-mono text-slate-300 font-semibold tracking-wider text-[11px] uppercase">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition text-[11px] font-semibold cursor-pointer"
          title="Copier le code"
          aria-label="Copier le code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="text-emerald-400">Copié !</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3.5 sm:p-4 overflow-x-auto custom-scrollbar text-xs sm:text-[13px] font-mono leading-relaxed text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        <pre className="m-0 p-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
