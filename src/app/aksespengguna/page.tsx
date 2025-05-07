'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import segitiga from '../assets/svgs/SegitigaSidebarKecil.svg'
import Icon from '../assets/svgs/IconTelkomSchool.svg'
import Daftar from '../assets/svgs/logoDaftarTamu.svg'
import Orang from '../assets/svgs/LogoPenggunaAktif.svg'
import statistik from '../assets/svgs/LogoStatistik.svg'
import keluar from '../assets/svgs/LogoKeluar.svg'
import Home from '../assets/svgs/LogoHomeAbu.svg'
import { FaTelegramPlane } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaSync } from "react-icons/fa";
import Image from 'next/image'
import Link from 'next/link';
import Swal from "sweetalert2";

interface Pengguna {
  id: number;
  user_id: number;
  nama_lengkap: string;
  nip: string;
  unit_kerja: string;
  created_at: string;
  updated_at: string;
  username: string;
  password: string;
}

function Page() {
  const [pengguna, setPengguna] = useState<Pengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Pengguna | null>(null);
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nip: "",
    unit_kerja: "",
    username: "",
    password: "",
  });

  // Fungsi untuk memuat data pengguna
  const fetchPengguna = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("http://localhost:8000/api/pengguna");
      setPengguna(response.data);
    } catch (error) {
      console.error("Ada kesalahan saat mengambil data: ", error);
      setError("Gagal memuat data pengguna. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengguna();
  }, []);

  // Filter pengguna berdasarkan pencarian
  const filteredPengguna = pengguna.filter(user => 
    user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk memuat ulang data
  const refreshData = async () => {
    try {
      await fetchPengguna();
      Swal.fire({
        title: "Berhasil!",
        text: "Data pengguna berhasil dimuat ulang.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: "Terjadi kesalahan saat memuat data.",
        icon: "error",
      });
    }
  };

  // Fungsi untuk menangani edit pengguna
  const handleEdit = (user: Pengguna) => {
    setEditingUser(user);
    setFormData({
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      unit_kerja: user.unit_kerja,
      username: user.username,
      password: user.password,
    });
    setShowEditModal(true);
  };

  // Fungsi untuk menangani perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Perbaikan fungsi handleSaveEdit untuk menggunakan endpoint alternatif
const handleSaveEdit = async () => {
  if (!editingUser) return;
  
  // Validasi input
  if (!formData.nama_lengkap) {
    Swal.fire({
      title: "Error",
      text: "Nama tidak boleh kosong",
      icon: "error",
    });
    return;
  }

  try {
    Swal.fire({
      title: "Memproses...",
      text: "Sedang menyimpan perubahan",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Hanya kirim kolom yang ada di database
    const dataToSend = {
      nama_lengkap: formData.nama_lengkap,
      nip: formData.nip,
      unit_kerja: formData.unit_kerja,
      // Data tambahan untuk update tabel users melalui relasi
      user_data: {
        username: formData.username,
        password: formData.password
      }
    };

    // Gunakan endpoint alternatif
    const response = await axios.post(
      `http://localhost:8000/api/pengguna/update/${editingUser.id}`,
      dataToSend
    );

    // Update state dengan data yang telah diperbarui
    setPengguna((prevData) =>
      prevData.map((item) =>
        item.id === editingUser.id ? { ...item, ...formData } : item
      )
    );

    setShowEditModal(false);
    setEditingUser(null);
    
    Swal.fire({
      title: "Berhasil!",
      text: "Data pengguna berhasil diperbarui.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error("Error during edit:", error);
    
    let errorMessage = "Terjadi kesalahan saat memperbarui data.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    Swal.fire({
      title: "Gagal",
      text: errorMessage,
      icon: "error",
    });
  }
};

  // Perbaiki fungsi handleDelete untuk menambahkan informasi debug
const handleDelete = async (id: number) => {
  Swal.fire({
    title: "Konfirmasi Hapus",
    text: `Apakah Anda yakin ingin menghapus pengguna ini?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Memproses...",
          text: "Sedang menghapus pengguna",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        console.log(`Trying to delete user with ID: ${id}`);
        
        // Gunakan axios.delete untuk RESTful endpoint
        const response = await axios.delete(`http://localhost:8000/api/pengguna/${id}`);
        
        if (response.status !== 200) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        setPengguna((prevData) =>
          prevData.filter((item) => item.id !== id)
        );
        
        Swal.fire({
          title: "Terhapus!",
          text: "Pengguna berhasil dihapus.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Delete error details:", error);
        
        let errorMessage = "Terjadi kesalahan saat menghapus pengguna.";
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = `${errorMessage} (${error.response.status}: ${error.response.data?.message || 'Unknown error'})`;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        Swal.fire({
          title: "Gagal",
          text: errorMessage,
          icon: "error",
        });
      }
    }
  });
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // Tambahkan default values untuk kehadiran dan alasan_ketidakhadiran
    const dataToSubmit = {
      ...formData,
      kehadiran: 'hadir',  // Default value: hadir
      alasan_ketidakhadiran: ''  // Default value: string kosong
    };

    console.log("Data yang dikirim:", dataToSubmit);
    
    if (isEditing) {
      // Update existing guru
      await axios.put(`http://127.0.0.1:8000/api/guru-telegram-ids/${currentId}`, dataToSubmit);
      Swal.fire({
        title: "Berhasil!",
        text: "Data guru telegram berhasil diperbarui",
        icon: "success",
        timer: 2000
      });
    } else {
      // Create new guru
      await axios.post("http://127.0.0.1:8000/api/guru-telegram-ids", dataToSubmit);
      Swal.fire({
        title: "Berhasil!",
        text: "Data guru telegram berhasil dibuat",
        icon: "success",
        timer: 2000
      });
    }

    // Reset form
    setFormData({ nama: '', telegram_id: '', unit: '' });
    setShowModal(false);
    setIsEditing(false);
    fetchGuruData();
  } catch (error: any) {
    console.error("Error saving data:", error);
    console.error("Error response:", error.response?.data);
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Gagal menyimpan data guru telegram",
      icon: "error"
    });
  }
};

  return (
    <>
      <div className='bg-[#EBEAF2] min-h-screen overflow-hidden'>
      <div className='flex flex-row'>
        <nav className='bg-[#BA272D] px-7 py-[359.9px]' style={{ borderRadius: "0px 20px 20px 0px" }}>
          <Image src={Icon} alt='' width={50} className='absolute mt-[-300px] ml-[-27px]' />
          <Image src={segitiga} alt='' className='absolute mt-[-300px] ml-[-27px]' />
          <div className='absolute'>
            <Link href='/dashboard'>
              <div className='ml-[-22px] rounded-lg mt-[-160px] hover:bg-[#9C0006] p-[7px]'>
                <Image src={Home} alt='Home' width={30} />
              </div>
            </Link>
            <Link href='daftaradmin'>
              <div className='ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]'>
                <Image src={Daftar} alt='Daftar' width={30} />
              </div>
            </Link>
            <Link href='/statistik'>
              <div className='ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]'>
                <Image src={statistik} alt='Statistik' width={30} />
              </div>
            </Link>
            <Link href='/aksespengguna'>
              <div className='ml-[-22px] rounded-lg mt-3 bg-[#9C0006] p-[7px]'>
                <Image src={Orang} alt='Akses Pengguna' width={30} />
              </div>
            </Link>
            <Link href="/akuntelegram">
              <div className='ml-[-20px]  text-[#d28c8f] text-2xl rounded-lg mt-3 hover:bg-[#9C0006] p-[8px]'>
              <FaTelegramPlane/>
              </div>
            </Link>
            <Link href='/staf'>
              <div className='ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]'>
                <Image src={keluar} alt='Keluar' width={30} />
              </div>
            </Link>
          </div>
        </nav>
        
        {/* Konten Utama */}
        <div className='flex-1'>
          <div className='flex justify-between items-center'>
            <Link href='/dashboard'>
              <p className='flex text-[20px] mt-6 ml-10'><MdOutlineKeyboardArrowLeft/><span className='text-base mt-[-2px] font-semibold'>Akses Pengguna</span></p>
            </Link>
            <div className='flex items-center mr-6 mt-6'>
              <div className="relative">
                <input
                  type='text'
                  placeholder=' Cari'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '4px 32px 4px 12px',
                    borderRadius: '100px',
                    border: '1px solid #ccc',
                    outline: 'none',
                    fontSize: '12px',
                  }}
                  className="h-8"
                />
                <FaSearch className="absolute right-3 top-2.5 text-gray-400" size={12} />
              </div>
            </div>
          </div>
          
          <div className='flex justify-end mt-4 mr-6 space-x-3'>
            <button 
              onClick={refreshData}
              className="text-white border-[2px] rounded-lg py-1.5 px-3 border-[#2563eb] bg-[#3b82f6] flex items-center text-sm"
            >
              <FaSync className="mr-2 text-xs" /> Muat Ulang
            </button>
            <Link href="/tambahpengguna">
              <button className="text-white border-[2px] rounded-lg py-1.5 px-3 border-[#ab1c21] bg-[#e4262c] flex items-center text-sm">
                <FaPlus className="mr-2 text-xs" /> Tambah Pengguna
              </button>
            </Link>
          </div>
          
          <div className='mt-10 mx-6'>
            {loading ? (
              <div className="w-full flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : error ? (
              <div className="w-full text-center py-10 text-red-500">
                {error}
                <button 
                  onClick={refreshData}
                  className="ml-4 text-blue-500 underline"
                >
                  Coba lagi
                </button>
              </div>
            ) : filteredPengguna.length === 0 ? (
              <div className="w-full text-center py-10 text-gray-500">
                {searchTerm ? "Tidak ada hasil yang cocok dengan pencarian Anda." : "Belum ada data pengguna."}
              </div>
            ) : (
              <table className='w-full' style={{ borderCollapse: "collapse", backgroundColor: "#fff" }}>
                <thead>
                  <tr style={{ backgroundColor: "#E3E2EC", borderBottom: "1px solid #ddd" }}>
                    <th style={{ padding: "15px", textAlign: "left" }}>Nama</th>
                    <th style={{ padding: "15px", textAlign: "center" }}>NIP</th>
                    <th style={{ padding: "15px", textAlign: "center" }}>Unit Kerja</th>
                    <th style={{ padding: "15px", textAlign: "center" }}>Nama Pengguna</th>
                    <th style={{ padding: "15px", textAlign: "center" }}>Kata Sandi</th>
                    <th style={{ padding: "15px", textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPengguna.map((user, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        transition: "0.3s ease",
                      }}
                      className="hover:bg-[#f9f9f9]"
                    >
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "left",
                        }}
                      >
                        {user.nama_lengkap}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {user.nip}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {user.unit_kerja}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {user.username}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {user.password}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="Edit"
                          >
                            <FaPen size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            title="Hapus"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Modal Edit */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Pengguna</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Kerja
              </label>
              <input
                type="text"
                name="unit_kerja"
                value={formData.unit_kerja}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pengguna
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kata Sandi
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Page;