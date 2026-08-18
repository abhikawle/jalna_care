import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [consultationType, setConsultationType] = useState('in-clinic')
    const [reviews, setReviews] = useState([])
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getDoctorReviews = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/review/get-doctor-reviews', { docId })
            if (data.success) {
                setReviews(data.reviews || [])
            }
        } catch (error) {
            console.log(error)
        }
    }

    const submitReview = async () => {
        if (!token) {
            toast.warning('Login to leave a review')
            return navigate('/login')
        }

        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/add-review',
                { userId: JSON.parse(localStorage.getItem('userData') || '{}')._id || '', docId, rating: reviewRating, comment: reviewComment },
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                setReviewComment('')
                setReviewRating(5)
                await getDoctorReviews()
                if (doctors.length > 0) {
                    getDoctosData()
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getAvailableSolts = async () => {

        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {

            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];


            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {

                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))

        }

    }

    const bookAppointment = async () => {

        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year
        const isUrgent = consultationType === 'same-day' && slotIndex === 0

        try {

            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime, consultationType, isUrgent }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                getDoctosData()
                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
            getDoctorReviews()
        }
    }, [docInfo])

    return docInfo ? (
        <div>

            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <div className='flex items-center justify-between mb-3'>
                        <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                        {docInfo.isVerified && (
                            <span className='bg-green-100 text-green-700 text-sm font-semibold px-3 py-1.5 rounded'>✓ JalnaCare Verified</span>
                        )}
                    </div>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* Clinic details if available */}
                    {docInfo.clinicName && (
                        <div className='mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700'>
                            <p className='font-semibold'>{docInfo.clinicName}</p>
                            {docInfo.clinicAddress?.line1 && (
                                <p className='text-xs text-gray-600'>{docInfo.clinicAddress.line1}{docInfo.clinicAddress.line2 ? ', ' + docInfo.clinicAddress.line2 : ''}</p>
                            )}
                        </div>
                    )}

                    {/* Rating display */}
                    {docInfo.avgRating > 0 && (
                        <p className='text-sm text-gray-600 mt-2'>⭐ {docInfo.avgRating.toFixed(1)} rating ({docInfo.totalReviews} patients)</p>
                    )}

                    <div className='mt-4 rounded-xl border border-[#E1E7FF] bg-[#F7F9FF] p-4'>
                        <p className='text-sm font-semibold text-[#26314c]'>Patient feedback</p>
                        {reviews.length > 0 ? (
                            <div className='mt-3 space-y-3'>
                                {reviews.slice(0, 3).map((item, index) => (
                                    <div key={index} className='rounded-lg bg-white p-3 shadow-sm'>
                                        <div className='flex items-center justify-between'>
                                            <p className='text-sm font-medium text-gray-700'>{item.userName || 'Patient'}</p>
                                            <p className='text-xs text-[#5A5A5A]'>⭐ {item.rating}/5</p>
                                        </div>
                                        {item.comment && <p className='mt-2 text-xs text-gray-600'>{item.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='mt-3 text-xs text-gray-500'>No patient reviews yet. Be the first to share feedback.</p>
                        )}
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                
                {/* Consultation Type Selection */}
                <div className='mb-6 p-5 border border-[#E1E7FF] rounded-xl bg-[#F7F9FF]'>
                    <p className='font-semibold text-[#1b443a] mb-3'>How would you like to consult?</p>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                        {docInfo.consultationModes && docInfo.consultationModes.includes('in-clinic') && (
                            <button
                                onClick={() => setConsultationType('in-clinic')}
                                className={`p-4 rounded-lg border-2 text-center transition ${
                                    consultationType === 'in-clinic'
                                        ? 'border-[#1f7a6d] bg-[#edf7f5] text-[#1f7a6d]'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <p className='text-lg font-semibold'>🏥</p>
                                <p className='text-sm font-medium mt-1'>In-Clinic</p>
                                <p className='text-xs text-gray-500 mt-1'>Visit in person</p>
                            </button>
                        )}
                        {docInfo.consultationModes && docInfo.consultationModes.includes('video') && (
                            <button
                                onClick={() => setConsultationType('video')}
                                className={`p-4 rounded-lg border-2 text-center transition ${
                                    consultationType === 'video'
                                        ? 'border-[#1f7a6d] bg-[#edf7f5] text-[#1f7a6d]'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <p className='text-lg font-semibold'>📱</p>
                                <p className='text-sm font-medium mt-1'>Video Call</p>
                                <p className='text-xs text-gray-500 mt-1'>Consult from home</p>
                            </button>
                        )}
                        {docInfo.sameDayAvailable && (
                            <button
                                onClick={() => setConsultationType('same-day')}
                                className={`p-4 rounded-lg border-2 text-center transition relative ${
                                    consultationType === 'same-day'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-orange-200 bg-orange-50 text-gray-700 hover:border-orange-300'
                                }`}
                            >
                                <p className='absolute top-2 right-2 text-xs font-bold text-orange-600 bg-orange-200 px-2 py-1 rounded'>URGENT</p>
                                <p className='text-lg font-semibold'>⚡</p>
                                <p className='text-sm font-medium mt-1'>Same-Day</p>
                                <p className='text-xs text-gray-600 mt-1'>Fast appointment today</p>
                            </button>
                        )}
                    </div>
                </div>
                
                <p>Booking slots</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots.map((item, index) => (
                        <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}>
                            <p>{daysOfWeek[(new Date().getDay() + index) % 7]}</p>
                            <p>{new Date(new Date().setDate(new Date().getDate() + index)).getDate()}</p>
                        </div>
                    ))}
                </div>

                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots[slotIndex].map((item, index) => (
                        <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light  flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>{item.time.toLowerCase()}</p>
                    ))}
                </div>

                <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>Book an appointment</button>
            </div>

            <div className='mt-8 rounded-2xl border border-[#DDE8FF] bg-[#F9FBFF] p-5'>
                <p className='text-lg font-semibold text-[#1b443a]'>Share your experience</p>
                <div className='mt-4 flex items-center gap-2'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type='button'
                            onClick={() => setReviewRating(star)}
                            className={`text-xl ${star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className='mt-4 w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-700'
                    placeholder='Tell other Jalna patients about your care experience.'
                />
                <button onClick={submitReview} className='mt-4 rounded-full bg-[#163f38] px-5 py-2 text-sm font-medium text-white'>Submit review</button>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
                <div className='mt-8'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Patient Reviews ({reviews.length})</h3>
                    <div className='space-y-4'>
                        {reviews.slice(0, 5).map((review, index) => (
                            <div key={index} className='border border-gray-200 rounded-lg p-4 bg-white'>
                                <div className='flex items-start justify-between mb-2'>
                                    <div>
                                        <p className='font-medium text-gray-800'>{review.userName || 'Anonymous'}</p>
                                        <div className='flex items-center gap-1 mt-1'>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} className={`text-sm ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                            ))}
                                            <span className='text-sm text-gray-600 ml-2'>({review.rating}/5)</span>
                                        </div>
                                    </div>
                                    <span className='text-xs text-gray-500'>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className='text-gray-700 text-sm mt-2'>{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment