import { CalendarDays, Home, Stethoscope, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const BottomNav = () => {
  const { t } = useTranslation()
  const items = [
    { to: '/', label: t('home'), icon: Home },
    { to: '/doctors', label: t('doctors'), icon: Stethoscope },
    { to: '/my-appointments', label: t('appointments'), icon: CalendarDays },
    { to: '/my-profile', label: t('profile'), icon: UserRound }
  ]

  return (
    <nav aria-label='Primary navigation' className='fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(37,99,235,0.12)] backdrop-blur md:hidden'>
      <div className='mx-auto grid max-w-md grid-cols-4'>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
            {({ isActive }) => <><Icon size={23} strokeWidth={isActive ? 2.5 : 2} aria-hidden='true' /><span>{label}</span></>}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
