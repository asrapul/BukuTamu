'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import useAuthMiddleware from '../hooks/auth';
import Profile from '../assets/svgs/ProfileHitam.svg';
import BgBlur2 from "../assets/images/BgBlur2.png";

function Page() {
  
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleLogoutClick = () => {
    setShowWarningModal(true);
  };

  const handleConfirmLogout = async () => {
    localStorage.removeItem("auth_token");
    await logout();
    router.push('/login2'); 
  };

  const handleCloseModal = () => {
    setShowWarningModal(false);
  };

  return (
    <div className="relative min-h-screen p-8 flex items-center justify-center">
      
      {/* Background Blur */}
      <div className="absolute inset-0 z-[-1]">
        <Image 
          src={BgBlur2} 
          alt="Background" 
          layout="fill" 
          objectFit="cover" 
          className="opacity-70 blur-md"
        />
      </div>

      {/* Profile Section */}
      <div className="relative bg-white border border-gray-300 rounded-lg p-8 shadow-lg w-full max-w-3xl flex flex-col lg:flex-row lg:items-center lg:space-x-8 backdrop-blur-md">
        
        {/* Tombol X untuk Keluar dari Halaman Biodata */}
        <button
          onClick={() => router.back()} // Kembali ke halaman sebelumnya
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold"
        >
          ❌
        </button>

        {/* Profile Image */}
        <div className="flex-shrink-0">
          <Image src={Profile} alt="Profile" width={100} height={100} className="rounded-full shadow-md" />
        </div>

        {/* Profile Details */}
        <div className="flex flex-col w-full">
          <div className="grid gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Nama</label>
              <input
                type="text"
                defaultValue={user?.username || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input
                type="text"
                defaultValue={user?.email || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
              <input
                type="text"
                defaultValue={user?.role || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tombol Logout */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLogoutClick}
                className="w-full bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Logout */}
      {showWarningModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4 text-center font-semibold">Apakah Anda yakin ingin keluar?</p>
            
            {/* Tombol Konfirmasi Logout & Batal */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-md"
              >
                Keluar
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 px-6 py-2 rounded-md"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
