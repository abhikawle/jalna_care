import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const VerifyProviders = () => {

    const [pendingProviders, setPendingProviders] = useState([])
    const [allProviders, setAllProviders] = useState([])
    const [filterStatus, setFilterStatus] = useState('pending')
    const [selectedProvider, setSelectedProvider] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const { aToken } = useContext(AdminContext)
    const { backendUrl } = useContext(AppContext)

    // Fetch pending providers
    const fetchPendingProviders = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/pending-providers', { headers: { aToken } })
            if (data.success) {
                setPendingProviders(data.providers)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Fetch all doctors for filter view
    const fetchAllProviders = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setAllProviders(data.doctors)
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Update verification status
    const handleVerifyProvider = async (docId, status) => {
        try {
            const payload = {
                docId,
                verificationStatus: status,
            }
            if (status === 'rejected' && rejectionReason) {
                payload.rejectionReason = rejectionReason
            }

            const { data } = await axios.post(backendUrl + '/api/admin/verify-provider', payload, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setSelectedProvider(null)
                setRejectionReason('')
                fetchPendingProviders()
                fetchAllProviders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (aToken) {
            fetchPendingProviders()
            fetchAllProviders()
        }
    }, [aToken])

    const getDisplayProviders = () => {
        if (filterStatus === 'pending') return pendingProviders
        return allProviders.filter(p => p.verificationStatus === filterStatus)
    }

    const displayProviders = getDisplayProviders()

    return (
        <div className='m-5 max-w-6xl'>
            <h1 className='text-2xl font-bold mb-6 text-gray-800'>Provider Verification Management</h1>

            {/* Filter Tabs */}
            <div className='flex gap-3 mb-6'>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded font-medium transition ${filterStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Pending ({pendingProviders.length})
                </button>
                <button
                    onClick={() => setFilterStatus('verified')}
                    className={`px-4 py-2 rounded font-medium transition ${filterStatus === 'verified' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Verified
                </button>
                <button
                    onClick={() => setFilterStatus('rejected')}
                    className={`px-4 py-2 rounded font-medium transition ${filterStatus === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Rejected
                </button>
                <button
                    onClick={() => setFilterStatus('suspended')}
                    className={`px-4 py-2 rounded font-medium transition ${filterStatus === 'suspended' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Suspended
                </button>
            </div>

            {/* Provider List */}
            <div className='grid grid-cols-1 gap-4'>
                {displayProviders.length > 0 ? (
                    displayProviders.map((provider) => (
                        <div key={provider._id} className='border border-gray-300 rounded-lg p-4 hover:shadow-md transition'>
                            <div className='flex items-start justify-between gap-4'>
                                <div className='flex-1'>
                                    <img src={provider.image} alt='' className='w-20 h-20 object-cover rounded-lg mb-3' />
                                    <h3 className='text-lg font-semibold text-gray-800'>{provider.name}</h3>
                                    <p className='text-sm text-gray-600'>{provider.speciality}</p>
                                    <p className='text-sm text-gray-600'>Degree: {provider.degree} · Experience: {provider.experience}</p>
                                    <p className='text-sm text-gray-600'>Location: {provider.address?.taluka || '-'} · {provider.address?.village || '-'}</p>
                                    <p className='text-sm text-gray-600'>Email: {provider.email}</p>
                                    {provider.clinicName && (
                                        <p className='text-sm text-gray-600'>Clinic: {provider.clinicName}</p>
                                    )}
                                    {provider.phoneNumber && (
                                        <p className='text-sm text-gray-600'>Phone: {provider.phoneNumber}</p>
                                    )}
                                    <p className='text-sm text-gray-600'>Home visit: {provider.homeVisitAvailable ? `Yes · ₹${provider.homeVisitFee || 0}` : 'No'}</p>
                                    {provider.rejectionReason && (
                                        <p className='text-sm text-red-600 mt-2'>Rejection Reason: {provider.rejectionReason}</p>
                                    )}
                                    <div className='mt-2'>
                                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                                            provider.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                            provider.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                            provider.verificationStatus === 'suspended' ? 'bg-gray-100 text-gray-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {provider.verificationStatus.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons (only for pending) */}
                                {(filterStatus === 'pending' || filterStatus === 'verified' || filterStatus === 'rejected' || filterStatus === 'suspended') && (
                                    <div className='flex gap-2'>
                                        {(filterStatus === 'pending' || filterStatus === 'rejected' || filterStatus === 'suspended') && <button
                                            onClick={() => handleVerifyProvider(provider._id, 'verified')}
                                            className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-sm font-medium'
                                        >
                                            Approve
                                        </button>}
                                        {(filterStatus === 'pending' || filterStatus === 'verified') && <button
                                            onClick={() => setSelectedProvider(selectedProvider?._id === provider._id ? null : provider)}
                                            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-medium'
                                        >
                                            Reject
                                        </button>}
                                        {(filterStatus === 'pending' || filterStatus === 'verified' || filterStatus === 'rejected') && <button
                                            onClick={() => handleVerifyProvider(provider._id, 'suspended')}
                                            className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-sm font-medium'
                                        >
                                            Suspend
                                        </button>}
                                    </div>
                                )}
                            </div>

                            {/* Rejection Form */}
                            {selectedProvider?._id === provider._id && filterStatus === 'pending' && (
                                <div className='mt-4 p-4 bg-gray-100 rounded'>
                                    <label className='text-sm font-medium text-gray-700 block mb-2'>Rejection Reason</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className='w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3'
                                        placeholder='Enter reason for rejection'
                                        rows={3}
                                    />
                                    <div className='flex gap-2'>
                                        <button
                                            onClick={() => handleVerifyProvider(provider._id, 'rejected')}
                                            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-medium'
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedProvider(null)
                                                setRejectionReason('')
                                            }}
                                            className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition text-sm font-medium'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className='text-gray-600 text-center py-8'>No providers in this category.</p>
                )}
            </div>
        </div>
    )
}

export default VerifyProviders
