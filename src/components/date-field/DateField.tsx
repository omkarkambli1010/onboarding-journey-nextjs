'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, type CalendarProps } from 'primereact/calendar';

// DateField — PrimeReact Calendar wrapper for masked manual date entry.
//
//  • Auto-formats typed digits to DD/MM/YYYY  (native mask "99/99/9999")
//    e.g. typing 12042026 → 12/04/2026
//  • Blocks impossible day/month digits while typing (capture-phase keydown):
//    day tens 0–3, month tens 0–1, etc. — so a month like "45" can't be typed.
//  • The picker opens only via the calendar icon (showOnFocus={false}).
//  • Manual entry never gets wiped mid-typing (keepInvalid); the parent only
//    ever receives a valid Date or null, so existing required/min/max
//    validation keeps working unchanged.
//
// The component is controlled by the parent as Date | null, but keeps an
// internal model so PrimeReact can retain the partially-typed string.

type DateFieldProps = Omit<CalendarProps, 'value' | 'onChange' | 'ref'> & {
  value: Date | null;
  onChange: (value: Date | null) => void;
};

export default function DateField({ value, onChange, ...rest }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Holds a committed Date, an in-progress partial string, or null.
  const [model, setModel] = useState<Date | string | null>(value);

  // Adopt external value changes (loaded data, picker) without clobbering a
  // partial string the user is still typing.
  useEffect(() => {
    setModel((prev) => {
      if (value instanceof Date) {
        return prev instanceof Date && prev.getTime() === value.getTime() ? prev : value;
      }
      // value === null: clear only a committed Date, keep an in-progress string.
      return prev instanceof Date ? null : prev;
    });
  }, [value]);

  // Block out-of-range digits before the mask inserts them. keydown runs in the
  // capture phase so preventDefault() also suppresses the mask's keypress.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onKeyDownCapture = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return; // allow shortcuts
      if (e.key.length !== 1) return; // allow Backspace, Tab, arrows, Enter…
      if (!/\d/.test(e.key)) {
        e.preventDefault(); // no letters / spaces / manual separators
        return;
      }

      const v = el.value;
      const caret = el.selectionStart ?? v.length;
      const pos = v.slice(0, caret).replace(/\D/g, '').length; // digit index 0–7
      if (pos > 7) {
        e.preventDefault();
        return;
      }

      const digits = v.replace(/\D/g, '');
      const d = Number(e.key);
      const dayTens = Number(digits[0]);
      const monthTens = Number(digits[2]);

      let ok = true;
      if (pos === 0) ok = d <= 3; // day tens
      else if (pos === 1) ok = dayTens === 3 ? d <= 1 : true; // max 31
      else if (pos === 2) ok = d <= 1; // month tens
      else if (pos === 3) ok = monthTens === 1 ? d <= 2 : true; // max 12

      if (!ok) e.preventDefault();
    };

    el.addEventListener('keydown', onKeyDownCapture, true);
    return () => el.removeEventListener('keydown', onKeyDownCapture, true);
  }, []);

  return (
    <Calendar
      {...rest}
      value={model as Date}
      inputRef={inputRef}
      mask="99/99/9999"
      keepInvalid
      showOnFocus={false}
      onChange={(e) => {
        setModel(e.value as Date | string);
        const v = e.value;
        onChange(v instanceof Date && !Number.isNaN(v.getTime()) ? v : null);
      }}
    />
  );
}
