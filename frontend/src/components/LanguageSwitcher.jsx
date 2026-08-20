import { useTranslation } from 'react-i18next'
import { setLanguage } from '../i18n'

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()

  return (
    <label className='flex min-h-12 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 text-sm text-slate-700 shadow-sm'>
      <span className='sr-only'>{t('language')}</span>
      <span aria-hidden='true'>Aa</span>
      <select
        aria-label={t('language')}
        value={i18n.language}
        onChange={(event) => setLanguage(event.target.value)}
        className='bg-transparent font-medium outline-none'
      >
        <option value='en'>{t('english')}</option>
        <option value='hi'>{t('hindi')}</option>
        <option value='mr'>{t('marathi')}</option>
      </select>
    </label>
  )
}

export default LanguageSwitcher
