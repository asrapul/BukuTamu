"use client";
import React from "react";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import Stelker from "../assets/images/SmkTelkomTransparan.png";
import OvalAtas from "../assets/svgs/OvalAtas.svg";
import OvalBawah from "../assets/svgs/OvalBawah.svg";
import TelkomLogo from "../assets/images/LogoTSWarna.png";

function page() {
  const { login } = useAuth();
  const [form, setForm] = React.useState({
    username: "",
    password: "",
  });

  const [error, setError] = React.useState("");
  const handleChenge = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#282f37]">
      {/* Left side - Image with overlays */}
      <div className="relative w-1/2 h-full hidden md:block">
        <Image
          src={Stelker}
          alt="Stelker"
          className="object-cover h-full w-full"
          priority
        />
        <Image src={OvalAtas} alt="Oval Atas" className="absolute top-0 -right-32" />
        <Image src={OvalBawah} alt="Oval Bawah" className="absolute bottom-0 left-0" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center z-10 justify-center bg-white p-8 rounded-l-3xl">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Image src={TelkomLogo} alt="Telkom Schools" width={180} height={60} />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                name="username"
                onChange={handleChenge}
                type="text"
                placeholder="Nama Pengguna"
                className="w-full px-4 py-3 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                onChange={handleChenge}
                placeholder="Kata Sandi"
                className="w-full px-4 py-3 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <button
                className="w-full py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                LOGIN
              </button>
            </div>
            
            <div className="flex items-center justify-end">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
            </div>
            
            {error && (
              <p className="text-center text-sm text-red-600">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default page;