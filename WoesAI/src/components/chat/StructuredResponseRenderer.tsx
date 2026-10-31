import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  BookOpen,
  KeyRound,
  FileText,
  Lightbulb,
  Tag
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { ResponseCallout, CalloutType } from './ResponseCallout';
import { QuizBlock, QuizOption } from './QuizBlock';
import { AnalysisCardBlock, AnalysisDetails } from './AnalysisCardBlock';
import { VerdictType, AppMode } from '../../types';

interface StructuredResponseRendererProps {
  content: string;
  isStreaming?: boolean;
  mode?: AppMode;
  onSelectQuizOption?: (optionLetter: string, optionText: string) => void;
}

export const StructuredResponseRenderer: React.FC<StructuredResponseRendererProps> = ({
  content,
  isStreaming,
  mode,
  onSelectQuizOption,
}) => {
  if (!content) {
    if (isStreaming) {
      return (
        <div className="flex items-center gap-2 py-3 text-slate-600 dark:text-slate-400 text-sm font-medium animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>WoèséAI analyse et prépare la réponse...</span>
        </div>
      );
    }
    return null;
  }

  // Pre-split blocks by code fences
  const parts: React.ReactNode[] = [];
  const rawSegments = content.split(/(```[\s\S]*?```)/g);

  rawSegments.forEach((segment, segIdx) => {
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const inner = segment.slice(3, -3);
      const firstLineEnd = inner.indexOf('\n');
      let lang = 'code';
      let codeText = inner;
      if (firstLineEnd !== -1) {
        lang = inner.slice(0, firstLineEnd).trim() || 'code';
        codeText = inner.slice(firstLineEnd + 1);
      }
      parts.push(<CodeBlock key={`code-${segIdx}`} language={lang} code={codeText} />);
      return;
    }

    // Process non-code markdown blocks
    parts.push(
      <React.Fragment key={`text-seg-${segIdx}`}>
        {renderMarkdownSection(segment, segIdx, onSelectQuizOption, mode)}
      </React.Fragment>
    );
  });

  return (
    <div className="text-[15px] sm:text-[16px] leading-[1.65] text-slate-900 dark:text-slate-100 font-normal space-y-2.5 max-w-none selection:bg-amber-400 selection:text-slate-950">
      {parts}
      {isStreaming && (
        <span
          className="inline-block w-2 h-4 ml-1 bg-amber-500 dark:bg-amber-400 animate-pulse align-middle rounded-xs"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/**
 * Main parser for markdown lines, tables, quotes, headings, lists,
 * quiz questions, callout tags, and structured analysis blocks.
 */
function renderMarkdownSection(
  text: string,
  sectionKey: number,
  onSelectQuizOption?: (letter: string, text: string) => void,
  mode?: AppMode
): React.ReactNode {
  // Mobile Money SMS analysis parsing is strictly disabled in Learning mode
  const isLearning = mode === 'educational' || mode === 'learning';
  const parsedAnalysis = isLearning ? null : tryParseSmsAnalysis(text);
  if (parsedAnalysis) {
    return (
      <div key={`analysis-block-${sectionKey}`} className="space-y-3">
        <AnalysisCardBlock details={parsedAnalysis.details} />
        {parsedAnalysis.remainingText.trim() && (
          <div className="pt-2">
            {renderMarkdownLines(parsedAnalysis.remainingText, sectionKey, onSelectQuizOption)}
          </div>
        )}
      </div>
    );
  }

  return renderMarkdownLines(text, sectionKey, onSelectQuizOption);
}

/**
 * Extracts structured SMS Analysis data if the model replied with the standard scanner template
 */
function tryParseSmsAnalysis(
  text: string
): { details: AnalysisDetails; remainingText: string } | null {
  // Only trigger if this is an explicit structured analysis report
  const hasAnalysisHeader =
    /résultat\s*(?:de\s*l['’]analyse)?\s*[:—]/i.test(text) ||
    /détails\s*(?:de\s*la\s*transaction)?\s*[:—]/i.test(text) ||
    (text.includes('Opérateur identifié') && text.includes('Pourquoi ce message'));

  if (!hasAnalysisHeader) return null;

  // Determine verdict
  let verdict: VerdictType | null = null;
  if (text.includes('[ROUGE]') || text.includes('[FRAUDULEUX]') || /verdict\s*:\s*frauduleux/i.test(text)) {
    verdict = 'FRAUDULEUX';
  } else if (text.includes('[ORANGE]') || text.includes('[SUSPECT]') || /verdict\s*:\s*suspect/i.test(text)) {
    verdict = 'SUSPECT';
  } else if (text.includes('[VERT]') || text.includes('[AUTHENTIQUE]') || /verdict\s*:\s*authentique/i.test(text)) {
    verdict = 'AUTHENTIQUE';
  } else if (text.includes('[GRIS]') || text.includes('[NON_VERIFIABLE]')) {
    verdict = 'NON_VERIFIABLE';
  }

  if (!verdict) {
    verdict = 'NON_VERIFIABLE';
  }

  // Operator
  let operator = '';
  const opMatch = text.match(/\*\*(?:Opérateur|Operateur)[^:]*:\*\*\s*([^\n\r*]+)/i);
  if (opMatch) {
    operator = opMatch[1].trim();
  } else if (/t-?money/i.test(text) && !/moov/i.test(text)) {
    operator = 'T-Money';
  } else if (/moov/i.test(text) && !/t-?money/i.test(text)) {
    operator = 'Moov Money';
  }

  // Extracted fields
  let amount = '';
  let sender = '';
  let reference = '';
  let operationType = '';

  const amountMatch = text.match(/(?:Montant|Somme)\s*[:—]\s*([0-9\s.,]+(?:\s*FCFA)?)/i);
  if (amountMatch) amount = amountMatch[1].trim();

  const senderMatch = text.match(/(?:Expéditeur|Expediteur|Numéro|Numero|De)\s*[:—]\s*([^\n\r,*]+)/i);
  if (senderMatch) sender = senderMatch[1].trim();

  const refMatch = text.match(/(?:Réf|Ref|Référence|Reference|TXN|ID)\s*[:—]\s*([A-Za-z0-9._-]+)/i);
  if (refMatch) reference = refMatch[1].trim();

  const typeMatch = text.match(/(?:Type|Opération|Operation)\s*[:—]\s*([^\n\r*]+)/i);
  if (typeMatch) operationType = typeMatch[1].trim();

  // Indicators / reasons
  const indicators: string[] = [];
  const whySection = text.match(
    /\*\*(?:Pourquoi ce message est suspect|Signaux d['’]alerte|Analyse|Indices)[^:]*:\*\*([\s\S]*?)(?=\*\*Ce que tu dois faire|\*\*Actions|###|$)/i
  );
  if (whySection && whySection[1]) {
    const indLines = whySection[1].split('\n');
    indLines.forEach((l) => {
      const trimmed = l.trim().replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '');
      if (trimmed && trimmed.length > 5 && !trimmed.startsWith('**')) {
        indicators.push(trimmed);
      }
    });
  }

  // Recommendations
  const recommendations: string[] = [];
  const recSection = text.match(
    /\*\*(?:Ce que tu dois faire|Actions recommandées|Recommandations)[^:]*:\*\*([\s\S]*?)(?=\n\n\n|###|$)/i
  );
  if (recSection && recSection[1]) {
    const recLines = recSection[1].split('\n');
    recLines.forEach((l) => {
      const trimmed = l.trim().replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '');
      if (trimmed && trimmed.length > 5 && !trimmed.startsWith('**')) {
        recommendations.push(trimmed);
      }
    });
  }

  // Explanation
  let explanation = '';
  const explMatch = text.match(/\*\*(?:Explication|Constat)[^:]*:\*\*\s*([^\n\r]+)/i);
  if (explMatch) {
    explanation = explMatch[1].trim();
  }

  return {
    details: {
      verdict,
      operator: operator || undefined,
      amount: amount || undefined,
      sender: sender || undefined,
      reference: reference || undefined,
      operationType: operationType || undefined,
      explanation: explanation || undefined,
      indicators: indicators.length > 0 ? indicators : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    },
    remainingText: '', // Consume entire structured section
  };
}

/**
 * Standard markdown line renderer with strict typography and WCAG AA contrast
 */
function renderMarkdownLines(
  text: string,
  sectionKey: number,
  onSelectQuizOption?: (letter: string, text: string) => void
): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty lines
    if (!trimmed) {
      elements.push(<div key={`sp-${sectionKey}-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // 2. Verdict / Color Tag Badges
    if (
      trimmed.includes('[ROUGE]') ||
      trimmed.includes('[FRAUDULEUX]') ||
      trimmed.startsWith('**Résultat :** [ROUGE]')
    ) {
      const cleanText = trimmed
        .replace(/\[ROUGE\]/g, '')
        .replace(/\[FRAUDULEUX\]/g, '')
        .replace(/\*\*Résultat.*?\*\*/g, '')
        .trim();
      elements.push(
        <ResponseCallout key={`tag-${sectionKey}-${i}`} type="danger" title="Arnaque détectée — Danger immédiat">
          <p className="font-medium">{cleanText || 'Ce message présente des caractéristiques avérées d’escroquerie financière Mobile Money.'}</p>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    if (
      trimmed.includes('[ORANGE]') ||
      trimmed.includes('[SUSPECT]') ||
      trimmed.startsWith('**Résultat :** [ORANGE]')
    ) {
      const cleanText = trimmed
        .replace(/\[ORANGE\]/g, '')
        .replace(/\[SUSPECT\]/g, '')
        .replace(/\*\*Résultat.*?\*\*/g, '')
        .trim();
      elements.push(
        <ResponseCallout key={`tag-${sectionKey}-${i}`} type="warning" title="Attention — Message suspect">
          <p className="font-medium">{cleanText || 'Des anomalies ou signaux inhabituels ont été relevés. Une vérification immédiate est nécessaire.'}</p>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    if (
      trimmed.includes('[VERT]') ||
      trimmed.includes('[AUTHENTIQUE]') ||
      trimmed.startsWith('**Résultat :** [VERT]')
    ) {
      const cleanText = trimmed
        .replace(/\[VERT\]/g, '')
        .replace(/\[AUTHENTIQUE\]/g, '')
        .replace(/\*\*Résultat.*?\*\*/g, '')
        .trim();
      elements.push(
        <ResponseCallout key={`tag-${sectionKey}-${i}`} type="authentic" title="Format conforme au modèle officiel">
          <p className="font-medium">{cleanText || 'La formulation respecte la syntaxe officielle connue de l’opérateur.'}</p>
          <p className="mt-1.5 text-xs sm:text-[13px] font-semibold text-emerald-950 dark:text-emerald-200">
            ⚠️ Rappel de sécurité : même si la syntaxe est conforme, vérifiez impérativement votre solde via *145# (T-Money) ou *155# (Moov Money).
          </p>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    if (trimmed.includes('[BLEU]')) {
      const cleanText = trimmed.replace(/\[BLEU\]/g, '').trim();
      elements.push(
        <ResponseCallout key={`tag-${sectionKey}-${i}`} type="tip" title="Conseil pratique de sécurité">
          <p>{formatInlineText(cleanText)}</p>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    if (trimmed.includes('[GRIS]') || trimmed.includes('[NON_VERIFIABLE]')) {
      const cleanText = trimmed
        .replace(/\[GRIS\]/g, '')
        .replace(/\[NON_VERIFIABLE\]/g, '')
        .trim();
      elements.push(
        <ResponseCallout key={`tag-${sectionKey}-${i}`} type="unverifiable" title="Information non vérifiable">
          <p>{cleanText || 'Le texte fourni ne contient pas assez d’éléments pour certifier la provenance.'}</p>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    // 3. Absolute Golden Rule detection
    if (
      trimmed.toLowerCase().includes('règle d’or') ||
      trimmed.toLowerCase().includes('regle d\'or') ||
      trimmed.toLowerCase().includes('règle absolue') ||
      (trimmed.includes('*145#') && trimmed.includes('*155#') && (trimmed.includes('solde') || trimmed.includes('vérifi')))
    ) {
      elements.push(
        <ResponseCallout key={`rule-${sectionKey}-${i}`} type="security-rule" title="Règle d’or absolue — Mobile Money Togo">
          <div className="font-medium text-slate-950 dark:text-slate-100">
            {formatInlineText(trimmed.replace(/^(\*\*|#+)?\s*(Règle|Regle) (d'or|absolue)\s*[:—]?\s*/i, ''))}
          </div>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    // 4. Pedagogical callout patterns (Définition, Concept clé, Formule, Exemple)
    if (/^\*\*(?:Définition|Definition)\s*[:—]\*\*/i.test(trimmed)) {
      const defContent = trimmed.replace(/^\*\*(?:Définition|Definition)\s*[:—]\*\*\s*/i, '');
      elements.push(
        <ResponseCallout key={`def-${sectionKey}-${i}`} type="definition" title="Définition à retenir">
          <p>{formatInlineText(defContent)}</p>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    if (/^\*\*(?:Exemple|Exemple concret)\s*[:—]\*\*/i.test(trimmed)) {
      const exContent = trimmed.replace(/^\*\*(?:Exemple|Exemple concret)\s*[:—]\*\*\s*/i, '');
      elements.push(
        <ResponseCallout key={`ex-${sectionKey}-${i}`} type="example" title="Exemple d'application">
          <p>{formatInlineText(exContent)}</p>
        </ResponseCallout>
      );
      i++;
      continue;
    }

    // 5. Markdown Table detection (| header | header |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      elements.push(renderTableBlock(tableLines, `tbl-${sectionKey}-${i}`));
      continue;
    }

    // 6. Quiz question block detection (Question : ... A) ... B) ... C) ...)
    const isQuizQuestionHeader =
      trimmed.match(/^(question\s*\d*\s*[:—]|\*\*question\s*\d*\s*[:—]\*\*)/i) ||
      (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.includes('?'));

    if (isQuizQuestionHeader) {
      const questionTitle = trimmed.replace(/^\*\*|\*\*$/g, '');
      const options: QuizOption[] = [];
      let lookAhead = i + 1;

      while (lookAhead < lines.length) {
        const nextTrimmed = lines[lookAhead].trim();
        const optMatch = nextTrimmed.match(/^([A-D])[)\].:-]\s*(.*)$/i);
        if (optMatch) {
          options.push({
            letter: optMatch[1].toUpperCase(),
            text: optMatch[2],
          });
          lookAhead++;
        } else if (!nextTrimmed) {
          lookAhead++;
        } else {
          break;
        }
      }

      if (options.length >= 2) {
        elements.push(
          <QuizBlock
            key={`quiz-${sectionKey}-${i}`}
            question={questionTitle}
            options={options}
            onSelectOption={onSelectQuizOption}
          />
        );
        i = lookAhead;
        continue;
      }
    }

    // 7. Blockquote (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <div
          key={`quote-${sectionKey}-${i}`}
          className="my-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 italic text-sm leading-relaxed"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-1' : ''}>
              {formatInlineText(ql)}
            </p>
          ))}
        </div>
      );
      continue;
    }

    // 8. Headings (#, ##, ###) - strict anti-slop, bold and accessible
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1-${sectionKey}-${i}`}
          className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white mt-5 mb-2 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-1"
        >
          {trimmed.replace(/^#\s*/, '')}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={`h2-${sectionKey}-${i}`}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4 mb-1.5 tracking-tight"
        >
          {trimmed.replace(/^##\s*/, '')}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={`h3-${sectionKey}-${i}`}
          className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1"
        >
          {trimmed.replace(/^###\s*/, '')}
        </h4>
      );
      i++;
      continue;
    }

    // 9. Bullet list items (- , * , • )
    if (trimmed.match(/^[-*•]\s+/)) {
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      elements.push(
        <div
          key={`li-${sectionKey}-${i}`}
          className="flex items-start gap-2.5 my-1 text-[15px] sm:text-[16px] text-slate-800 dark:text-slate-200"
        >
          <span className="text-slate-400 dark:text-slate-500 font-bold select-none mt-0.5" aria-hidden="true">
            •
          </span>
          <div className="flex-1 leading-[1.65]">{formatInlineText(itemText)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 10. Numbered list items (1. , 2. )
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2];
      elements.push(
        <div
          key={`num-${sectionKey}-${i}`}
          className="flex items-start gap-3 my-1.5 text-[15px] sm:text-[16px] text-slate-800 dark:text-slate-200"
        >
          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center shrink-0 mt-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {num}
          </span>
          <div className="flex-1 leading-[1.65]">{formatInlineText(itemText)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 11. Default paragraph
    elements.push(
      <p
        key={`p-${sectionKey}-${i}`}
        className="my-1.5 text-[15px] sm:text-[16px] leading-[1.65] text-slate-800 dark:text-slate-200 font-normal"
      >
        {formatInlineText(trimmed)}
      </p>
    );
    i++;
  }

  return elements;
}

/**
 * Renders Markdown tables with horizontal scroll and WCAG AA contrast
 */
function renderTableBlock(tableLines: string[], key: string): React.ReactNode {
  if (tableLines.length < 2) return null;

  const parseRow = (line: string) => {
    return line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
  };

  const headerRow = parseRow(tableLines[0]);
  const dataRows = tableLines.slice(2).map(parseRow);

  return (
    <div key={key} className="my-3.5 overflow-x-auto custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs max-w-full">
      <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white dark:bg-slate-900">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
            {headerRow.map((h, idx) => (
              <th key={idx} className="p-3 font-bold tracking-tight text-xs uppercase text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {formatInlineText(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {dataRows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                rIdx % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-800/30' : ''
              }`}
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3 text-slate-800 dark:text-slate-200">
                  {formatInlineText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Inline text formatter: **bold**, `code`, USSD codes (*145#, *155#)
 */
function formatInlineText(text: string): React.ReactNode {
  if (!text) return null;

  // Regex split by bold and backticks
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-950 dark:text-white">
          {boldText}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      const isUssd = codeText.startsWith('*') && codeText.endsWith('#');
      return (
        <code
          key={index}
          className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
            isUssd
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 font-semibold'
          }`}
        >
          {codeText}
        </code>
      );
    }

    return part;
  });
}
