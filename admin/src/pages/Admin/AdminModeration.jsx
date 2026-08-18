import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const AdminModeration = () => {
    const { backendUrl, aToken } = useContext(AdminContext)
    const [activeTab, setActiveTab] = useState('pending')
    const [pendingReviews, setPendingReviews] = useState([])
    const [flaggedReviews, setFlaggedReviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [showFlagModal, setShowFlagModal] = useState(false)
    const [selectedReview, setSelectedReview] = useState(null)
    const [flagReason, setFlagReason] = useState('')
    const [flagReasons] = useState([
        'Inappropriate language',
        'Spam or advertisement',
        'Irrelevant to service',
        'Personally identifying information',
        'Harassment or abuse',
        'Other'
    ])

    // Fetch pending reviews
    const fetchPendingReviews = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/moderation/pending-reviews', {
                headers: { aToken }
            })
            if (data.success) {
                setPendingReviews(data.reviews || [])
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load pending reviews')
        } finally {
            setLoading(false)
        }
    }

    // Fetch flagged reviews
    const fetchFlaggedReviews = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/moderation/flagged-reviews', {
                headers: { aToken }
            })
            if (data.success) {
                setFlaggedReviews(data.reviews || [])
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to load flagged reviews')
        } finally {
            setLoading(false)
        }
    }

    // Approve a review
    const approveReview = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/moderation/approve', {
                appointmentId
            }, {
                headers: { aToken }
            })
            if (data.success) {
                toast.success('Review approved successfully')
                fetchPendingReviews()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to approve review')
        }
    }

    // Flag a review
    const submitFlag = async () => {
        if (!flagReason.trim()) {
            toast.error('Please select or enter a reason for flagging')
            return
        }

        try {
            const { data } = await axios.post(backendUrl + '/api/moderation/flag', {
                appointmentId: selectedReview.appointmentId,
                reason: flagReason
            }, {
                headers: { aToken }
            })
            if (data.success) {
                toast.success('Review flagged successfully')
                setShowFlagModal(false)
                setFlagReason('')
                setSelectedReview(null)
                fetchPendingReviews()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to flag review')
        }
    }

    // Delete a flagged review
    const deleteFlaggedReview = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return

        try {
            const { data } = await axios.post(backendUrl + '/api/moderation/delete-flagged', {
                appointmentId
            }, {
                headers: { aToken }
            })
            if (data.success) {
                toast.success('Flagged review deleted successfully')
                fetchFlaggedReviews()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to delete review')
        }
    }

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingReviews()
        } else {
            fetchFlaggedReviews()
        }
    }, [activeTab])

    return (
        <div className='m-5 max-w-4xl'>
            <h1 className='text-2xl font-bold text-gray-800 mb-6'>Review Moderation</h1>

            {/* Tab Navigation */}
            <div className='flex gap-4 mb-6 border-b border-gray-300'>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-semibold transition ${
                        activeTab === 'pending'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Pending Reviews ({pendingReviews.length})
                </button>
                <button
                    onClick={() => setActiveTab('flagged')}
                    className={`px-6 py-3 font-semibold transition ${
                        activeTab === 'flagged'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Flagged Reviews ({flaggedReviews.length})
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className='text-center py-8'>
                    <p className='text-gray-600'>Loading reviews...</p>
                </div>
            )}

            {/* Pending Reviews Tab */}
            {activeTab === 'pending' && !loading && (
                <div>
                    {pendingReviews.length === 0 ? (
                        <div className='text-center py-8'>
                            <p className='text-gray-600'>No pending reviews to moderate</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {pendingReviews.map((review, index) => (
                                <div key={index} className='border border-gray-300 rounded-lg p-6 bg-white hover:shadow-lg transition'>
                                    <div className='flex justify-between items-start mb-3'>
                                        <div>
                                            <p className='font-semibold text-gray-800'>{review.docName}</p>
                                            <p className='text-sm text-gray-600'>Patient: {review.userName}</p>
                                        </div>
                                        <div className='text-right'>
                                            <div className='flex items-center gap-1 justify-end'>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className={`text-lg ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                                ))}
                                            </div>
                                            <p className='text-xs text-gray-500'>{new Date(review.reviewedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {review.comment && (
                                        <p className='text-gray-700 mb-4 p-3 bg-gray-50 rounded'>{review.comment}</p>
                                    )}

                                    <div className='flex gap-3 justify-end'>
                                        <button
                                            onClick={() => {
                                                setSelectedReview(review)
                                                setShowFlagModal(true)
                                            }}
                                            className='px-4 py-2 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition'
                                        >
                                            Flag
                                        </button>
                                        <button
                                            onClick={() => approveReview(review.appointmentId)}
                                            className='px-4 py-2 rounded-full bg-green-50 text-green-600 font-medium hover:bg-green-100 transition'
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Flagged Reviews Tab */}
            {activeTab === 'flagged' && !loading && (
                <div>
                    {flaggedReviews.length === 0 ? (
                        <div className='text-center py-8'>
                            <p className='text-gray-600'>No flagged reviews</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {flaggedReviews.map((review, index) => (
                                <div key={index} className='border border-red-300 rounded-lg p-6 bg-red-50 hover:shadow-lg transition'>
                                    <div className='flex justify-between items-start mb-3'>
                                        <div>
                                            <p className='font-semibold text-gray-800'>{review.docName}</p>
                                            <p className='text-sm text-gray-600'>Patient: {review.userName}</p>
                                        </div>
                                        <div className='text-right'>
                                            <div className='flex items-center gap-1 justify-end'>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className={`text-lg ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                                ))}
                                            </div>
                                            <p className='text-xs text-gray-500'>{new Date(review.reviewedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {review.comment && (
                                        <p className='text-gray-700 mb-3 p-3 bg-white rounded'>{review.comment}</p>
                                    )}

                                    <div className='mb-4 p-3 bg-white rounded border border-red-200'>
                                        <p className='text-sm font-semibold text-red-700 mb-1'>Flag Reason:</p>
                                        <p className='text-sm text-gray-700'>{review.moderationReason}</p>
                                        <p className='text-xs text-gray-500 mt-2'>
                                            Flagged on: {new Date(review.moderatedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className='flex gap-3 justify-end'>
                                        <button
                                            onClick={() => deleteFlaggedReview(review.appointmentId)}
                                            className='px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition'
                                        >
                                            Delete Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Flag Modal */}
            {showFlagModal && selectedReview && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg p-8 max-w-md w-full shadow-xl'>
                        <h2 className='text-xl font-bold text-gray-800 mb-4'>Flag Review</h2>
                        
                        <div className='mb-4 p-3 bg-gray-50 rounded'>
                            <p className='text-sm text-gray-600'>Doctor: <span className='font-semibold text-gray-800'>{selectedReview.docName}</span></p>
                            <p className='text-sm text-gray-600'>Rating: <span className='font-semibold'>⭐ {selectedReview.rating}/5</span></p>
                        </div>

                        <div className='mb-6'>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>Flag Reason:</label>
                            <select
                                value={flagReason}
                                onChange={(e) => setFlagReason(e.target.value)}
                                className='w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-primary mb-2'
                            >
                                <option value=''>Select a reason...</option>
                                {flagReasons.map((reason, idx) => (
                                    <option key={idx} value={reason}>{reason}</option>
                                ))}
                            </select>
                            {flagReason === 'Other' && (
                                <textarea
                                    placeholder='Please specify the reason'
                                    value={flagReason === 'Other' ? '' : flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                    className='w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-primary'
                                    rows='3'
                                />
                            )}
                        </div>

                        <div className='flex gap-3'>
                            <button
                                onClick={() => {
                                    setShowFlagModal(false)
                                    setFlagReason('')
                                    setSelectedReview(null)
                                }}
                                className='flex-1 px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitFlag}
                                className='flex-1 px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition'
                            >
                                Flag Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminModeration
