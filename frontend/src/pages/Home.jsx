import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'

const services = [
  'Physiotherapist',
  'Orthopedic Specialist',
  'Dentist',
  'Dermatologist',
  'General Physician',
  'Pediatrician'
]

const careNeeds = [
  { title: 'Fever or flu', speciality: 'General physician', care: 'fever', description: 'For routine checkups, fever, colds, and quick recovery guidance.' },
  { title: 'Skin concern', speciality: 'Dermatologist', care: 'skin concern', description: 'Acne, rashes, allergies, and skin irritation care in Jalna.' },
  { title: 'Women’s health', speciality: 'Gynecologist', care: 'women health', description: 'Pregnancy, hormonal, and routine women health consultations.' },
  { title: 'Baby or child care', speciality: 'Pediatricians', care: 'child care', description: 'Vaccination, growth checks, and pediatric follow-ups.' },
  { title: 'Stomach issues', speciality: 'Gastroenterologist', care: 'stomach', description: 'Digestive pain, acidity, nutrition, and gut health support.' },
  { title: 'Neurological symptoms', speciality: 'Neurologist', care: 'neurological', description: 'Headaches, dizziness, nerve pain, and specialist assessment.' }
]

const steps = [
  ['1', 'Search care', 'Find specialists, clinics or services in Jalna based on your need.'],
  ['2', 'Compare providers', 'Review experience, availability, consultation fee and ratings.'],
  ['3', 'Book easily', 'Confirm your preferred slot and visit with confidence.']
]

const Home = () => {
  return (
    <div>
      <Header />

      <section className='my-12 px-3 md:px-0'>
        <div className='mb-6'>
          <p className='text-sm uppercase tracking-[0.2em] text-[#1f7a6d]'>Care matching</p>
          <h2 className='mt-2 text-3xl font-semibold text-[#1b443a]'>How can we help today?</h2>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {careNeeds.map((need) => (
            <button
              key={need.title}
              className='rounded-2xl border border-[#dfeef0] bg-[#f8fbfa] p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md'
              onClick={() => window.location.href = `/doctors/${encodeURIComponent(need.speciality)}?care=${encodeURIComponent(need.care)}`}
            >
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#1f7a6d]'>Recommended</p>
              <h3 className='mt-3 text-xl font-semibold text-[#1b443a]'>{need.title}</h3>
              <p className='mt-2 text-sm text-gray-600'>{need.description}</p>
              <p className='mt-4 text-sm font-medium text-[#1f7a6d]'>{need.speciality}</p>
            </button>
          ))}
        </div>
      </section>

      <SpecialityMenu />

      <section className='my-16 px-3 md:px-0'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.2em] text-[#1f7a6d]'>Local care</p>
            <h2 className='mt-2 text-3xl font-semibold text-[#1b443a]'>Healthcare that fits Jalna</h2>
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {services.map((service) => (
            <div key={service} className='rounded-2xl border border-[#dfeef0] bg-[#f8fbfa] p-6 shadow-sm'>
              <p className='mb-3 text-sm font-medium uppercase tracking-[0.18em] text-[#1f7a6d]'>Service</p>
              <h3 className='text-xl font-semibold text-[#1b443a]'>{service}</h3>
              <p className='mt-3 text-sm text-gray-600'>Book with trusted local providers for faster, more convenient care in Jalna.</p>
            </div>
          ))}
        </div>
      </section>

      <TopDoctors />

      <section className='my-16 rounded-3xl bg-[#f2faf7] p-6 md:p-10'>
        <div className='grid gap-6 md:grid-cols-3'>
          {steps.map(([number, title, text]) => (
            <div key={number} className='rounded-2xl bg-white p-6 shadow-sm'>
              <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#dff4ef] text-sm font-bold text-[#1f7a6d]'>{number}</div>
              <h3 className='text-xl font-semibold text-[#1b443a]'>{title}</h3>
              <p className='mt-3 text-sm text-gray-600'>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='my-16 rounded-3xl bg-[#163f38] p-8 text-white md:p-12'>
        <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.2em] text-[#cfeae2]'>For providers</p>
            <h3 className='mt-2 text-3xl font-semibold'>Are you a healthcare professional in Jalna?</h3>
          </div>
          <button className='rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#163f38]'>Join JalnaCare</button>
        </div>
      </section>

      <Banner />
    </div>
  )
}

export default Home