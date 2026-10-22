export const providers = ['Mikro', 'Trendyol', 'Hepsiburada', 'N11'] as const
export type Provider = typeof providers[number]
