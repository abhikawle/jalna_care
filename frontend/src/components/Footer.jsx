import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <div className='mb-5 flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F5F1] text-base font-bold text-[#1f7a6d]'>J</div>
            <div>
              <p className='text-lg font-bold text-[#1b443a]'>JalnaCare</p>
              <p className='text-[10px] uppercase tracking-[0.18em] text-gray-500'>Jalna, Maharashtra</p>
            </div>
          </div>
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>JalnaCare helps residents of Jalna discover trusted healthcare providers, book local appointments, and make informed care decisions with confidence.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Providers</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+91 96731 11424</li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>© 2026 JalnaCare — Trusted healthcare in Jalna.</p>
      </div>

    </div>
  )
}

export default Footer
