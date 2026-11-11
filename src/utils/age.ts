/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function calculateAge(birthDateString: string): {
  age: number;
  ageGroup: 'Criança' | 'Adolescente' | 'Adulto';
  isValidDate: boolean;
} {
  if (!birthDateString) {
    return { age: 0, ageGroup: 'Adulto', isValidDate: false };
  }

  const birthDate = new Date(birthDateString);
  const today = new Date();

  if (isNaN(birthDate.getTime()) || birthDate > today) {
    return { age: 0, ageGroup: 'Adulto', isValidDate: false };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Determine age group automatically
  let ageGroup: 'Criança' | 'Adolescente' | 'Adulto';
  if (age < 12) {
    ageGroup = 'Criança';
  } else if (age < 18) {
    ageGroup = 'Adolescente';
  } else {
    ageGroup = 'Adulto';
  }

  return {
    age: Math.max(0, age),
    ageGroup,
    isValidDate: true,
  };
}

export function formatAgeString(age: number, ageGroup: string): string {
  if (age === 0) return `Bebé / Menos de 1 ano (${ageGroup})`;
  if (age === 1) return `1 ano (${ageGroup})`;
  return `${age} anos (${ageGroup})`;
}
