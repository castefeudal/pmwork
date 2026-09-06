"use client";
import { contextQuestions } from '@/content/project-context';
import type { Context } from '@/domain/method-fit';
import type { Locale } from '@/domain/schemas';

export function ContextFields({
  value,
  onChange,
  locale,
  prefix = 'context',
  keys,
}: {
  value: Context;
  onChange: (value: Context) => void;
  locale: Locale;
  prefix?: string;
  keys?: (keyof Context)[];
}) {
  const visibleKeys = keys ?? (Object.keys(contextQuestions) as (keyof Context)[]);
  return <>{visibleKeys.map(key => {
    const [question, low, mid, high, why] = contextQuestions[key][locale];
    const fieldId = `${prefix}-${String(key)}`;
    return <div className="field wide" key={String(key)}>
      <label htmlFor={fieldId}>{question} · {value[key]}</label>
      <input
        id={fieldId}
        name={String(key)}
        type="range"
        min="1"
        max="5"
        value={value[key]}
        aria-describedby={`${fieldId}-help`}
        aria-valuetext={`${value[key]}: ${value[key] <= 2 ? low : value[key] >= 4 ? high : mid}`}
        onChange={e => onChange({ ...value, [key]: Number(e.target.value) })}
      />
      <div className="context-anchors"><span>1 · {low}</span><span>3 · {mid}</span><span>5 · {high}</span></div>
      <small id={`${fieldId}-help`}>{why}</small>
    </div>;
  })}</>;
}
