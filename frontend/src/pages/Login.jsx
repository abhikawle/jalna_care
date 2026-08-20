import { useContext, useEffect, useState } from 'react'
import { ArrowLeft, LockKeyhole, Phone, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)
  const [mode, setMode] = useState('login')
  const [authMethod, setAuthMethod] = useState('phone')
  const [step, setStep] = useState('phone')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)

  const emailAuth = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      const endpoint = mode === 'register' ? '/api/user/register' : '/api/user/login'
      const payload = mode === 'register' ? { name, email, password } : { email, password }
      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload)
      if (!data.success) return toast.error(data.message)
      localStorage.setItem('token', data.token)
      setToken(data.token)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendOtp = async (event) => {
    event.preventDefault()
    if (authMethod === 'emailOtp' ? !/^\S+@\S+\.\S+$/.test(email) : !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) return toast.error(authMethod === 'emailOtp' ? t('emailAddress') : t('phoneNumber'))
    try {
      setLoading(true)
      const channel = authMethod === 'emailOtp' ? 'email' : 'phone'
      const { data } = await axios.post(`${backendUrl}/api/auth/send-otp`, { channel, phone, email, purpose: mode === 'forgot' ? 'forgot-password' : mode })
      if (!data.success) return toast.error(data.message)
      setStep('otp')
      toast.success(t('otpSent'))
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp)) return toast.error(t('enterOtp'))
    try {
      setLoading(true)
      const purpose = mode === 'forgot' ? 'forgot-password' : mode
      const channel = authMethod === 'emailOtp' ? 'email' : 'phone'
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-otp`, { channel, phone, email, otp, purpose, name })
      if (!data.success) return toast.error(data.message)
      if (mode === 'forgot') {
        setResetToken(data.resetToken)
        setStep('password')
      } else {
        localStorage.setItem('token', data.token)
        setToken(data.token)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { resetToken, password })
      if (!data.success) return toast.error(data.message)
      toast.success(data.message)
      setMode('login')
      setStep('phone')
      setPassword('')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  const title = mode === 'register' ? t('register') : mode === 'forgot' ? t('resetPassword') : t('login')

  return (
    <main className='flex min-h-[78vh] items-center justify-center py-8'>
      <div className='w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100 sm:p-8'>
        <div className='mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600'><ShieldCheck size={30} aria-hidden='true' /></div>
        <h1 className='text-3xl font-bold text-slate-900'>{title}</h1>
        <p className='mt-2 text-sm text-slate-600'>{t('continueWithPhone')}</p>

        {authMethod === 'email' && <form onSubmit={emailAuth} className='mt-7 space-y-4'>
          {mode === 'register' && <label className='block text-sm font-semibold text-slate-700'>{t('fullName')}<input value={name} onChange={(event) => setName(event.target.value)} className='field min-h-12' required /></label>}
          <label className='block text-sm font-semibold text-slate-700'>{t('emailAddress')}<input type='email' value={email} onChange={(event) => setEmail(event.target.value)} className='field min-h-12' required /></label>
          <label className='block text-sm font-semibold text-slate-700'>{t('password')}<input type='password' minLength='8' value={password} onChange={(event) => setPassword(event.target.value)} className='field min-h-12' required /></label>
          <button disabled={loading} className='min-h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:opacity-60'>{loading ? '...' : mode === 'register' ? t('createAccount') : t('login')}</button>
        </form>}

        {authMethod === 'phone' && step === 'phone' && <form onSubmit={sendOtp} className='mt-7 space-y-4'>
          {mode === 'register' && <label className='block text-sm font-semibold text-slate-700'>{t('fullName')}<input value={name} onChange={(event) => setName(event.target.value)} className='field min-h-12' required /></label>}
          <label className='block text-sm font-semibold text-slate-700'>{t('phoneNumber')}<div className='mt-1 flex items-center gap-2 rounded border border-[#DADADA] px-3'><Phone size={20} className='text-blue-600' aria-hidden='true' /><span className='text-slate-500'>+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} inputMode='numeric' className='min-h-12 w-full outline-none' required /></div></label>
          <button disabled={loading} className='min-h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:opacity-60'>{loading ? '...' : t('sendOtp')}</button>
          {mode === 'login' && <button type='button' onClick={() => setMode('forgot')} className='w-full text-sm font-semibold text-blue-600'>{t('forgotPassword')}</button>}
        </form>}

        {authMethod === 'emailOtp' && step === 'phone' && <form onSubmit={sendOtp} className='mt-7 space-y-4'>
          {mode === 'register' && <label className='block text-sm font-semibold text-slate-700'>{t('fullName')}<input value={name} onChange={(event) => setName(event.target.value)} className='field min-h-12' required /></label>}
          <label className='block text-sm font-semibold text-slate-700'>{t('emailAddress')}<input type='email' value={email} onChange={(event) => setEmail(event.target.value)} className='field min-h-12' required /></label>
          <button disabled={loading} className='min-h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:opacity-60'>{loading ? '...' : t('sendOtp')}</button>
        </form>}

        {step === 'otp' && <form onSubmit={verifyOtp} className='mt-7 space-y-4'>
          <label className='block text-sm font-semibold text-slate-700'>{t('enterOtp')}<div className='mt-1 flex items-center gap-2 rounded border border-[#DADADA] px-3'><LockKeyhole size={20} className='text-blue-600' aria-hidden='true' /><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode='numeric' maxLength='6' className='min-h-12 w-full text-center text-2xl tracking-[0.5em] outline-none' required /></div></label>
          <button disabled={loading} className='min-h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:opacity-60'>{loading ? '...' : t('verifyOtp')}</button>
          <button type='button' onClick={() => setStep('phone')} className='flex min-h-12 w-full items-center justify-center gap-2 text-sm font-semibold text-blue-600'><ArrowLeft size={17} aria-hidden='true' />{t('changeNumber')}</button>
        </form>}

        {step === 'password' && <form onSubmit={resetPassword} className='mt-7 space-y-4'><label className='block text-sm font-semibold text-slate-700'>{t('newPassword')}<input type='password' minLength='8' value={password} onChange={(event) => setPassword(event.target.value)} className='field min-h-12' required /></label><p className='text-xs text-slate-500'>{t('passwordHint')}</p><button disabled={loading} className='min-h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:opacity-60'>{loading ? '...' : t('resetPassword')}</button></form>}

        <div className='mt-8 border-t border-slate-100 pt-5 text-center text-sm text-slate-600'>{mode === 'register' ? <button onClick={() => { setMode('login'); setStep('phone') }} className='font-semibold text-blue-600'>{t('existingPatient')}</button> : <button onClick={() => { setMode('register'); setStep('phone') }} className='font-semibold text-blue-600'>{t('newPatient')}</button>}</div>
        <button type='button' onClick={() => { setAuthMethod(authMethod === 'phone' ? 'email' : 'phone'); setStep('phone') }} className='mt-4 w-full text-sm font-semibold text-blue-600'>{authMethod === 'phone' ? t('emailLogin') : t('continueWithPhone')}</button>
        <button type='button' onClick={() => { setAuthMethod(authMethod === 'emailOtp' ? 'phone' : 'emailOtp'); setStep('phone') }} className='mt-3 w-full text-sm font-semibold text-blue-600'>{authMethod === 'emailOtp' ? t('continueWithPhone') : t('emailOtp')}</button>
        {mode === 'forgot' && step === 'phone' && <button onClick={() => setMode('login')} className='mt-3 flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500'><ArrowLeft size={17} aria-hidden='true' />{t('backToLogin')}</button>}
      </div>
    </main>
  )
}

export default Login
