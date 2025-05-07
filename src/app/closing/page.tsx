"use client"
import React, { useState, useEffect } from "react";
import TelkomPutih from "../assets/images/IconSchool.png";
import Image from "next/image";
import Stelker from "../assets/images/Stelker.png";
import Background from "../assets/images/Background.png";
import { useRouter } from "next/navigation";

function page() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen relative w-full h-[720px] max-w-[1280px] mx-auto overflow-hidden">
      {/* Red gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#c5192d] to-transparent z-5"></div>

      <div className="relative z-10 pt-5">
        <Image src={TelkomPutih} alt="TS" width={200} className="ml-2" />
        
        <div className="relative flex justify-center mt-36">
          <div>
          <p className="absolute text-center text-white z-20 text-2xl md:top-24 w-full px-4">
            Terima kasih telah mengunjungi SMK Telkom Makassar.<br/> Kami tunggu
            kedatangan Anda kembali! Semoga hari Anda menyenangkan.
          </p>
          <p className="absolute text-center text-slate-200 text-lg mt-20 md:mt-0 z-20 top-48 w-full px-4">
            Kembali ke halaman utama dalam <span className="font-bold">{countdown}</span> detik
          </p>
          </div>
          
          <Image
            src={Stelker}
            alt="Stelker"
            className="z-10 block opacity-0 md:opacity-100"  
          />
        </div>
      </div>
      <Image
        src={Background}
        alt="background"
        className="absolute bottom-0 left-0 w-full object-cover z-0"
        priority
      />
    </div>
  );
}

export default page;