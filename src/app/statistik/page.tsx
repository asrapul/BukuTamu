"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import segitiga from "../assets/svgs/SegitigaSidebarKecil.svg";
import Icon from "../assets/svgs/IconTelkomSchool.svg";
import Daftar from "../assets/svgs/logoDaftarTamu.svg";
import { FaTelegramPlane } from "react-icons/fa";
import Orang from "../assets/svgs/LogoPengguna.svg";
import statistik from "../assets/svgs/StatistikPutih.svg";
import keluar from "../assets/svgs/LogoKeluar.svg";
import Home from "../assets/svgs/LogoHomeAbu.svg";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import PieChartComponent from "./piechart";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
//import useAuthMiddleware from "../hooks/auth";

function page() {
  //useAuthMiddleware();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleLogoutClick = () => {
    setShowWarningModal(true);
  };

  const handleConfirmLogout = async () => {
    localStorage.removeItem("auth_token");
    await logout();
  };

  const handleCloseModal = () => {
    setShowWarningModal(false);
  };
  return (
    <>
      <div className="bg-[#EBEAF2] w-[1280px] h-[720px] mx-auto overflow-hidden">
        <div className="flex h-full">
          <nav
            className="bg-[#BA272D] px-7 h-full"
            style={{ borderRadius: "0px 20px 20px 0px" }}
          >
            <Image
              src={Icon}
              alt=""
              width={50}
              className="absolute mt-[40px] ml-[-27px]"
            />
            <Image
              src={segitiga}
              alt=""
              className="absolute mt-[40px] ml-[-27px]"
            />
            <div className="absolute mt-[150px]">
              <Link href="/dashboard">
                <div className="ml-[-22px] rounded-lg hover:bg-[#9C0006] p-[7px]">
                  <Image src={Home} alt="Home" width={30} />
                </div>
              </Link>
              <Link href="daftaradmin">
                <div className="ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]">
                  <Image src={Daftar} alt="Home" width={30} />
                </div>
              </Link>

              <div className="ml-[-22px] rounded-lg mt-3 bg-[#9C0006] p-[7px]">
                <Image src={statistik} alt="Home" width={30} />
              </div>

              <Link href="/aksespengguna">
                <div className="ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]">
                  <Image src={Orang} alt="Home" width={30} />
                </div>
              </Link>

              <Link href="/akuntelegram">
              <div className='ml-[-20px]  text-[#d28c8f] text-2xl rounded-lg mt-3 hover:bg-[#9C0006] p-[8px]'>
              <FaTelegramPlane/>
              </div>
              </Link>
              <Link href="/staf">
                <div className="ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]">
                  <Image src={keluar} alt="keluar" width={30} />
                </div>
              </Link>
            </div>
          </nav>
          <div className="flex-1">
            <div className="flex justify-between px-8 mt-6">
              <Link href="/dashboard">
                <p className="flex text-[25px] items-center">
                  <MdOutlineKeyboardArrowLeft />
                  <span className="text-lg font-semibold">
                    Laporan Statistik
                  </span>
                </p>
              </Link>
              <p className="text-[25px] flex items-center">
                <FaRegUserCircle />
                <span className="text-base ml-2 font-semibold">admin lobi</span>
              </p>
            </div>
            <div className="mt-4 px-4">
              <PieChartComponent />
            </div>
          </div>
        </div>
      </div>
      {/* Modal Konfirmasi Logout */}
      {showWarningModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-12 rounded-lg">
            {/* Tombol Logout Design */}
            <p className="mb-4">Apakah Anda yakin ingin keluar?</p>

            {/* Tombol Logout  */}
            <div className="flex space-x-4">
              <button
                onClick={handleConfirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded mr-24"
              >
                Keluar
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default page;
