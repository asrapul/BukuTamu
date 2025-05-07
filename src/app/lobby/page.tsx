"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Efek from '../assets/svgs/IconCard.svg'
import Lonceng from '../assets/svgs/Lonceng.svg'
import runcingstaf from '../assets/svgs/runcingstaf.svg'
import Profile from '../assets/svgs/Profile.svg'
import iconTS from '../assets/images/IconSchool.png'
import Bulat from '../assets/svgs/BulatStaff.svg'
import LingkaranBesar from '../assets/svgs/lingkaranbesarstaf.svg'
import TelkomLingkaran from '../assets/images/TelkomLingkaran.png'
import Image from 'next/image';

function page() {
  // Add state for popup
  const [showPopup, setShowPopup] = useState(true);

  // Add effect to hide popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative bg-[#BC2D32] min-h-screen w-full overflow-hidden">
      {/* Welcome Popup */}
      {showPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-lg shadow-xl border-l-4 border-[#BC2D32] animate-slideDown">
          <div className="text-center">
            <h2 className="text-base font-semibold text-[#BC2D32]">Selamat Datang di Website Catatan Buku Tamu</h2>
          </div>
        </div>
      )}
      
      {/* Background Elements */}
      <div className='right-0 absolute top-0 mt-[39px] z-0'>
        <Image src={LingkaranBesar} alt='Bulat nempel dikanan'/>
      </div>
      
      {/* Circular Telkom Image */}
      <div className='absolute right-[12%] mt-[230px] z-0 md:right-[12%] lg:right-[12%] xl:right-[12%] 2xl:right-[12%] md:mt-[230px] lg:mt-[230px] xl:mt-[230px] 2xl:mt-[230px]'>
        <div className="rounded-full overflow-hidden shadow-lg w-[300px] h-[300px] md:w-[380px] md:h-[380px]">
          <Image 
            src={TelkomLingkaran} 
            alt='Telkom Logo' 
            width={300}
            height={300}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      
      {/* Navbar */}
        <nav className="bg-[#BC2D32] text-white p-3 shadow-xl relative z-10">
        <Image src={runcingstaf} alt='runcingstaf' className='absolute top-0 z-0' height={70}/>
        <div className="container mx-auto flex justify-between items-center relative z-20">
          <div className="flex items-center mt-[-10px] pb-2 ml-[6px]">
            <Image src={iconTS} alt='IconTS' height={49} />
          </div>
            <Link href="/profile">
              <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 mr-[40px]">
                <Image src={Profile} alt='Profile' height={27} />
              </div>
            </Link>
          </div>
      </nav>
      
      {/* Main Content - Text and Button */}
      <div className="absolute left-[60px] top-[260px] z-50 text-white max-w-[500px] md:left-[60px] lg:left-[60px] xl:left-[60px] 2xl:left-[60px]">
        <h1 className="text-4xl md:text-5xl font-medium mb-4 whitespace-nowrap tracking-normal">BUKU TAMU SMK Telkom <br/> Makassar</h1>
        <p className="text-lg md:text-xl tracking-wider whitespace-nowrap mb-8">
          Hadir untuk mempermudah pencatatan dan <br/> pengelolaan data kunjungan di sekolah.
        </p>
        <div className="ml-[130px]">
          <Link href="/Staf">
            <button className="bg-gray-200 text-black px-6 py-2 rounded-full font-medium flex items-center hover:bg-white transition-colors">
              Daftar Tamu
              <Image src={Efek} alt="Icon Card" width={24} height={24} className="ml-2" />
            </button>
          </Link>
        </div>
      </div>
      
      <div>
        <div className='mt-[71px] flex absolute'>
          <Image src={Bulat} alt='Bulat nempel dikiri' />
        </div>
      </div>
    </div>
  )
}

export default page
