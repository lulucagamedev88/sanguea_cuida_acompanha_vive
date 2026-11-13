/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SangueaLogoMarkProps {
  size?: 'md' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<'md' | 'xl', { box: string; svg: string }> = {
  md: {
    box: 'w-12 h-12 rounded-2xl shadow-md',
    svg: 'w-6 h-6',
  },
  xl: {
    box: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-lg',
    svg: 'w-8 h-8 sm:w-10 sm:h-10',
  },
};

/**
 * Símbolo gráfico oficial unificado do Sanguea.
 * Partilhado entre a tela «Aceder a Perfil Local» e a tela de boas-vindas.
 */
export const SangueaLogoMark: React.FC<SangueaLogoMarkProps> = ({
  size = 'md',
  className = '',
}) => {
  const styles = SIZE_CLASSES[size];

  return (
    <div
      className={`inline-flex items-center justify-center bg-[var(--app-accent)] text-white shadow-[var(--app-accent)]/25 transition-colors duration-500 ${styles.box} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className={`${styles.svg} fill-current`}>
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    </div>
  );
};
