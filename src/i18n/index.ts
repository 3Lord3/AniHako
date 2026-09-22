import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import type { TOptions } from 'i18next'
import ru from '@/locales/ru/translation.json'

export const resources = {
  ru: { translation: ru },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    supportedLngs: ['ru'],
    interpolation: { escapeValue: false },
  })

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`
}[keyof TObj & (string | number)]

/** Все допустимые ключи переводов, выведенные из `ru/translation.json`. */
export type TranslationKey = RecursiveKeyOf<typeof ru>

/** Тип функции перевода — строки в параметрах lib-утилит. */
export type Translator = (key: TranslationKey, options?: TOptions) => string

/** Типизированная обёртка над `useTranslation` с автодополнением ключей. */
export function useT() {
  const { t } = useTranslation()
  return { t: t as Translator }
}

export default i18n