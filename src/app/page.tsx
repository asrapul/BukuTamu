import React from "react";
import icon from "./assets/svgs/TelkomSchool.svg";
import Image from "next/image";
import bulatlkiri from "./assets/svgs/LingkaranKiri.svg";
import segitiga1 from "./assets/svgs/SegitigaBawah.svg";
import segitiga2 from "./assets/svgs/SegitigaAtas.svg";
import Gambar from "./assets/images/smktelkom.png";
import bulatlkanan from "./assets/svgs/LingkaranKanan.svg";
import Link from "next/link";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";

function page() {
  return (
    <div style={{ backgroundColor: "#BC2D32" }} className="min-h-screen">
      {/* Desktop View */}
      <div className="hidden xl:flex justify min-h-screen">
        <div className="mt-6">
          <Image alt="Icon" src={icon} />

          <Image alt="bulat kiri" src={bulatlkiri} className="mt-[60px]" />
          <div className="absolute ml-[100px] mt-[-90px]">
            <p className="text-white font-medium text-5xl">
              Selamat datang di <br />
              SMK Telkom Makassar
            </p>
            <Link href="/form">
              <button className="bg-white hover:bg-red-800 hover:p-[10px] transition duration-300 ease-in-out hover:text-white flex text-[#E4262C] p-[7px] text-[14px] mt-6 ml-[150px] rounded-[13px]">
                <HiOutlineClipboardDocumentList className="text-[19px] mt-[2px] ml-2 mr-1" />
                <span className="mt-[2px] tracking-wider mr-2">
                  Isi Formulir
                </span>
              </button>
            </Link>
          </div>
          <Image alt="segitiga" src={segitiga1} className="mt-[58px]" />
        </div>

        <div>
          <Image alt="segitiga2" src={segitiga2} className="ml-[380px]" />
          <div className="">
            <Image
              alt="bulatkanan"
              src={bulatlkanan}
              className="ml-[90px] mt-[-70px] mb-10"
            />
            <p className="ml-[145px] text-[#ce6b6f]">Dibuat Oleh XI RPL 4</p>
          </div>
        </div>
        <Image
          alt="Gambar"
          src={Gambar}
          className="absolute ml-[625px]"
          width={655}
        />
      </div>

      <div className="xl:hidden flex flex-col items-center text-center px-6 py-10 gap-6 min-h-screen">
        <Image alt="Icon" src={icon} width={140} />
        <p className="text-white text-3xl font-semibold leading-relaxed">
          Selamat datang di SMK <br />
          Telkom Makassar
        </p>

        <Image
          alt="Gambar"
          src={Gambar}
          className="rounded-lg shadow-md"
          width={300}
        />

        <Link href="/form">
          <button className="bg-white text-[#E4262C] hover:bg-red-800 hover:text-white px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition duration-300">
            <HiOutlineClipboardDocumentList className="text-lg" />
            Isi Formulir
          </button>
        </Link>

        <p className="text-white text-sm mt-6">Dibuat Oleh Example</p>
      </div>
    </div>
  );
}

export default page;