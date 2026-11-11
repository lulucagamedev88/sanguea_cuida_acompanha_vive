/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';
import {
  ANGOLA_DIALING_CODE,
  extractAngolaLocalDigits,
  formatLocalDigitsDisplay,
  toNormalizedAngolaPhone,
  validateAngolaPhone,
} from '../../utils/phone';

interface AngolaPhoneInputProps {
  value: string; // Accepts full '+244 ...' or local digits
  onChange: (normalizedFullPhone: string) => void;
  label?: string;
  required?: boolean;
  error?: string | null;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const AngolaPhoneInput: React.FC<AngolaPhoneInputProps> = ({
  value,
  onChange,
  label = 'Contacto Telefónico (Angola)',
  required = false,
  error = null,
  placeholder = '923 456 789',
  autoFocus = false,
  className = '',
}) => {
  const localDigits = extractAngolaLocalDigits(value);
  const formattedDisplay = formatLocalDigitsDisplay(localDigits);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = extractAngolaLocalDigits(raw);
    onChange(cleaned ? toNormalizedAngolaPhone(cleaned) : '');
  };

  const validation = localDigits.length > 0 ? validateAngolaPhone(localDigits) : null;
  const displayError = error || (validation && !validation.isValid ? validation.errorMessage : null);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-600">*</span>}
          </span>
          <span className="text-[10px] font-mono text-stone-400">9 dígitos</span>
        </label>
      )}

      <div className="relative flex rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] focus-within:bg-[var(--app-bg)] focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition overflow-hidden min-h-[46px]">
        {/* Fixed Angola Prefix Badge (Locked, Non-editable) */}
        <div className="flex items-center gap-1.5 px-3 bg-[var(--app-bg)] border-r border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold select-none shrink-0">
          <span className="text-base">🇦🇴</span>
          <span className="font-mono text-rose-800">{ANGOLA_DIALING_CODE}</span>
        </div>

        {/* Local Digits Input */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11} // Allows for spaces in formatted display
          value={formattedDisplay}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full px-3 py-2.5 sm:py-3 text-sm text-[var(--app-text)] bg-transparent focus:outline-none font-mono tracking-wider font-semibold placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400"
        />
      </div>

      {displayError && (
        <p className="text-[11px] text-rose-700 flex items-center gap-1 pt-0.5 animate-in fade-in duration-150">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
};
