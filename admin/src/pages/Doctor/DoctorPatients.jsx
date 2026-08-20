import { useContext, useEffect, useMemo, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorPatients = () => {
  const { dToken, appointments, getAppointments } = useContext(DoctorContext)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (dToken) getAppointments()
  }, [dToken])

  const patients = useMemo(() => {
    const grouped = new Map()
    appointments.forEach((appointment) => {
      const patient = appointment.userData || {}
      const key = appointment.userId
      const existing = grouped.get(key)
      if (!existing || appointment.date > existing.lastVisitDate) grouped.set(key, { ...patient, userId: key, lastVisitDate: appointment.date, totalVisits: (existing?.totalVisits || 0) + 1, treatment: appointment.consultationType })
      else existing.totalVisits += 1
    })
    return [...grouped.values()].filter((patient) => `${patient.name || ''} ${patient.phone || ''}`.toLowerCase().includes(query.toLowerCase()))
  }, [appointments, query])

  return <main className='m-5 max-w-5xl'><h1 className='text-2xl font-bold text-gray-800'>My Patients</h1><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search patient' className='mt-5 w-full max-w-md rounded border p-3' /><div className='mt-6 grid gap-4 md:grid-cols-2'>{patients.map((patient) => <article key={patient.userId} className='rounded-lg border bg-white p-4 shadow-sm'><div className='flex items-center gap-3'><img src={patient.image} alt='' className='h-14 w-14 rounded-full object-cover' /><div><h2 className='font-semibold text-gray-800'>{patient.name}</h2><p className='text-sm text-gray-500'>{patient.phone || 'Phone unavailable'}</p></div></div><div className='mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600'><p>Total visits: {patient.totalVisits}</p><p>Last visit: {patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString() : '-'}</p><p>Treatment: {patient.treatment || '-'}</p><p>Age: {patient.dob && patient.dob !== 'Not Selected' ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : '-'}</p></div></article>)}</div></main>
}

export default DoctorPatients
