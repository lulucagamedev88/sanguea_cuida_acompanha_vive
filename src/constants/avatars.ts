/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AvatarDefinition {
  id: string;
  name: string;
  gender: 'Masculino' | 'Feminino';
  ageGroup: 'Criança' | 'Adolescente' | 'Adulto';
  description: string;
  badge: string;
  isOfficialCharacter?: boolean;
  isPrototype?: boolean;
}

export const AVATAR_LIBRARIES: Record<string, AvatarDefinition[]> = {
  // 1. MASCULINO — CRIANÇAS
  'Masculino-Criança': [
    {
      id: 'child-boy-hoodie',
      name: 'Rapaz com Hoodie Vermelho',
      gender: 'Masculino',
      ageGroup: 'Criança',
      description: 'Personagem oficial Sanguea: rapaz negro africano com hoodie vermelho.',
      badge: 'Oficial Sanguea',
      isOfficialCharacter: true,
    },
    {
      id: 'child-boy-cap',
      name: 'Rapaz com Boné Rubi',
      gender: 'Masculino',
      ageGroup: 'Criança',
      description: 'Opção complementar infantil com boné e t-shirt desportiva.',
      badge: 'Em Validação',
      isPrototype: true,
    },
  ],

  // 2. MASCULINO — ADOLESCENTES
  'Masculino-Adolescente': [
    {
      id: 'teen-boy-hoodie',
      name: 'Jovem com Casaco Rubro',
      gender: 'Masculino',
      ageGroup: 'Adolescente',
      description: 'Adolescente com hoodie desportivo moderno e postura serena.',
      badge: 'Adolescente',
      isOfficialCharacter: false,
    },
    {
      id: 'teen-boy-urban',
      name: 'Jovem com T-shirt Casual',
      gender: 'Masculino',
      ageGroup: 'Adolescente',
      description: 'Visual jovem descontraído com apontamento rubi.',
      badge: 'Em Validação',
      isPrototype: true,
    },
  ],

  // 3. MASCULINO — ADULTOS
  'Masculino-Adulto': [
    {
      id: 'adult-man',
      name: 'Homem Adulto (Clássico)',
      gender: 'Masculino',
      ageGroup: 'Adulto',
      description: 'Homem negro africano com expressão madura, segura e acolhedora.',
      badge: 'Adulto',
      isOfficialCharacter: false,
    },
    {
      id: 'adult-man-polo',
      name: 'Homem Adulto (Polo)',
      gender: 'Masculino',
      ageGroup: 'Adulto',
      description: 'Perfil adulto com vestuário polo e barba aparada.',
      badge: 'Em Validação',
      isPrototype: true,
    },
  ],

  // 4. FEMININO — CRIANÇAS
  'Feminino-Criança': [
    {
      id: 'child-girl-braids',
      name: 'Menina com Trancinhas',
      gender: 'Feminino',
      ageGroup: 'Criança',
      description: 'Menina negra africana com tranças e fita rubi protectora.',
      badge: 'Infantil Feminino',
      isOfficialCharacter: false,
    },
    {
      id: 'child-girl-puffs',
      name: 'Menina com Puffs Afro',
      gender: 'Feminino',
      ageGroup: 'Criança',
      description: 'Opção infantil com dois puffs e camisola coral.',
      badge: 'Em Validação',
      isPrototype: true,
    },
  ],

  // 5. FEMININO — ADOLESCENTES
  'Feminino-Adolescente': [
    {
      id: 'teen-girl-style',
      name: 'Jovem com Bandó Rubi',
      gender: 'Feminino',
      ageGroup: 'Adolescente',
      description: 'Adolescente com penteado afro moderno, bandó carmim e olhar amigável.',
      badge: 'Adolescente',
      isOfficialCharacter: false,
    },
    {
      id: 'teen-girl-braids',
      name: 'Jovem com Tranças Longas',
      gender: 'Feminino',
      ageGroup: 'Adolescente',
      description: 'Estilo jovem com tranças longas e brincos pequenos.',
      badge: 'Em Validação',
      isPrototype: true,
    },
  ],

  // 6. FEMININO — ADULTOS
  'Feminino-Adulto': [
    {
      id: 'adult-woman',
      name: 'Mulher Adulta com Turbante',
      gender: 'Feminino',
      ageGroup: 'Adulto',
      description: 'Mulher negra africana com turbante estilizado e sorriso sereno.',
      badge: 'Adulta Feminina',
      isOfficialCharacter: false,
    },
    {
      id: 'adult-woman-braids',
      name: 'Mulher Adulta (Penteado Elegante)',
      gender: 'Feminino',
      ageGroup: 'Adulto',
      description: 'Perfil de mulher adulta com vestuário profissional e postura digna.',
      badge: 'Em Validação',
      isPrototype: true,
    },
  ],
};

/**
 * Obtém estritamente a biblioteca de avatares com base no Sexo e na Faixa Etária calculada
 */
export function getAvatarsForProfile(
  gender: 'Masculino' | 'Feminino',
  ageGroup: 'Criança' | 'Adolescente' | 'Adulto'
): AvatarDefinition[] {
  const key = `${gender}-${ageGroup}`;
  return AVATAR_LIBRARIES[key] || [];
}

/**
 * Retorna o avatar por omissão para uma dada combinação
 */
export function getDefaultAvatarId(
  gender: 'Masculino' | 'Feminino',
  ageGroup: 'Criança' | 'Adolescente' | 'Adulto'
): string {
  if (gender === 'Masculino') {
    if (ageGroup === 'Criança') return 'child-boy-hoodie'; // Personagem oficial
    if (ageGroup === 'Adolescente') return 'teen-boy-hoodie';
    return 'adult-man';
  } else {
    if (ageGroup === 'Criança') return 'child-girl-braids';
    if (ageGroup === 'Adolescente') return 'teen-girl-style';
    return 'adult-woman';
  }
}

/**
 * Todos os avatares agregados (para lookup)
 */
export const ALL_AVATARS: AvatarDefinition[] = Object.values(AVATAR_LIBRARIES).flat();
