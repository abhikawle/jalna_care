import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorSlots = () => {

    const { dToken } = useContext(DoctorContext)
    const { backendUrl } = useContext(AppContext)
    
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(false)
    const [createMode, setCreateMode] = useState(false)
    
    // Single slot form
    const [slotDate, setSlotDate] = useState('')
    const [slotTime, setSlotTime] = useState('')
    const [consultationType, setConsultationType] = useState('in-clinic')
    
    // Weekly bulk creation
    const [weeklyMode, setWeeklyMode] = useState(false)
    const [weekStart, setWeekStart] = useState('')
    const [weekEnd, setWeekEnd] = useState('')
    const [weeklyTimes, setWeeklyTimes] = useState(['09:00', '10:00', '11:00'])
    const [weeklyConsultationType, setWeeklyConsultationType] = useState('in-clinic')

    // Fetch slots for doctor
    const getDoctorSlots = async () => {
        try {
            setLoading(true)
            const { data } = await axios.post(backendUrl + '/api/slot/doctor-slots', {}, { headers: { dToken } })
            
            if (data.success) {
                setSlots(data.slots)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // Create single slot
    const handleCreateSlot = async (e) => {
        e.preventDefault()
        
        if (!slotDate || !slotTime) {
            toast.error('Please fill all fields')
            return
        }

        try {
            const { data } = await axios.post(backendUrl + '/api/slot/create-slots', {
                slots: [{ date: slotDate, time: slotTime, consultationType }]
            }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                setSlotDate('')
                setSlotTime('')
                setConsultationType('in-clinic')
                setCreateMode(false)
                getDoctorSlots()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // Create weekly slots
    const handleCreateWeeklySlots = async (e) => {
        e.preventDefault()
        
        if (!weekStart || !weekEnd || weeklyTimes.length === 0) {
            toast.error('Please fill all fields')
            return
        }

        try {
            const { data } = await axios.post(backendUrl + '/api/slot/create-weekly', {
                startDate: weekStart,
                endDate: weekEnd,
                times: weeklyTimes,
                consultationType: weeklyConsultationType
            }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                setWeekStart('')
                setWeekEnd('')
                setWeeklyTimes(['09:00', '10:00', '11:00'])
                setWeeklyConsultationType('in-clinic')
                setWeeklyMode(false)
                getDoctorSlots()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // Delete slot
    const handleDeleteSlot = async (slotId) => {
        if (window.confirm('Are you sure you want to delete this slot?')) {
            try {
                const { data } = await axios.post(backendUrl + '/api/slot/delete', { slotId }, { headers: { dToken } })

                if (data.success) {
                    toast.success(data.message)
                    getDoctorSlots()
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
                console.log(error)
            }
        }
    }

    const addTimeToWeekly = () => {
        setWeeklyTimes([...weeklyTimes, '14:00'])
    }

    const removeTimeFromWeekly = (index) => {
        setWeeklyTimes(weeklyTimes.filter((_, i) => i !== index))
    }

    useEffect(() => {
        if (dToken) {
            getDoctorSlots()
        }
    }, [dToken])

    // Count stats
    const totalSlots = slots.length
    const bookedSlots = slots.filter(s => s.isBooked).length
    const availableSlots = totalSlots - bookedSlots

    return (
        <div className='m-5'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-700'>Manage Your Slots</h2>
                <button 
                    onClick={() => setCreateMode(!createMode)}
                    className='px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all'
                >
                    {createMode ? 'Cancel' : '+ Add Slots'}
                </button>
            </div>

            {/* Stats */}
            <div className='flex flex-wrap gap-3 mb-6'>
                <div className='flex items-center gap-2 bg-white p-4 min-w-48 rounded border-2 border-gray-100'>
                    <div className='text-2xl'>📅</div>
                    <div>
                        <p className='text-xl font-semibold text-gray-600'>{totalSlots}</p>
                        <p className='text-gray-400 text-sm'>Total Slots</p>
                    </div>
                </div>
                <div className='flex items-center gap-2 bg-white p-4 min-w-48 rounded border-2 border-green-100'>
                    <div className='text-2xl'>✅</div>
                    <div>
                        <p className='text-xl font-semibold text-green-600'>{availableSlots}</p>
                        <p className='text-gray-400 text-sm'>Available</p>
                    </div>
                </div>
                <div className='flex items-center gap-2 bg-white p-4 min-w-48 rounded border-2 border-orange-100'>
                    <div className='text-2xl'>🔴</div>
                    <div>
                        <p className='text-xl font-semibold text-orange-600'>{bookedSlots}</p>
                        <p className='text-gray-400 text-sm'>Booked</p>
                    </div>
                </div>
            </div>

            {/* Create Slot Forms */}
            {createMode && (
                <div className='bg-white rounded-lg p-6 mb-6 border border-gray-100'>
                    <div className='flex gap-4 mb-6 border-b pb-4'>
                        <button 
                            onClick={() => setWeeklyMode(false)}
                            className={`px-4 py-2 rounded-full transition-all ${!weeklyMode ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Add Single Slot
                        </button>
                        <button 
                            onClick={() => setWeeklyMode(true)}
                            className={`px-4 py-2 rounded-full transition-all ${weeklyMode ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Add Weekly Slots
                        </button>
                    </div>

                    {!weeklyMode ? (
                        <form onSubmit={handleCreateSlot} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Date</label>
                                <input 
                                    type='date' 
                                    value={slotDate}
                                    onChange={(e) => setSlotDate(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg p-2'
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Time</label>
                                <input 
                                    type='time' 
                                    value={slotTime}
                                    onChange={(e) => setSlotTime(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg p-2'
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Consultation Type</label>
                                <select 
                                    value={consultationType}
                                    onChange={(e) => setConsultationType(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg p-2'
                                >
                                    <option value='in-clinic'>🏥 In-Clinic</option>
                                    <option value='video'>📱 Video Call</option>
                                    <option value='same-day'>⚡ Same-Day Urgent</option>
                                </select>
                            </div>
                            <button type='submit' className='w-full bg-primary text-white p-2 rounded-lg hover:bg-primary/90'>
                                Create Slot
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreateWeeklySlots} className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Start Date</label>
                                    <input 
                                        type='date' 
                                        value={weekStart}
                                        onChange={(e) => setWeekStart(e.target.value)}
                                        className='w-full border border-gray-300 rounded-lg p-2'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>End Date</label>
                                    <input 
                                        type='date' 
                                        value={weekEnd}
                                        onChange={(e) => setWeekEnd(e.target.value)}
                                        className='w-full border border-gray-300 rounded-lg p-2'
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Consultation Type</label>
                                <select 
                                    value={weeklyConsultationType}
                                    onChange={(e) => setWeeklyConsultationType(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg p-2'
                                >
                                    <option value='in-clinic'>🏥 In-Clinic</option>
                                    <option value='video'>📱 Video Call</option>
                                    <option value='same-day'>⚡ Same-Day Urgent</option>
                                </select>
                            </div>

                            <div>
                                <div className='flex justify-between items-center mb-2'>
                                    <label className='block text-sm font-medium text-gray-700'>Time Slots (Daily)</label>
                                    <button type='button' onClick={addTimeToWeekly} className='text-xs bg-gray-100 px-2 py-1 rounded'>+ Add Time</button>
                                </div>
                                <div className='space-y-2'>
                                    {weeklyTimes.map((time, index) => (
                                        <div key={index} className='flex gap-2'>
                                            <input 
                                                type='time' 
                                                value={time}
                                                onChange={(e) => {
                                                    const newTimes = [...weeklyTimes]
                                                    newTimes[index] = e.target.value
                                                    setWeeklyTimes(newTimes)
                                                }}
                                                className='flex-1 border border-gray-300 rounded-lg p-2'
                                            />
                                            {weeklyTimes.length > 1 && (
                                                <button 
                                                    type='button'
                                                    onClick={() => removeTimeFromWeekly(index)}
                                                    className='px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200'
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type='submit' className='w-full bg-primary text-white p-2 rounded-lg hover:bg-primary/90'>
                                Create Weekly Slots
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Slots List */}
            <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
                {loading ? (
                    <div className='p-6 text-center text-gray-500'>Loading slots...</div>
                ) : slots.length === 0 ? (
                    <div className='p-6 text-center text-gray-500'>No slots yet. Create your first slot!</div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead className='bg-gray-50 border-b'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Date</th>
                                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Time</th>
                                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Type</th>
                                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Status</th>
                                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slots.map((slot, index) => (
                                    <tr key={index} className='border-b hover:bg-gray-50'>
                                        <td className='px-6 py-3 text-sm text-gray-700'>{new Date(slot.date).toLocaleDateString()}</td>
                                        <td className='px-6 py-3 text-sm text-gray-700'>{slot.time}</td>
                                        <td className='px-6 py-3 text-sm'>
                                            {slot.consultationType === 'video' && '📱 Video'}
                                            {slot.consultationType === 'in-clinic' && '🏥 In-Clinic'}
                                            {slot.consultationType === 'same-day' && '⚡ Same-Day'}
                                        </td>
                                        <td className='px-6 py-3 text-sm'>
                                            {slot.isBooked ? (
                                                <span className='text-orange-600 font-medium'>🔴 Booked</span>
                                            ) : (
                                                <span className='text-green-600 font-medium'>✅ Available</span>
                                            )}
                                        </td>
                                        <td className='px-6 py-3 text-sm'>
                                            {!slot.isBooked && (
                                                <button 
                                                    onClick={() => handleDeleteSlot(slot._id)}
                                                    className='text-red-600 hover:text-red-800 font-medium'
                                                >
                                                    Delete
                                                </button>
                                            )}
                                            {slot.isBooked && <span className='text-gray-400'>Locked</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorSlots
