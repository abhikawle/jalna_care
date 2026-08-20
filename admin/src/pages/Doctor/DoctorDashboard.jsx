import React from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment, profileData, getProfileData } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)


  useEffect(() => {

    if (dToken) {
      getDashData()
      getProfileData()
    }

  }, [dToken])

  return dashData && (
    <div className='m-5'>

      {profileData?.verificationStatus === 'pending' && <div className='mb-5 rounded border border-yellow-200 bg-yellow-50 p-4 text-yellow-800'>Your application is under review.</div>}
      {profileData?.verificationStatus === 'verified' && <div className='mb-5 rounded border border-green-200 bg-green-50 p-4 text-green-800'>Verified Provider</div>}
      {profileData?.verificationStatus === 'rejected' && <div className='mb-5 rounded border border-red-200 bg-red-50 p-4 text-red-800'>Application rejected: {profileData.rejectionReason || 'Please contact JalnaCare support.'}</div>}
      {profileData?.verificationStatus === 'suspended' && <div className='mb-5 rounded border border-gray-300 bg-gray-100 p-4 text-gray-700'>Account suspended.</div>}

      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {dashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <div className='text-2xl'>📅</div><div><p className='text-xl font-semibold text-gray-600'>{dashData.todaysPatients || 0}</p><p className='text-gray-400'>Today's Patients</p></div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <div className='text-2xl'>🏠</div><div><p className='text-xl font-semibold text-gray-600'>{dashData.homeVisitAppointments || 0}</p><p className='text-gray-400'>Home Visits</p></div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p></div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <div className='text-2xl'>⭐</div>
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.avgRating}</p>
            <p className='text-gray-400'>Rating</p>
          </div>
        </div>
      </div>

      {/* Consultation Mode Breakdown */}
      {(dashData.inClinicAppointments > 0 || dashData.videoAppointments > 0 || dashData.sameDayAppointments > 0) && (
        <div className='bg-white mt-6 rounded-lg p-6 border border-gray-100'>
          <p className='text-lg font-semibold text-gray-700 mb-4'>📊 Consultation Mode Breakdown</p>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-blue-50 p-3 rounded text-center'>
              <p className='text-2xl font-bold text-blue-600'>{dashData.inClinicAppointments}</p>
              <p className='text-sm text-gray-600'>🏥 In-Clinic</p>
            </div>
            <div className='bg-purple-50 p-3 rounded text-center'>
              <p className='text-2xl font-bold text-purple-600'>{dashData.videoAppointments}</p>
              <p className='text-sm text-gray-600'>📱 Video</p>
            </div>
            <div className='bg-orange-50 p-3 rounded text-center'>
              <p className='text-2xl font-bold text-orange-600'>{dashData.sameDayAppointments}</p>
              <p className='text-sm text-gray-600'>⚡ Same-Day</p>
            </div>
            <div className='bg-red-50 p-3 rounded text-center'>
              <p className='text-2xl font-bold text-red-600'>{dashData.urgentAppointments}</p>
              <p className='text-sm text-gray-600'>🔴 Urgent</p>
            </div>
          </div>
        </div>
      )}

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
              <img className='rounded-full w-10' src={item.userData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-600 '>Booking on {slotDateFormat(item.slotDate)}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  {item.consultationType === 'video' && '📱 Video Call'}
                  {item.consultationType === 'in-clinic' && '🏥 In-Clinic'}
                  {item.consultationType === 'same-day' && '⚡ Same-Day'}
                  {item.isUrgent && ' • Urgent'}
                </p>
              </div>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                    <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                  </div>
              }
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard