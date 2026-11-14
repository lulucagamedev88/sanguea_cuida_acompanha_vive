/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Heart, Compass, Shield, Code2 } from 'lucide-react';

export const CreatorView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Creator Real Photo */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-900">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-14_at_00.54.56_b7ad5ed3.jpeg"
                alt="Rodrigo Luluca — Criador do Sanguea"
                className="w-full h-full object-cover object-center select-none"
                draggable={false}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-1.5 rounded-xl shadow-xs">
              <Code2 className="w-4 h-4" />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              <span>Criador & Desenvolvedor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rodrigo Luluca
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Idealizador do Projecto Sanguea — Cuida. Acompanha. Vive.
            </p>
          </div>
        </div>

        {/* Motivação e Propósito */}
        <div className="pt-4 border-t border-slate-100 space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-sky-600" />
            <span>Motivação e Propósito</span>
          </h2>
          
          <p>
            O projecto <strong>Sanguea</strong> nasceu de uma visão profundamente humana e focada na utilidade real: colocar a tecnologia ao serviço das pessoas que vivem com doença falciforme e das suas famílias.
          </p>

          <p>
            O propósito principal é oferecer uma ferramenta digna, segura e sem custos, que reduza a sobrecarga diária dos cuidados, ajude a monitorizar os sinais corporais com clareza e promova o bem-estar e a autonomia dos pacientes e cuidadores.
          </p>
        </div>

        {/* Valores Fundamentais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Shield className="w-4 h-4 text-sky-600" />
              <span>Privacidade por Princípio</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Compromisso inalienável de manter os dados de saúde 100% locais e cifrados no dispositivo do utilizador.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Heart className="w-4 h-4 text-sky-600" />
              <span>Empatia e Respeito</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Construir cada funcionalidade a pensar no conforto, acessibilidade e dignidade das famílias.
            </p>
          </div>
        </div>

        {/* Reservado para Biografia Futura */}
        <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-700">Espaço Reservado</p>
          <p className="text-[11px]">
            Estrutura preparada para actualização futura com biografia completa e notas do criador.
          </p>
        </div>
      </div>
    </div>
  );
};
