import { useContext, useState } from 'react'
import { ArrowRight, CalendarDays, HeartPulse, MapPin, Search, Siren, Stethoscope, House } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import { AppContext } from '../context/AppContext'
import { JALNA_TALUKA_OPTIONS } from '../constants/jalnaLocations'

const Home = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { userData } = useContext(AppContext)
  const [taluka, setTaluka] = useState(localStorage.getItem('jalnacare-taluka') || '')
  const [query, setQuery] = useState('')
  const [homeOnly, setHomeOnly] = useState(false)

  const openDoctors = (options = {}) => {
    const params = new URLSearchParams()
    if (options.homeVisit || homeOnly) params.set('care', 'home-visit')
    if (query.trim()) params.set('query', query.trim())
    if (taluka) params.set('taluka', taluka)
    navigate(`/doctors${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const selectTaluka = (value) => {
    setTaluka(value)
    localStorage.setItem('jalnacare-taluka', value)
  }

  const actions = [
    { title: t('bookAppointment'), description: t('bookAppointmentDescription'), icon: CalendarDays, className: 'bg-blue-600 text-white', onClick: () => openDoctors() },
    { title: t('myAppointments'), description: t('myAppointmentsDescription'), icon: HeartPulse, className: 'bg-white text-slate-900', onClick: () => navigate('/my-appointments') },
    { title: t('homeVisit'), description: t('homeVisitDescription'), icon: House, className: 'bg-sky-50 text-blue-800', onClick: () => openDoctors({ homeVisit: true }) },
    { title: t('emergency'), description: t('emergencyDescription'), icon: Siren, className: 'bg-rose-50 text-rose-800', onClick: () => { window.location.href = 'tel:108' } }
  ]

  return (
    <div className='pb-20'>
      <section className='relative overflow-hidden rounded-[2rem] bg-blue-700 px-5 py-7 text-white shadow-xl shadow-blue-200 sm:px-8 sm:py-10'>
        <div className='absolute -right-10 -top-12 h-44 w-44 rounded-full border-[22px] border-white/10' aria-hidden='true' />
        <div className='relative max-w-2xl'>
          <p className='text-sm font-semibold text-blue-100'>{t('welcome')}{userData?.name ? `, ${userData.name}` : ''}</p>
          <h1 className='mt-2 text-3xl font-bold leading-tight sm:text-5xl'>{t('careLauncherTitle')}</h1>
          <p className='mt-3 max-w-lg text-base text-blue-100'>{t('careLauncherSubtitle')}</p>
          <div className='mt-6 grid gap-3 sm:grid-cols-[1fr_auto]'>
            <label className='flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 text-slate-500'><Search size={22} aria-hidden='true' /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && openDoctors()} placeholder={t('searchDoctor')} className='w-full bg-transparent text-base text-slate-900 outline-none' /></label>
            <button onClick={() => openDoctors()} className='flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 font-semibold text-white'><Search size={20} aria-hidden='true' />{t('search')}</button>
          </div>
          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            <label className='flex min-h-12 items-center gap-3 rounded-xl bg-white/15 px-3'><MapPin size={20} aria-hidden='true' /><span className='sr-only'>{t('chooseTaluka')}</span><select value={taluka} onChange={(event) => selectTaluka(event.target.value)} className='w-full bg-transparent text-sm font-semibold outline-none'><option value='' className='text-slate-900'>{t('chooseTaluka')}</option>{JALNA_TALUKA_OPTIONS.map((item) => <option key={item} value={item} className='text-slate-900'>{item}</option>)}</select></label>
            <label className='flex min-h-12 items-center gap-3 rounded-xl bg-white/15 px-3 text-sm font-semibold'><input type='checkbox' checked={homeOnly} onChange={(event) => setHomeOnly(event.target.checked)} className='h-5 w-5 accent-slate-950' />{t('homeVisitToggle')}</label>
          </div>
        </div>
      </section>
      <section className='mt-8'>
        <div className='mb-4 flex items-end justify-between'><div><p className='text-sm font-semibold uppercase tracking-wider text-blue-600'>{t('careForYourVillage')}</p><h2 className='mt-1 text-2xl font-bold text-slate-900'>{t('quickActions')}</h2></div><Stethoscope className='text-blue-600' size={30} aria-hidden='true' /></div>
        <div className='grid gap-4 sm:grid-cols-2'>{actions.map(({ title, description, icon: Icon, className, onClick }) => <button key={title} onClick={onClick} className={`group min-h-40 rounded-3xl p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${className}`}><Icon size={32} strokeWidth={2.2} aria-hidden='true' /><span className='mt-5 block text-xl font-bold'>{title}</span><span className='mt-1 block text-sm opacity-80'>{description}</span><ArrowRight size={20} className='mt-4 transition group-hover:translate-x-1' aria-hidden='true' /></button>)}</div>
      </section>
      <section className='mt-6 flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-rose-900'><div className='flex items-center gap-3'><Siren size={24} aria-hidden='true' /><p className='text-sm font-semibold'>{t('emergencyCall')}</p></div><a href='tel:108' className='rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white'>{t('emergencyCallAction')}</a></section>
      <SpecialityMenu />
      <TopDoctors />
    </div>
  )
}

export default Home
