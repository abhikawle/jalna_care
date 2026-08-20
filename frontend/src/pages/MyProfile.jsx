import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { JALNA_TALUKA_OPTIONS, JALNA_TALUKAS } from '../constants/jalnaLocations'
import { useTranslation } from 'react-i18next'

const MyProfile = () => {

    const [isEdit, setIsEdit] = useState(false)

    const [image, setImage] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)
    const { t } = useTranslation()

    // Function to update user profile data using API
    const updateUserProfileData = async () => {

        try {

            const formData = new FormData();

            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)
            formData.append('taluka', userData.taluka || '')
            formData.append('village', userData.village || '')
            formData.append('language', localStorage.getItem('jalnacare-language') || 'en')
            formData.append('notificationsEnabled', userData.notificationsEnabled !== false)

            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    return userData ? (
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>

            {isEdit
                ? <label htmlFor='image' >
                    <div className='inline-block relative cursor-pointer'>
                        <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
                        <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt="" />
                    </div>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                </label>
                : <img className='w-36 rounded' src={userData.image} alt="" />
            }

            {isEdit
                ? <input className='bg-gray-50 text-3xl font-medium max-w-60' type="text" onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} value={userData.name} />
                : <p className='font-medium text-3xl text-[#262626] mt-4'>{userData.name}</p>
            }

            <hr className='bg-[#ADADAD] h-[1px] border-none' />

            <div className='rounded-2xl border border-blue-100 bg-blue-50 p-4'>
                <p className='font-semibold text-slate-800'>{t('language')}</p>
                <div className='mt-3'><LanguageSwitcher /></div>
                <label className='mt-4 flex min-h-12 items-center justify-between gap-3 text-sm text-slate-700'>
                    <span>{t('notificationsEnabled')}</span>
                    <input type='checkbox' checked={userData.notificationsEnabled !== false} onChange={(event) => setUserData(prev => ({ ...prev, notificationsEnabled: event.target.checked }))} className='h-5 w-5 accent-blue-600' />
                </label>
            </div>

            <div>
                <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{userData.email}</p>
                    <p className='font-medium'>Phone:</p>

                    {isEdit
                        ? <input className='bg-gray-50 max-w-52' type="text" onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} value={userData.phone} />
                        : <p className='text-blue-500'>{userData.phone}</p>
                    }

                    <p className='font-medium'>Address:</p>

                    {isEdit
                        ? <p>
                            <input className='bg-gray-50' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address.line1} />
                            <br />
                            <input className='bg-gray-50' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address.line2} /></p>
                        : <p className='text-gray-500'>{userData.address.line1} <br /> {userData.address.line2}</p>
                    }

                    <p className='font-medium'>Taluka:</p>
                    {isEdit ? <select className='bg-gray-50' value={userData.taluka || ''} onChange={(event) => setUserData(prev => ({ ...prev, taluka: event.target.value, village: '' }))}><option value=''>{t('selectTaluka')}</option>{JALNA_TALUKA_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select> : <p className='text-gray-500'>{userData.taluka || '-'}</p>}
                    <p className='font-medium'>Village:</p>
                    {isEdit ? <select className='bg-gray-50' disabled={!userData.taluka} value={userData.village || ''} onChange={(event) => setUserData(prev => ({ ...prev, village: event.target.value }))}><option value=''>Select village</option>{(JALNA_TALUKAS[userData.taluka] || []).map((item) => <option key={item}>{item}</option>)}</select> : <p className='text-gray-500'>{userData.village || '-'}</p>}

                </div>
            </div>
            <div>
                <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                    <p className='font-medium'>Gender:</p>

                    {isEdit
                        ? <select className='max-w-20 bg-gray-50' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender} >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        : <p className='text-gray-500'>{userData.gender}</p>
                    }

                    <p className='font-medium'>Birthday:</p>

                    {isEdit
                        ? <input className='max-w-28 bg-gray-50' type='date' onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} value={userData.dob} />
                        : <p className='text-gray-500'>{userData.dob}</p>
                    }

                </div>
            </div>
            <div className='mt-10'>

                {isEdit
                    ? <button onClick={updateUserProfileData} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Save information</button>
                    : <button onClick={() => setIsEdit(true)} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Edit</button>
                }

            </div>
        </div>
    ) : null
}

export default MyProfile