import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {

    const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext)
    const { currency, backendUrl } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)

    const updateProfile = async () => {

        try {

            const updateData = {
                address: profileData.address,
                fees: profileData.fees,
                about: profileData.about,
                available: profileData.available,
                clinicName: profileData.clinicName || '',
                clinicAddress: profileData.clinicAddress || '',
                consultationModes: profileData.consultationModes || ['in-clinic'],
                sameDayAvailable: profileData.sameDayAvailable || false
            }

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                toast.error(data.message)
            }

            setIsEdit(false)

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    const toggleConsultationMode = (mode) => {
        const currentModes = profileData.consultationModes || ['in-clinic']
        if (currentModes.includes(mode)) {
            setProfileData(prev => ({
                ...prev,
                consultationModes: currentModes.filter(m => m !== mode)
            }))
        } else {
            setProfileData(prev => ({
                ...prev,
                consultationModes: [...currentModes, mode]
            }))
        }
    }

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    return profileData && (
        <div>
            <div className='flex flex-col gap-4 m-5'>
                <div>
                    <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
                </div>

                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{profileData.name}</p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{profileData.degree} - {profileData.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About :</p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>
                            {
                                isEdit
                                    ? <textarea onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))} type='text' className='w-full outline-primary p-2' rows={8} value={profileData.about} />
                                    : profileData.about
                            }
                        </p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>
                        Appointment fee: <span className='text-gray-800'>{currency} {isEdit ? <input type='number' onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} value={profileData.fees} /> : profileData.fees}</span>
                    </p>

                    <div className='flex gap-2 py-2'>
                        <p>Address:</p>
                        <p className='text-sm'>
                            {isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address.line1} /> : profileData.address.line1}
                            <br />
                            {isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address.line2} /> : profileData.address.line2}
                        </p>
                    </div>

                    {/* ----- Clinic Info ----- */}
                    <div className='mt-4 pt-4 border-t'>
                        <p className='text-sm font-medium text-[#262626] mb-3'>Clinic Information:</p>
                        <div className='flex gap-2 py-2 mb-3'>
                            <p className='text-sm font-medium'>Clinic Name:</p>
                            <p className='text-sm'>
                                {isEdit 
                                    ? <input type='text' placeholder='Your clinic name' onChange={(e) => setProfileData(prev => ({ ...prev, clinicName: e.target.value }))} value={profileData.clinicName || ''} className='border rounded p-1 text-xs w-48' />
                                    : profileData.clinicName || 'Not specified'
                                }
                            </p>
                        </div>
                        <div className='flex gap-2 py-2 mb-3'>
                            <p className='text-sm font-medium'>Clinic Address:</p>
                            <p className='text-sm'>
                                {isEdit 
                                    ? <input type='text' placeholder='Your clinic address' onChange={(e) => setProfileData(prev => ({ ...prev, clinicAddress: e.target.value }))} value={profileData.clinicAddress || ''} className='border rounded p-1 text-xs w-48' />
                                    : profileData.clinicAddress || 'Not specified'
                                }
                            </p>
                        </div>
                    </div>

                    {/* ----- Consultation Modes ----- */}
                    <div className='mt-4 pt-4 border-t'>
                        <p className='text-sm font-medium text-[#262626] mb-3'>Consultation Modes:</p>
                        <div className='flex gap-6 flex-wrap'>
                            <div className='flex gap-2 items-center'>
                                <input 
                                    type='checkbox' 
                                    id='in-clinic'
                                    disabled={!isEdit}
                                    checked={(profileData.consultationModes || ['in-clinic']).includes('in-clinic')}
                                    onChange={() => isEdit && toggleConsultationMode('in-clinic')}
                                />
                                <label htmlFor='in-clinic' className='text-sm'>🏥 In-Clinic</label>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <input 
                                    type='checkbox' 
                                    id='video'
                                    disabled={!isEdit}
                                    checked={(profileData.consultationModes || ['in-clinic']).includes('video')}
                                    onChange={() => isEdit && toggleConsultationMode('video')}
                                />
                                <label htmlFor='video' className='text-sm'>📱 Video Call</label>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <input 
                                    type='checkbox' 
                                    id='same-day'
                                    disabled={!isEdit}
                                    checked={(profileData.consultationModes || ['in-clinic']).includes('same-day')}
                                    onChange={() => isEdit && toggleConsultationMode('same-day')}
                                />
                                <label htmlFor='same-day' className='text-sm'>⚡ Same-Day Urgent</label>
                            </div>
                        </div>
                    </div>

                    {/* ----- Same-Day Availability ----- */}
                    <div className='mt-4 pt-4 border-t'>
                        <div className='flex gap-2 items-center'>
                            <input 
                                type='checkbox' 
                                id='same-day-avail'
                                disabled={!isEdit}
                                checked={profileData.sameDayAvailable || false}
                                onChange={() => isEdit && setProfileData(prev => ({ ...prev, sameDayAvailable: !prev.sameDayAvailable }))}
                            />
                            <label htmlFor='same-day-avail' className='text-sm font-medium'>⚡ Available for Same-Day Urgent Appointments</label>
                        </div>
                        <p className='text-xs text-gray-500 mt-2 ml-6'>Enable this if you can accept urgent same-day bookings from patients</p>
                    </div>

                    <div className='flex gap-1 pt-4'>
                        <input type="checkbox" onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} checked={profileData.available} />
                        <label htmlFor="">Available</label>
                    </div>

                    {
                        isEdit
                            ? <button onClick={updateProfile} className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Save</button>
                            : <button onClick={() => setIsEdit(prev => !prev)} className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Edit</button>
                    }

                </div>
            </div>
        </div>
    )
}

export default DoctorProfile