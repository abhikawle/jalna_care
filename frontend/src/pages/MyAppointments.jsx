import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [reviewLoading, setReviewLoading] = useState(false)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    // Function to open review modal
    const openReviewModal = (appointment) => {
        setSelectedAppointment(appointment)
        if (appointment.hasReview && appointment.review) {
            setRating(appointment.review.rating)
            setComment(appointment.review.comment)
        } else {
            setRating(5)
            setComment('')
        }
        setShowReviewModal(true)
    }

    // Function to submit review
    const submitReview = async () => {
        if (!selectedAppointment) return

        try {
            setReviewLoading(true)
            const { data } = await axios.post(
                backendUrl + '/api/review/submit',
                {
                    appointmentId: selectedAppointment._id,
                    docId: selectedAppointment.docId,
                    rating,
                    comment
                },
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                setShowReviewModal(false)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setReviewLoading(false)
        }
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {

                console.log(response)

                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.message)
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            if (data.success) {
                initPay(data.order)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            if (data.success) {
                const { session_url } = data
                window.location.replace(session_url)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }



    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [token])

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div className=''>
                {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-36 bg-[#EAEFFF]' src={item.docData.image} alt="" />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>{item.docData.name}</p>
                            <p>{item.docData.speciality}</p>
                            <div className='mt-2 flex flex-wrap gap-2'>
                                {item.consultationType && (
                                    <span className='rounded-full bg-[#edf7f5] px-2 py-1 text-xs font-medium text-[#1f7a6d]'>
                                        {item.consultationType === 'same-day' ? '⚡ Same-day' : item.consultationType === 'video' ? '📱 Video' : '🏥 In-clinic'}
                                    </span>
                                )}
                                {item.isUrgent && (
                                    <span className='rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700'>Urgent</span>
                                )}
                            </div>
                            {!item.cancelled && <div className='mt-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800'><p className='font-semibold'>Contact Doctor</p><p>{item.docData.phoneNumber || 'Phone number unavailable'}</p><p>{item.docData.clinicAddress?.line1 || item.docData.address?.line1}</p><div className='mt-2 flex gap-2'><a href={`tel:${item.docData.phoneNumber}`} className='rounded bg-green-700 px-3 py-1 text-white'>Call Now</a>{item.docData.phoneNumber && <a href={`https://wa.me/${item.docData.phoneNumber.replace(/\D/g, '')}`} target='_blank' rel='noreferrer' className='rounded border border-green-700 px-3 py-1 text-green-700'>WhatsApp</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.docData.clinicAddress?.line1 || item.docData.address?.line1 || '')}`} target='_blank' rel='noreferrer' className='rounded border border-green-700 px-3 py-1 text-green-700'>Directions</a></div></div>}
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p className=''>{item.docData.address.line1}</p>
                            <p className=''>{item.docData.address.line2}</p>
                            <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} |  {item.slotTime}</p>
                        </div>
                        <div></div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentStripe(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.stripe_logo} alt="" /></button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" /></button>}
                            {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]'>Paid</button>}

                            {item.isCompleted && !item.hasReview && <button onClick={() => openReviewModal(item)} className='sm:min-w-48 py-2 border border-blue-500 rounded text-blue-500 hover:bg-blue-50 transition-all'>Rate Doctor</button>}
                            {item.isCompleted && item.hasReview && <button onClick={() => openReviewModal(item)} className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500 flex items-center justify-center gap-1'>⭐ {item.review?.rating} | Edit</button>}

                            {!item.cancelled && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                            {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedAppointment && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-lg shadow-lg max-w-md w-full p-6'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='text-lg font-semibold text-gray-800'>Rate your experience</h3>
                            <button onClick={() => setShowReviewModal(false)} className='text-gray-500 hover:text-gray-700 text-2xl'>×</button>
                        </div>

                        <p className='text-sm text-gray-600 mb-2'>Dr. {selectedAppointment.docData.name}</p>

                        {/* Star Rating */}
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Rating</label>
                            <div className='flex gap-2'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-3xl transition-all ${
                                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Your feedback (optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder='Share your experience...'
                                className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                                rows='3'
                            />
                        </div>

                        {/* Buttons */}
                        <div className='flex gap-2'>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className='flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReview}
                                disabled={reviewLoading}
                                className='flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50'
                            >
                                {reviewLoading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyAppointments