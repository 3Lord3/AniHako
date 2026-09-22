import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import type { TOptions } from 'i18next'
import ru from '@/locales/ru/translation.json'

/** Все локали из `src/locales/<lang>/translation.json` подгружаются динамически. */
const localeModules = import.meta.glob('../locales/*/translation.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, unknown>>

export const resources = Object.fromEntries(
  Object.entries(localeModules).map(([path, translation]) => {
    const lang = path.match(/locales\/([^/]+)\/translation\.json$/)?.[1]
    if (!lang) throw new Error(`Could not infer language code from locale path: ${path}`)
    return [lang, { translation }]
  }),
) as Record<string, { translation: Record<string, unknown> }>

/** Языки, реально присутствующие в `src/locales/*` (источник для Weblate-компонента). */
export const supportedLanguages = Object.keys(resources) as string[]

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
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