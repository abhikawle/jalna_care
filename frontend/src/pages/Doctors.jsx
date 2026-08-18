import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const normalizeSpeciality = (value = '') => value.toLowerCase().replace(/\s+/g, ' ').trim();

const Doctors = () => {

  const { speciality } = useParams()
  const [searchParams] = useSearchParams()
  const careNeed = searchParams.get('care')

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const [sortBy, setSortBy] = useState('rating')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('All')
  const [consultationFilter, setConsultationFilter] = useState('all')
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext)

  const areaOptions = Array.from(new Set(
    doctors
      .map((doc) => doc.clinicAddress?.line1 || doc.address?.line1 || '')
      .filter(Boolean)
  )).sort()

  const applyFilter = () => {
    let filtered = []

    let selectedSpeciality = speciality ? normalizeSpeciality(speciality) : ''
    if (careNeed) {
      const careMap = {
        fever: 'general physician',
        'skin concern': 'dermatologist',
        'women health': 'gynecologist',
        'baby care': 'pediatricians',
        'child care': 'pediatricians',
        'stomach': 'gastroenterologist',
        'digestion': 'gastroenterologist',
        'neurological': 'neurologist',
        'headache': 'neurologist'
      }
      const mapped = careMap[careNeed.toLowerCase()] || ''
      if (mapped) selectedSpeciality = mapped
    }
    
    if (selectedSpeciality) {
      filtered = doctors.filter(doc => normalizeSpeciality(doc.speciality) === selectedSpeciality)
    } else {
      filtered = doctors
    }

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase()
      filtered = filtered.filter((doc) => {
        const haystack = [
          doc.name,
          doc.speciality,
          doc.clinicName,
          doc.clinicAddress?.line1,
          doc.clinicAddress?.line2,
          doc.address?.line1,
          doc.address?.line2,
        ].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(query)
      })
    }

    if (selectedArea !== 'All') {
      filtered = filtered.filter((doc) => {
        const area = doc.clinicAddress?.line1 || doc.address?.line1 || ''
        return area.toLowerCase() === selectedArea.toLowerCase()
      })
    }

    if (consultationFilter === 'same-day') {
      filtered = filtered.filter((doc) => doc.sameDayAvailable || (doc.consultationModes || []).includes('same-day'))
    }

    if (consultationFilter === 'video') {
      filtered = filtered.filter((doc) => (doc.consultationModes || []).includes('video'))
    }

    // Apply sorting
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    } else if (sortBy === 'fee-low') {
      filtered.sort((a, b) => a.fees - b.fees)
    } else if (sortBy === 'fee-high') {
      filtered.sort((a, b) => b.fees - a.fees)
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => {
        const expA = parseInt(a.experience) || 0
        const expB = parseInt(b.experience) || 0
        return expB - expA
      })
    }

    setFilterDoc(filtered)
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality, careNeed, sortBy, searchTerm, selectedArea, consultationFilter])

  return (
    <div>
      <p className='text-gray-600'>Browse trusted JalnaCare providers by specialty, area, and care need.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button onClick={() => setShowFilter(!showFilter)} className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}>Filters</button>
        
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <div>
            <p className='font-semibold mb-2 text-gray-700'>Search</p>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Doctor, clinic or service'
              className='border border-gray-300 rounded px-3 py-2 w-[94vw] sm:w-auto'
            />
          </div>

          <div>
            <p className='font-semibold mb-2 text-gray-700'>Speciality</p>
            <p onClick={() => speciality === 'General physician' ? navigate('/doctors') : navigate('/doctors/General physician')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'General physician' ? 'bg-[#E2E5FF] text-black ' : ''}`}>General physician</p>
            <p onClick={() => speciality === 'Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Gynecologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Gynecologist</p>
            <p onClick={() => speciality === 'Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Dermatologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Dermatologist</p>
            <p onClick={() => speciality === 'Pediatricians' ? navigate('/doctors') : navigate('/doctors/Pediatricians')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Pediatricians' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Pediatricians</p>
            <p onClick={() => speciality === 'Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Neurologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Neurologist</p>
            <p onClick={() => speciality === 'Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === 'Gastroenterologist' ? 'bg-[#E2E5FF] text-black ' : ''}`}>Gastroenterologist</p>
          </div>

          <div>
            <p className='font-semibold mb-2 text-gray-700'>Area</p>
            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className='border border-gray-300 rounded px-3 py-2 w-[94vw] sm:w-auto'>
              <option value='All'>All Jalna areas</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          <div>
            <p className='font-semibold mb-2 text-gray-700'>Consultation</p>
            <select value={consultationFilter} onChange={(e) => setConsultationFilter(e.target.value)} className='border border-gray-300 rounded px-3 py-2 w-[94vw] sm:w-auto'>
              <option value='all'>All consultations</option>
              <option value='same-day'>Same-day visits</option>
              <option value='video'>Video consults</option>
            </select>
          </div>

          <div>
            <p className='font-semibold mb-2 text-gray-700'>Sort By</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className='border border-gray-300 rounded px-3 py-2 w-[94vw] sm:w-auto'>
              <option value="rating">Top Rated</option>
              <option value="fee-low">Fee: Low to High</option>
              <option value="fee-high">Fee: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedArea('All')
              setConsultationFilter('all')
              navigate('/doctors')
            }}
            className='border border-gray-300 rounded px-3 py-2 text-left text-gray-700'
          >
            Reset filters
          </button>
        </div>
        
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.length === 0 ? (
            <div className='col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600'>
              No providers match your current filters. Try another area, specialty, or search term.
            </div>
          ) : filterDoc.map((item, index) => (
            <div onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
              <img className='bg-[#EAEFFF]' src={item.image} alt="" />
              <div className='p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                    <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p><p>{item.available ? 'Available' : "Not Available"}</p>
                  </div>
                  {item.isVerified && (
                    <span className='bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded'>✓ Verified</span>
                  )}
                </div>
                <div className='mb-2 flex flex-wrap gap-2'>
                  {(item.consultationModes || []).slice(0, 2).map((mode) => (
                    <span key={mode} className='rounded-full bg-[#edf7f5] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[#1f7a6d]'>
                      {mode === 'same-day' ? 'Same-day' : mode === 'video' ? 'Video' : 'In-clinic'}
                    </span>
                  ))}
                  {item.sameDayAvailable && (
                    <span className='rounded-full bg-[#fff3d9] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[#9a6700]'>Urgent</span>
                  )}
                </div>
                <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
                {(item.clinicAddress?.line1 || item.address?.line1) && (
                  <p className='text-[#5C5C5C] text-xs mt-1'>{item.clinicAddress?.line1 || item.address?.line1}</p>
                )}
                {item.avgRating > 0 && (
                  <p className='text-[#5C5C5C] text-xs mt-1'>⭐ {item.avgRating.toFixed(1)} ({item.totalReviews} reviews)</p>
                )}
                <p className='text-[#5C5C5C] text-xs mt-1'>Fee: ₹{item.fees}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Doctors