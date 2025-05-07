'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios'; // Import axios
import Swal from "sweetalert2";

const TambahPengguna = () => {
  const [namaLengkap, setNamaLengkap] = useState<string>('');
  const [nip, setNip] = useState<string>('');
  const [unitKerja, setUnitKerja] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setState(e.target.value);
    console.log(`Field updated: ${e.target.name}, New Value: ${e.target.value}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!namaLengkap || !nip || !unitKerja || !username || !password) {
      setError('Semua field harus diisi!');
      console.error('Error: Semua field harus diisi!');
      return;
    }

    const newUser = {
      nama_lengkap: namaLengkap,
      nip: nip,
      unit_kerja: unitKerja,
      username: username,
      password: password,
    };

    console.log('Submitting user data:', newUser);

    try {
      const response = await axios.post('http://localhost:8000/api/users', newUser, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response from server:', response.data);

      setSuccess('Pengguna berhasil ditambahkan!');
      console.log('Success: Pengguna berhasil ditambahkan!');

      // Reset form
      setNamaLengkap('');
      setNip('');
      setUnitKerja('');
      setUsername('');
      setPassword('');
      setError('');

      // Tambahkan alert dan redirect
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil ditambahkan!',
        confirmButtonColor: '#BA272D',
      }).then(() => {
        window.location.href = '/aksespengguna';
      });

    } catch (error: any) {
      if (error.response) {
        console.error('Server responded with an error:', error.response.data);
        setError(`Gagal menambahkan pengguna: ${error.response.data.message || 'Terjadi kesalahan'}`);
      } else {
        console.error('Error:', error.message);
        setError('Terjadi kesalahan, coba lagi nanti.');
      }
    }
  };

  return (
    <div className="bg-[#FDEBEB] min-h-screen px-10 py-8">
      <div className="flex items-center">
        <Link href="/aksespengguna">
          <button className="text-red-700 text-lg font-medium flex items-center">
            <FaArrowLeft className="mr-2" /> Kembali
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-md mt-8 p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-red-700 mb-6">Tambah Pengguna Baru</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="namaLengkap"
              value={namaLengkap}
              onChange={(e) => handleInputChange(e, setNamaLengkap)}
              placeholder="Masukkan nama lengkap"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-red-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">NIP</label>
            <input
              type="text"
              name="nip"
              value={nip}
              onChange={(e) => handleInputChange(e, setNip)}
              placeholder="Masukkan NIP"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-red-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Unit Kerja</label>
            <input
              type="text"
              name="unitKerja"
              value={unitKerja}
              onChange={(e) => handleInputChange(e, setUnitKerja)}
              placeholder="Masukkan unit kerja"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-red-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Nama Pengguna</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => handleInputChange(e, setUsername)}
              placeholder="Masukkan username"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-red-700"
            />
          </div>

          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => handleInputChange(e, setPassword)}
              placeholder="Masukkan kata sandi"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-red-700"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg font-semibold shadow"
            >
              Simpan Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahPengguna;