/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import background from './assets/images/aqua_quest_background.jpg';
import cleanBubble from './assets/images/clean_water_bubble.png';
import contaminatedBubble from './assets/images/contaminated_water_bubble.png';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAMEOVER';

export interface LevelConfig {
  number: number;
  name: string;
  speed: number;
  frequency: number;
  contaminationChance: number;
  duration: number;
  goal: number;
}

export const LEVELS: LevelConfig[] = [
  {
    number: 1,
    name: 'Introdução Suave',
    speed: 2,
    frequency: 1500,
    contaminationChance: 0,
    duration: 30,
    goal: 100,
  },
  {
    number: 2,
    name: 'Primeiros Desafios',
    speed: 3,
    frequency: 1200,
    contaminationChance: 0.15,
    duration: 45,
    goal: 250,
  },
  {
    number: 3,
    name: 'Ritmo Fluído',
    speed: 4,
    frequency: 900,
    contaminationChance: 0.25,
    duration: 60,
    goal: 500,
  },
  {
    number: 4,
    name: 'Alerta de Pureza',
    speed: 5.5,
    frequency: 700,
    contaminationChance: 0.4,
    duration: 60,
    goal: 750,
  },
  {
    number: 5,
    name: 'Aqua Quest Master',
    speed: 7,
    frequency: 500,
    contaminationChance: 0.55,
    duration: 90,
    goal: 1200,
  },
];

export const IMAGES = {
  background,
  cleanBubble,
  contaminatedBubble,
};
