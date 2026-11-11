/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Users, Shield, Sparkles } from 'lucide-react';

export const ThanksView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-3 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-current text-sky-400" />
          <span>Reconhecimento & Gratidão</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Agradecimentos
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Um tributo de carinho, respeito e gratidão a toda a comunidade de pessoas que vivem com doença falciforme.
        </p>
      </div>

      {/* Cartões de Reconhecimento */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Às Pessoas e Famílias</h2>
              <p className="text-xs text-slate-500">A inspiração central do projecto</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            O nosso mais profundo agradecimento a todas as crianças, jovens, adultos e famílias que enfrentam diariamente os desafios da doença falciforme com coragem, resiliência e esperança. A vossa determinação é a força motriz do desenvolvimento do Sanguea.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Aos Cuidadores e Profissionais</h2>
              <p className="text-xs text-slate-500">Dedicação incondicional</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Expressamos a nossa admiração aos pais, familiares, cuidadores e profissionais de saúde que prestam apoio constante, garantindo que o cuidado médico, o carinho e a atenção preventiva estejam sempre presentes no quotidiano de quem necessita.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">À Comunidade de Apoio</h2>
              <p className="text-xs text-slate-500">União e sensibilização</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A todos os que sensibilizam a sociedade, promovem a doação de sangue e apoiam iniciativas comunitárias de consciencialização sobre a hemoglobinopatia falciforme. A solidariedade de todos torna a jornada mais leve e esperançosa.
          </p>
        </div>
      </div>

      {/* Nota de fecho */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Sanguea — Cuida. Acompanha. Vive.</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Construído com respeito e compromisso com a privacidade dos dados.
        </p>
      </div>
    </div>
  );
};
