'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import Link from 'next/link';
import segitiga from '../assets/svgs/SegitigaSidebarKecil.svg';
import Icon from '../assets/svgs/IconTelkomSchool.svg';
import Daftar from '../assets/svgs/IconDaftarAktif.svg';
import Orang from '../assets/svgs/LogoPengguna.svg';
import statistik from '../assets/svgs/LogoStatistik.svg';
import { FaTelegramPlane } from "react-icons/fa";
import keluar from '../assets/svgs/LogoKeluar.svg';
import Home from '../assets/svgs/LogoHomeAbu.svg';
import { FaEdit } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import Swal from "sweetalert2";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

interface Tamu {
  id: number;
  nama_tamu: string;
  instansi: string;
  tujuan: string;
  nama_yang_dikunjungi: string;
  keperluan: string;
  kartu_identitas: string;
  nomor_identitas: string;
  nomor_telepon: string;
  status: string;
  created_at: Date;
  unit?: string; // Akan digunakan sebagai tujuan
}

interface TujuanData {
  tujuan: string;
  count: number;
}

function Page() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [data, setData] = useState<Tamu[]>([]);
  const [tujuanList, setTujuanList] = useState<TujuanData[]>([]);
  const [activeTujuan, setActiveTujuan] = useState<string>('semua');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableTujuan, setAvailableTujuan] = useState<string[]>([]);
  // Tambahkan state untuk status yang sudah diatur
  const [savedStatuses, setSavedStatuses] = useState<Record<string, string>>({});

  // Fungsi untuk mengambil data tujuan dari API guru-telegram-ids
  useEffect(() => {
    const fetchTujuan = async () => {
      try {
        // Coba ambil dari localStorage terlebih dahulu
        const savedTujuan = localStorage.getItem('unitOptions');
        if (savedTujuan) {
          setAvailableTujuan(JSON.parse(savedTujuan));
        } else {
          // Jika tidak ada di localStorage, ambil dari API
          const response = await axios.get("http://127.0.0.1:8000/api/guru-telegram-ids");
          if (response.data && Array.isArray(response.data)) {
            // Ekstrak tujuan yang unik dari data guru
            const uniqueTujuan = [...new Set(response.data.map((item: any) => item.unit || ''))];
            // Filter out empty strings
            const filteredTujuan = uniqueTujuan.filter(tujuan => tujuan !== '');
            setAvailableTujuan(filteredTujuan);
            // Simpan ke localStorage untuk penggunaan berikutnya
            localStorage.setItem('unitOptions', JSON.stringify(filteredTujuan));
          }
        }
      } catch (error) {
        console.error("Error fetching tujuan:", error);
        // Gunakan tujuan default jika gagal
        const defaultTujuan = [
          "Kepala Sekolah",
          "Perf. QMR",
          "Keuangan / Administrasi",
          "Kurikulum",
          "Kesiswaan",
          "Sarpra (Sarana dan Prasarana)",
          "Hubin (Hubungan Industri)",
          "PPDB (Penerimaan Peserta Didik Baru)",
          "Guru"
        ];
        setAvailableTujuan(defaultTujuan);
      }
    };

    fetchTujuan();
  }, []);

  // Fungsi untuk mengambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Mengambil semua data dari API form-submissions
        const response = await axios.get("http://127.0.0.1:8000/api/form-submissions");
        
        // Ambil status tersimpan dari localStorage
        const savedStates = JSON.parse(localStorage.getItem('savedStatuses') || '{}');
        setSavedStatuses(savedStates);
        
        if (response.data && Array.isArray(response.data)) {
          // Urutkan data berdasarkan tanggal terbaru
          const sortedData = response.data.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          // Proses data untuk memastikan tujuan konsisten dan menerapkan status tersimpan
          const processedData = sortedData.map((item: Tamu) => {
            // Terapkan status tersimpan jika ada
            if (savedStates[item.id.toString()]) {
              item.status = savedStates[item.id.toString()];
            }

            // Jika unit ada dan bukan 'Lainnya', gunakan unit sebagai tujuan
            if (item.unit && item.unit !== 'Lainnya') {
              item.tujuan = item.unit;
            } 
            // Jika tidak, coba cocokkan tujuan dengan unit yang tersedia
            else {
              const matchedUnit = availableTujuan.find(unit => 
                item.tujuan.toLowerCase().includes(unit.toLowerCase())
              );
              
              if (matchedUnit) {
                item.tujuan = matchedUnit;
              }
            }
            return item;
          });
          
          setData(processedData);
          
          // Ekstrak tujuan-tujuan yang unik dan hitung jumlah data per tujuan
          const tujuanCounts: Record<string, number> = {};
          let totalCount = 0;
          
          // Inisialisasi semua tujuan yang tersedia dengan jumlah 0
          availableTujuan.forEach(tujuan => {
            tujuanCounts[tujuan] = 0;
          });
          
          processedData.forEach((item: Tamu) => {
            const tujuan = item.tujuan || '';
            if (tujuan && tujuanCounts.hasOwnProperty(tujuan)) {
              tujuanCounts[tujuan] += 1;
              totalCount++;
            }
          });
          
          // Konversi ke array untuk ditampilkan
          const tujuanArray: TujuanData[] = Object.keys(tujuanCounts).map(tujuan => ({
            tujuan,
            count: tujuanCounts[tujuan]
          }));
          
          // Tambahkan opsi "Semua" di awal
          tujuanArray.unshift({
            tujuan: 'semua',
            count: totalCount
          });
          
          setTujuanList(tujuanArray);
        } else {
          console.error("Format data tidak valid:", response.data);
          Swal.fire({
            title: "Error",
            text: "Format data tidak valid dari API",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          title: "Error",
          text: "Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.",
          icon: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [availableTujuan]); // Tambahkan availableTujuan sebagai dependency

  // Filter data berdasarkan tujuan yang aktif dan kata kunci pencarian
  const filteredData = data.filter(tamu => {
    // Filter berdasarkan tujuan
    const tujuanMatch = activeTujuan === 'semua' || tamu.tujuan === activeTujuan;
    
    // Filter berdasarkan kata kunci pencarian
    const searchMatch = 
      tamu.nama_tamu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tamu.nama_yang_dikunjungi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tamu.tujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tamu.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tamu.created_at
        ? new Date(tamu.created_at).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).toLowerCase().includes(searchTerm.toLowerCase())
        : false);
    
    return tujuanMatch && searchMatch;
  });

  // Fungsi untuk mengupdate status
  const handleStatusChange = async (id: number, newStatus: string, nama_tamu: string) => {
    // Pastikan id tidak kosong
    if (!id) {
      Swal.fire({
        title: "Gagal",
        text: "ID tidak valid",
        icon: "error",
      });
      return;
    }
    
    // Validasi perubahan dari status Selesai ke Pending
    if (data.find(item => item.id === id)?.status === "Selesai" && newStatus === "Pending") {
      Swal.fire({
        title: "Tidak Diizinkan",
        text: "Status 'Selesai' tidak dapat diubah kembali ke 'Pending'",
        icon: "warning",
      });
      return;
    }
    
    // Validasi perubahan dari status Batal ke Pending
    if (data.find(item => item.id === id)?.status === "Batal" && newStatus === "Pending") {
      Swal.fire({
        title: "Tidak Diizinkan",
        text: "Status 'Batal' tidak dapat diubah kembali ke 'Pending'",
        icon: "warning",
      });
      return;
    }
  
    try {
      // Simpan status di localStorage untuk persistensi
      const savedStates = JSON.parse(localStorage.getItem('savedStatuses') || '{}');
      savedStates[id.toString()] = newStatus;
      localStorage.setItem('savedStatuses', JSON.stringify(savedStates));
      
      // Update state lokal untuk tracking status
      setSavedStatuses(prev => ({
        ...prev,
        [id.toString()]: newStatus
      }));
      
      // Update status di state data (untuk UI yang responsif)
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id
            ? { ...item, status: newStatus }
            : item
        )
      );
      
      // Perbaikan URL endpoint - gunakan endpoint yang benar
      const response = await fetch("http://127.0.0.1:8000/api/form-submissions/update-status", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      Swal.fire({
        title: "Berhasil!",
        text: `Status untuk ${nama_tamu} berhasil diubah menjadi ${newStatus}`,
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      
      let errorMessage = "Terjadi kesalahan saat mengupdate status.";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 
                      `Error ${error.response?.status}: ${error.response?.statusText}` || 
                      errorMessage;
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

  // Fungsi untuk menghapus data
  const handleDelete = async (id: number, nama_tamu: string) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus data tamu ${nama_tamu}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://127.0.0.1:8000/api/form-submissions/${id}`);

          Swal.fire({
            title: "Terhapus!",
            text: `Data tamu ${nama_tamu} berhasil dihapus`,
            icon: "success",
            timer: 2000,
          });

          setData((prevData) => prevData.filter((item) => item.id !== id));
        } catch (error) {
          let errorMessage = "Terjadi kesalahan saat menghapus data.";

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
      }
    });
  };

  // Fungsi untuk mengunduh data dalam format Excel
  const downloadExcel = () => { 
    const ws = XLSX.utils.json_to_sheet( 
      filteredData.map((item) => {
        // Format tanggal untuk Excel
        const formattedDate = item.created_at
          ? new Date(item.created_at).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Tanggal tidak tersedia";
        
        // Buat objek baru dengan properti yang diinginkan saja
        return {
          nama_tamu: item.nama_tamu,
          instansi: item.instansi,
          tujuan: item.tujuan,
          nama_yang_dikunjungi: item.nama_yang_dikunjungi,
          keperluan: item.keperluan,
          kartu_identitas: item.kartu_identitas,
          nomor_identitas: item.nomor_identitas,
          nomor_telepon: item.nomor_telepon,
          status: item.status || "Pending",
          unit: item.unit || "", // Ubah dari "Lainnya" menjadi string kosong
          tanggal: formattedDate
        };
      })
    );
    
    const wb = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu"); 
    XLSX.writeFile(wb, "data_tamu.xlsx"); 
  };

  return (
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
              <div className='ml-[-22px] rounded-lg mt-3 bg-[#9C0006] p-[7px]'>
                <Image src={Daftar} alt='Daftar' width={30} />
              </div>
            </Link>
            <Link href='/statistik'>
              <div className='ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]'>
                <Image src={statistik} alt='Statistik' width={30} />
              </div>
            </Link>
            <Link href='/aksespengguna'>
              <div className='ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]'>
                <Image src={Orang} alt='Akses Pengguna' width={30} />
              </div>
            </Link>

            <Link href="/akuntelegram">
              <div className='ml-[-20px] text-[#d28c8f] text-2xl rounded-lg mt-3 hover:bg-[#9C0006] p-[8px]'>
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

        <div className="flex-1 px-4">
          <div className='flex items-center justify-between mt-8'>
            <Link href='/dashboard'>
              <p className='flex text-[20px] items-center'>
                <MdOutlineKeyboardArrowLeft />
                <span className='text-lg font-semibold'>Daftar Tamu</span>
              </p>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={downloadExcel}
                className="bg-[#1E7E34] text-white py-2 px-4 rounded-md flex items-center text-sm hover:bg-[#166329] transition-colors"
              >
                <FaFileExcel className="mr-2" /> Unduh Data Excel
              </button>
              <div className="relative flex items-center">
                <IoMdSearch className="absolute left-3 text-gray-400" />
                <input
                  type='text'
                  placeholder='Cari'
                  className="pl-10 pr-5 py-1 rounded-full border border-gray-300 text-sm transition-all duration-300 focus:w-[250px] w-[200px] focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tampilkan tujuan-tujuan yang tersedia */}
          <div className='mt-6 flex flex-wrap justify-start gap-3 mb-4'>
            {isLoading ? (
              <div className="w-full text-center py-4">Memuat data tujuan...</div>
            ) : (
              tujuanList.map((tujuanItem, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTujuan(tujuanItem.tujuan)}
                  className={`px-4 py-2 font-medium rounded-full text-sm transition-colors ${
                    activeTujuan === tujuanItem.tujuan
                      ? "bg-red-600 text-white"
                      : "hover:text-red-600"
                  }`}
                >
                  {tujuanItem.tujuan === 'semua' ? 'Semua' : tujuanItem.tujuan} ({tujuanItem.count})
                </button>
              ))
            )}
          </div>

          {isLoading ? (
            <div className="w-full text-center py-8">
              <p className="text-lg">Memuat data...</p>
            </div>
          ) : (
            <div className='mt-4 overflow-x-auto'>
              <table className='w-full' style={{ borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#E3E2EC" }}>
                  <tr className="border-[#EBEAF2] border-2 rounded-3xl">
                    <th style={{ borderRadius: "20px 0px 0px 0px", padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Nama</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Hari / Tanggal</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Tujuan</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Nama Yang Dikunjungi</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Keperluan</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Kartu Identitas</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Nomor Identitas</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Nomor Telepon</th>
                    <th style={{ padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Status</th>
                    <th style={{ borderRadius: "0px 20px 0px 0px", padding: "12px 10px", textAlign: "left", fontSize: "0.75rem" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={index} className="bg-white border-2">
                        <td className='font-medium' style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem" }}>
                          {item.nama_tamu}<br />
                          <span className='text-gray-400' style={{ fontSize: "0.65rem" }}>{item.instansi}</span>
                        </td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem" }}>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                            : "Tanggal tidak tersedia"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem", maxWidth: "100px", wordBreak: "break-word" }}>{item.tujuan}</td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem", maxWidth: "100px", wordBreak: "break-word" }}>{item.nama_yang_dikunjungi}</td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem", maxWidth: "100px", wordBreak: "break-word" }}>{item.keperluan}</td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem" }}>{item.kartu_identitas}</td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem" }}>{item.nomor_identitas}</td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem" }}>{item.nomor_telepon}</td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem" }}>
                          <select
                            value={item.status || "Pending"}
                            onChange={(e) => {
                              // Tidak izinkan perubahan dari Selesai ke Pending
                              if (item.status === "Selesai" && e.target.value === "Pending") {
                                Swal.fire({
                                  title: "Tidak Diizinkan",
                                  text: "Status 'Selesai' tidak dapat diubah kembali ke 'Pending'",
                                  icon: "warning",
                                });
                                return;
                              }
                              // Tidak izinkan perubahan dari Batal ke Pending
                              if (item.status === "Batal" && e.target.value === "Pending") {
                                Swal.fire({
                                  title: "Tidak Diizinkan", 
                                  text: "Status 'Batal' tidak dapat diubah kembali ke 'Pending'",
                                  icon: "warning",
                                });
                                return;
                              }
                              handleStatusChange(item.id, e.target.value, item.nama_tamu);
                            }}
                            className="border px-2 py-1 rounded text-xs w-full max-w-[90px]"
                            style={{
                              backgroundColor:
                                item.status === "Pending" || !item.status ? "#FFF7E6" :
                                  item.status === "Selesai" ? "#E6FFE6" :
                                    item.status === "Batal" ? "#FFE6E6" :
                                      "#FFFFFF",
                              color:
                                item.status === "Pending" || !item.status ? "#FF9900" :
                                  item.status === "Selesai" ? "#00CC00" :
                                    item.status === "Batal" ? "#FF0000" :
                                      "#666666"
                            }}
                          >
                            <option value="Pending" className="text-[#FF9900] bg-white font-medium">Pending</option>
                            <option value="Selesai" className="text-[#00CC00] bg-white font-medium">Selesai</option>
                            <option value="Batal" className="text-[#FF0000] bg-white font-medium">Batal</option>
                          </select>
                        </td>
                        <td style={{ padding: "10px", textAlign: "left", fontSize: "0.7rem" }}>
                          <div className="flex space-x-1">
                            <Link href={`/editData/${item.id}`}>
                              <button
                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 transition duration-200 flex items-center text-xs"
                              >
                                <FaEdit className="mr-1" size={10} /> Edit
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id, item.nama_tamu)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition duration-200 text-xs"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="text-center py-4 text-sm">
                        {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data yang tersedia"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;