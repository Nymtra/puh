export type Category = 'industrie' | 'haus' | 'bunker' | 'krankenhaus' | 'kirche' | 'test' | 'sonstiges'
export type Difficulty = 'einfach' | 'moderat' | 'schwer'

export interface LostPlace {
  id: string
  name: string
  category: Category
  description: string | null
  latitude: number
  longitude: number
  difficulty: Difficulty
  terrain: Difficulty
  images: string[]
  created_at: string
  updated_at: string
}

export const categoryLabels: Record<Category, string> = {
  industrie: 'Industrie',
  haus: 'Haus',
  bunker: 'Bunker',
  krankenhaus: 'Krankenhaus',
  kirche: 'Kirche',
  test: 'Test'.
  sonstiges: 'Sonstiges',
}

export const difficultyLabels: Record<Difficulty, string> = {
  einfach: 'Einfach',
  moderat: 'Moderat',
  schwer: 'Schwer',
}

export const difficultyColors: Record<Difficulty, string> = {
  einfach: 'bg-emerald-600',
  moderat: 'bg-amber-500',
  schwer: 'bg-red-600',
}
