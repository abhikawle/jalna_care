import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const normalizeSpeciality = (value = '') => value.toLowerCase().replace(/\s+/g, ' ').trim();

const RelatedDoctors = ({ speciality, docId }) => {

    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    const [relDoc, setRelDoc] = useState([])

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const selectedSpeciality = normalizeSpeciality(speciality)
            const doctorsData = doctors.filter((doc) => normalizeSpeciality(doc.speciality) === selectedSpeciality && doc._id !== docId)
            setRelDoc(doctorsData)
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-[#262626]'>
            <h1 className='text-3xl font-medium'>Related Healthcare Providers</h1>
            <p className='sm:w-1/3 text-center text-sm'>Explore other verified specialists with similar expertise.</p>
            <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {relDoc.map((item, index) => (
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
                            <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
                            <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
                            {item.avgRating > 0 && (
                                <p className='text-[#5C5C5C] text-xs mt-1'>⭐ {item.avgRating.toFixed(1)} ({item.totalReviews} reviews)</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RelatedDoctors