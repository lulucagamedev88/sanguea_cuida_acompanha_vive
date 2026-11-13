/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { UserProfile } from '../../types';
import { SangueaLogoMark } from '../common/SangueaLogoMark';

interface WelcomeSequenceProps {
  profile: UserProfile;
  onComplete: () => void;
}

type WelcomePhase = 'logo-in' | 'logo-out' | 'message';

export const WelcomeSequence: React.FC<WelcomeSequenceProps> = ({
  profile,
  onComplete,
}) => {
  const [phase, setPhase] = useState<WelcomePhase>('logo-in');
  const prefersReducedMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Sequência total rigorosa de 10 segundos:
    // 0s - 3s: Logótipo centrado com Zoom In suave
    // 3s - 4s: Fade Out suave do logótipo
    // 4s - 10s: Mensagem de boas-vindas personalizada
    const fadeOutTimer = window.setTimeout(() => {
      setPhase('logo-out');
    }, 3000);

    const messageTimer = window.setTimeout(() => {
      setPhase('message');
    }, 4000);

    const completeTimer = window.setTimeout(() => {
      onCompleteRef.current();
    }, 10000);

    return () => {
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(messageTimer);
      window.clearTimeout(completeTimer);
    };
  }, []);

  const greetingText =
    profile.gender === 'Feminino'
      ? `Bem-vinda, ${profile.name}!`
      : `Bem-vindo, ${profile.name}!`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-bg)] text-[var(--app-text)] px-6 overflow-hidden select-none"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {phase !== 'message' && (
          <motion.div
            key="welcome-logo"
            initial={{
              opacity: prefersReducedMotion ? 1 : 0,
              scale: prefersReducedMotion ? 1 : 0.85,
            }}
            animate={
              phase === 'logo-in'
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 1 }
            }
            transition={
              phase === 'logo-in'
                ? {
                    opacity: {
                      duration: prefersReducedMotion ? 0.2 : 0.5,
                      ease: 'easeOut',
                    },
                    scale: {
                      duration: prefersReducedMotion ? 0 : 3,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }
                : {
                    opacity: {
                      duration: prefersReducedMotion ? 0.4 : 1,
                      ease: 'easeInOut',
                    },
                  }
            }
            className="flex items-center justify-center pointer-events-none"
            aria-label="Sanguea"
          >
            <SangueaLogoMark size="xl" />
          </motion.div>
        )}

        {phase === 'message' && (
          <motion.p
            key="welcome-message"
            initial={{
              opacity: 0,
              y: prefersReducedMotion ? 0 : 6,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.3 : 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-base sm:text-lg md:text-xl font-semibold tracking-tight text-center text-[var(--app-text)] max-w-md leading-snug"
          >
            {greetingText}
          </motion.p>
        )}
      </div>
    </div>
  );
};
