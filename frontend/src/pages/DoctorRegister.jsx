import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { JALNA_DISTRICT, JALNA_TALUKAS, JALNA_TALUKA_OPTIONS } from '../constants/jalnaLocations'

const initialAddress = { line1: '', line2: '', city: JALNA_DISTRICT, state: 'Maharashtra', zipcode: '', taluka: '', village: '' }

const DoctorRegister = () => {
  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phoneNumber: '', speciality: '', degree: '',
    experience: '', about: '', fees: '', clinicName: '', providerType: 'individual', latitude: '', longitude: '',
    consultationModes: ['in-clinic'], homeVisitAvailable: false, homeVisitFee: '', serviceRadius: '', sameDayAvailable: false
  })
  const [address, setAddress] = useState(initialAddress)
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')

  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const updateAddress = (event) => {
    const nextAddress = { ...address, [event.target.name]: event.target.value }
    if (event.target.name === 'taluka') nextAddress.village = ''
    setAddress(nextAddress)
  }
  const toggleMode = (mode) => setForm({
    ...form,
    consultationModes: form.consultationModes.includes(mode)
      ? form.consultationModes.filter((item) => item !== mode)
      : [...form.consultationModes, mode]
  })

  const captureLocation = () => {
    if (!navigator.geolocation) return setLocationStatus('Location is not supported by this browser.')
    setLocationStatus('Requesting clinic location...')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((previous) => ({ ...previous, latitude: coords.latitude, longitude: coords.longitude }))
        setLocationStatus('Clinic location saved.')
      },
      () => setLocationStatus('Allow location access to offer nearby discovery.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters.')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.')
    if (!/^[6-9]\d{9}$/.test(form.phoneNumber.replace(/\D/g, ''))) return toast.error('Enter a valid 10-digit Indian phone number.')
    if (Number(form.fees) <= 0) return toast.error('Enter valid consultation fees.')
    if (Number(form.experience) < 0 || form.experience === '') return toast.error('Enter valid experience in years.')
    if (!address.line1 || !address.taluka || !address.village || !/^\d{6}$/.test(address.zipcode)) return toast.error('Complete the Jalna clinic address with a valid PIN code.')
    if (!image) return toast.error('Please select a profile image.')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 5 * 1024 * 1024) return toast.error('Use a JPG, PNG, or WebP image under 5 MB.')
    if (!form.consultationModes.length) return toast.error('Select at least one consultation mode.')

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'consultationModes' && key !== 'sameDayAvailable' && key !== 'homeVisitAvailable') formData.append(key, value)
    })
    form.consultationModes.forEach((mode) => formData.append('consultationModes', mode))
    formData.append('sameDayAvailable', form.sameDayAvailable)
    formData.append('homeVisitAvailable', form.homeVisitAvailable)
    formData.append('taluka', address.taluka)
    formData.append('village', address.village)
    formData.append('latitude', form.latitude)
    formData.append('longitude', form.longitude)
    formData.append('address', JSON.stringify(address))
    formData.append('clinicAddress', JSON.stringify(address))
    formData.append('image', image)

    try {
      setSubmitting(true)
      const { data } = await axios.post(`${backendUrl}/api/doctor/register`, formData)
      if (!data.success) return toast.error(data.message || 'Registration failed.')
      toast.success('Registration submitted successfully. Your provider application is pending admin verification.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className='py-8 max-w-4xl mx-auto text-sm text-[#5E5E5E]'>
      <div className='border rounded-xl shadow-sm p-6 sm:p-8'>
        <h1 className='text-2xl font-semibold text-gray-800'>Register as a Doctor</h1>
        <p className='mt-1 mb-7'>Submit your provider details for admin verification.</p>

        <h2 className='text-lg font-medium text-gray-800 border-b pb-2 mb-4'>Personal information</h2>
        <div className='grid sm:grid-cols-2 gap-4'>
          <label>Full name<input name='name' value={form.name} onChange={updateForm} required className='field' /></label>
          <label>Email<input name='email' type='email' value={form.email} onChange={updateForm} required className='field' /></label>
          <label>Password<input name='password' type='password' minLength='8' value={form.password} onChange={updateForm} required className='field' /></label>
          <label>Confirm password<input name='confirmPassword' type='password' value={form.confirmPassword} onChange={updateForm} required className='field' /></label>
          <label>Phone number<input name='phoneNumber' type='tel' value={form.phoneNumber} onChange={updateForm} required className='field' /></label>
          <label>Profile image<input type='file' accept='image/jpeg,image/png,image/webp' onChange={(event) => setImage(event.target.files[0])} required className='field' /></label>
        </div>

        <h2 className='text-lg font-medium text-gray-800 border-b pb-2 mt-8 mb-4'>Professional information</h2>
        <div className='grid sm:grid-cols-2 gap-4'>
          <label>Speciality<input name='speciality' value={form.speciality} onChange={updateForm} required className='field' /></label>
          <label>Degree<input name='degree' value={form.degree} onChange={updateForm} required className='field' /></label>
          <label>Experience (years)<input name='experience' type='number' min='0' value={form.experience} onChange={updateForm} required className='field' /></label>
          <label>Consultation fees<input name='fees' type='number' min='1' step='0.01' value={form.fees} onChange={updateForm} required className='field' /></label>
          <label className='sm:col-span-2'>About / Bio<textarea name='about' value={form.about} onChange={updateForm} required rows='4' className='field' /></label>
        </div>

        <h2 className='text-lg font-medium text-gray-800 border-b pb-2 mt-8 mb-4'>Clinic information</h2>
        <div className='grid sm:grid-cols-2 gap-4'>
          <label>Clinic name<input name='clinicName' value={form.clinicName} onChange={updateForm} required className='field' /></label>
          <label>Provider type<select name='providerType' value={form.providerType} onChange={updateForm} className='field'><option value='individual'>Individual</option><option value='clinic'>Clinic</option></select></label>
          <label>Address line 1<input name='line1' value={address.line1} onChange={updateAddress} required className='field' /></label>
          <label>Address line 2<input name='line2' value={address.line2} onChange={updateAddress} className='field' /></label>
          <label>District<input value={JALNA_DISTRICT} readOnly className='field bg-gray-100' /></label>
          <label>State<input value='Maharashtra' readOnly className='field bg-gray-100' /></label>
          <label>Taluka<select name='taluka' value={address.taluka} onChange={updateAddress} required className='field'><option value=''>Select taluka</option>{JALNA_TALUKA_OPTIONS.map((taluka) => <option key={taluka} value={taluka}>{taluka}</option>)}</select></label>
          <label>Village / town<select name='village' value={address.village} onChange={updateAddress} required disabled={!address.taluka} className='field'><option value=''>Select village / town</option>{(JALNA_TALUKAS[address.taluka] || []).map((village) => <option key={village} value={village}>{village}</option>)}</select></label>
          <label>PIN code<input name='zipcode' inputMode='numeric' pattern='[0-9]{6}' value={address.zipcode} onChange={updateAddress} required className='field' /></label>
        </div>

        <h2 className='text-lg font-medium text-gray-800 border-b pb-2 mt-8 mb-4'>Provider information</h2>
        <div className='flex flex-wrap gap-4'>
          {['in-clinic', 'video', 'home-visit'].map((mode) => <label key={mode} className='flex items-center gap-2'><input type='checkbox' checked={form.consultationModes.includes(mode)} onChange={() => toggleMode(mode)} />{mode === 'home-visit' ? 'Home visit' : mode}</label>)}
          <label className='flex items-center gap-2'><input type='checkbox' checked={form.homeVisitAvailable} onChange={(event) => setForm({ ...form, homeVisitAvailable: event.target.checked, consultationModes: event.target.checked && !form.consultationModes.includes('home-visit') ? [...form.consultationModes, 'home-visit'] : form.consultationModes })} />Home visit available</label>
          {form.homeVisitAvailable && <><label>Home visit fee<input name='homeVisitFee' type='number' min='0' value={form.homeVisitFee} onChange={updateForm} required className='field' /></label><label>Service radius (km)<input name='serviceRadius' type='number' min='1' value={form.serviceRadius} onChange={updateForm} required className='field' /></label><div className='sm:col-span-2'><button type='button' onClick={captureLocation} className='rounded border border-blue-600 px-4 py-2 text-blue-700'>Use clinic GPS location</button><p className='mt-2 text-xs text-gray-500'>{locationStatus || 'Save your clinic location so nearby patients can find you.'}</p></div></>}
          <label className='flex items-center gap-2'><input type='checkbox' name='sameDayAvailable' checked={form.sameDayAvailable} onChange={(event) => setForm({ ...form, sameDayAvailable: event.target.checked })} />Same-day availability</label>
        </div>

        <button disabled={submitting} className='bg-primary text-white px-8 py-3 rounded-md mt-8 disabled:opacity-60'>{submitting ? 'Submitting...' : 'Submit provider application'}</button>
      </div>
    </form>
  )
}

export default DoctorRegister
