'use client'
import { useState, useEffect, useRef } from "react";
import Sidebar from '../assets/svgs/DashboardSideBar.svg'
import TelkomSchool from '../assets/svgs/TelkomSchool.svg'
import EfekSegitiga from '../assets/svgs/SegitigaSidebar.svg'
import Image from 'next/image'
import { IoMdInformationCircleOutline } from "react-icons/io";
import Statistik from '../assets/svgs/LogoStatistik.svg'
import Tamu from '../assets/svgs/logoDaftarTamu.svg'
import Laporan from '../assets/svgs/LogoPengguna.svg'
import Home from '../assets/svgs/HomeDashboard.svg'
import Keluar from '../assets/svgs/LogoKeluar.svg'
import Profile from '../assets/svgs/ProfileHitam.svg'
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import useAuthMiddleware from "../hooks/auth";
import { useRouter } from "next/navigation";
import axios from "axios";
import { IoMdSearch } from "react-icons/io";
import { FaTelegramPlane } from "react-icons/fa";
import Swal from "sweetalert2";

interface Tamu {
    id?: string;
    nama_tamu: string;
    instansi: string;
    tujuan: string;
    nama_yang_dikunjungi: string;
    keperluan: string;
    kartu_identitas: string;
    nomor_telepon: string;
    created_at: Date;
    status?: string; // Add status field
}

function page() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showWarningModal, setShowWarningModal] = useState(false);

    const handleConfirmLogout = () => {
        // logika untuk logout
        console.log("User telah logout!");
        setShowWarningModal(false);
    };

    const handleLogoutClick = () => {
        // Replace the custom modal with SweetAlert2
        Swal.fire({
            title: "Konfirmasi Logout",
            text: "Apakah Anda yakin ingin keluar?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Keluar!",
            cancelButtonText: "Batal"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("auth_token");
                logout();
            }
        });
    };

    // Fungsi untuk menghapus data yang lebih dari 30 hari
    const deleteOldData = async () => {
        try {
            const response = await axios.delete(
                "http://127.0.0.1:8000/api/form-submissions/delete-old-data"
            );

            if (response.data.message) {
                console.log(response.data.message);
            }
        } catch (error) {
            console.error("Error menghapus data lama:", error);
        }
    };

    // Update the handleDelete function to match the Staf_Kepala_Sekolah implementation
    const handleDelete = async (id: string, nama_tamu: string) => {
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
                    const response = await axios.delete(
                        `http://localhost:8000/api/form-submissions/${id}`
                    );

                    Swal.fire({
                        title: "Terhapus!",
                        text: `Data tamu ${nama_tamu} berhasil dihapus`,
                        icon: "success",
                        timer: 2000,
                    });

                    // Update the view by removing the data from state
                    setData((prevData) =>
                        prevData.filter((item) => item.id !== id)
                    );
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

    const handleCloseModal = () => {
        setShowWarningModal(false);
    };

    // Hapus state terpisah untuk setiap unit karena sekarang menggunakan satu tabel
    const [data, setData] = useState<Tamu[]>([]); // Data dari tabel form_submissions

    // Tambahkan state untuk status yang sudah diatur
    const [savedStatuses, setSavedStatuses] = useState<Record<string, string>>({});

    // Modifikasi handleStatusChange
    const handleStatusChange = async (id: string, newStatus: string) => {
        // Pastikan id tidak kosong
        if (!id) {
            Swal.fire({
                title: "Gagal",
                text: "ID tidak valid",
                icon: "error",
            });
            return;
        }
        
        try {
            // Simpan status di localStorage untuk persistensi
            const savedStates = JSON.parse(localStorage.getItem('savedStatuses') || '{}');
            savedStates[id] = newStatus;
            localStorage.setItem('savedStatuses', JSON.stringify(savedStates));
            
            // Update state lokal untuk tracking status
            setSavedStatuses((prev) => ({
                ...prev,
                [id]: newStatus
            }));
            
            // Update status di state data
            setData((prevData) =>
                prevData.map((item) =>
                    item.id === id
                        ? { ...item, status: newStatus }
                        : item
                )
            );
            
            // Gunakan URL yang sama dengan daftaradmin/page.tsx
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
                text: "Status berhasil diperbarui",
                icon: "success",
                timer: 2000,
            });
            
        } catch (error) {
            // Error handling tetap sama
            let errorMessage = "Terjadi kesalahan saat mengupdate status.";
    
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.message || errorMessage;
                console.error("Error response:", error.response.data);
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

    // Modifikasi useEffect untuk mempertahankan status setelah refresh
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ambil data dari API
                const response = await axios.get("http://127.0.0.1:8000/api/form-submissions");
                
                // Ambil status tersimpan dari localStorage
                const savedStates = JSON.parse(localStorage.getItem('savedStatuses') || '{}');
                setSavedStatuses(savedStates);
                
                // Terapkan status yang tersimpan ke data yang diambil
                const dataWithSavedStatus = response.data.map((item: any) => {
                    if (savedStates[item.id]) {
                        return { ...item, status: savedStates[item.id] };
                    }
                    return item;
                });
                
                // Urutkan data
                const sortedData = dataWithSavedStatus.sort((a: any, b: any) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                
                setData(sortedData);
                
                // Tampilkan pesan jika tidak ada data
                if (sortedData.length === 0) {
                    console.warn("Tidak ada data yang berhasil diambil dari API");
                }
                
                // Panggil fungsi untuk menghapus data lama secara otomatis
                deleteOldData();
            } catch (error) {
                console.error("Error fetching data:", error);
                // Tambahkan notifikasi error untuk user
                Swal.fire({
                    title: "Error",
                    text: "Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.",
                    icon: "error",
                });
            }
        };

        fetchData();
    }, []);

    const filteredData = data.filter(tamu =>
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
            : false)
    );

    const today = new Date();
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const dayName = days[today.getDay()];
    const date = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();

    return (
        <>
            <div className='bg-[#f0f0f4] w-full h-screen overflow-hidden relative'>
                {/* SIDEBAR - POSISI FIXED */}z
                <div className='fixed top-0 left-0 h-full w-60 bg-[#BA272D] px-8 pt-24 rounded-r-3xl z-50'>
                    <Image src={TelkomSchool} alt="TelkomSchool" className="absolute top-[70px] left-1" />
                    {/* MENU */}
                    <div className='mt-20 space-y-6 -z-20'>
                        <div className='flex items-center bg-[#9C0006] p-3 rounded-lg'>
                            <Image src={Home} alt='' width={25} />
                            <p className='text-white ml-4 text-sm'>Beranda</p>
                        </div>
                        <Link href='/daftaradmin'>
                            <div className='flex items-center p-3 mt-2 hover:bg-[#9C0006] rounded-lg cursor-pointer'>
                                <Image src={Tamu} alt='' width={30} />
                                <p className='text-[#e09ea0] ml-4 text-sm'>Daftar Tamu</p>
                            </div>
                        </Link>
                        <Link href='/statistik'>
                            <div className='flex items-center p-3 mt-2 hover:bg-[#9C0006] rounded-lg cursor-pointer'>
                                <Image src={Statistik} alt='' width={30} />
                                <p className='text-[#e09ea0] ml-4 text-sm'>Laporan Statistik</p>
                            </div>
                        </Link>
                        <Link href='/aksespengguna'>
                            <div className='flex items-center p-3 mt-2 hover:bg-[#9C0006] rounded-lg cursor-pointer'>
                                <Image src={Laporan} alt='' width={30} />
                                <p className='text-[#e09ea0] ml-4 text-sm'>Akses Pengguna</p>
                            </div>
                        </Link>
                        <Link href='/akuntelegram'>
                            <div className='flex items-center p-3 mt-2 hover:bg-[#9C0006] rounded-lg cursor-pointer'>
                                <span className="text-[#d28c8f] text-xl"><FaTelegramPlane /></span>
                                <p className='text-[#e09ea0] ml-4 text-sm'>Akun Telegram Guru</p>
                            </div>
                        </Link>
                        <div
                            className='flex items-center p-3 mt-2 hover:bg-[#9C0006] rounded-lg cursor-pointer'
                            onClick={handleLogoutClick}
                        >
                            <Image src={Keluar} alt='' width={30} />
                            <p className='text-[#e09ea0] ml-4 text-sm'>Keluar</p>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className='ml-60 px-8'>
                    <div className='flex justify-between items-center'>
                        <p className='text-xl font-semibold'>Beranda</p>
                        <div className="flex items-center">
                            <div className="relative flex items-center">
                                <IoMdSearch className="absolute left-3 text-gray-400" />
                                <input
                                    type='text'
                                    placeholder='Cari'
                                    className="pl-10 pr-5 py-1 rounded-full border border-gray-300 text-sm transition-all duration-300 focus:w-[250px] w-[200px] focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Link href="/profile3">
                                <div className="flex items-center ml-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
                                    <Image
                                        src={Profile}
                                        alt="Profile"
                                        height={27}
                                        className="cursor-pointer transition-transform duration-200 hover:scale-110 "
                                    />
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className='bg-[#ba272d] mt-6 p-6 rounded-lg'>
                        <p className='text-2xl text-white font-semibold'>Selamat datang di sistem manajemen buku tamu</p>
                        <p className='mt-2 text-[#f7bbbd] font-semibold tracking-wide'>Kelola dan Monitor tamu dengan mudah dan efisien</p>
                    </div>

                    <p className='mt-6 text-[#9c9c9e] text-sm'>Terbaru</p>

                    <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
    <table className='w-full bg-white text-sm'>
        <thead className='bg-[#E3E2EC] sticky top-0 z-10'>
                                <tr>
                                    <th className='p-3'></th>
                                    {/* REMOVE THIS LINE: <th></th> */}
                                    <th className='p-3 text-left'>Nama</th>
                                    <th className='p-3 text-left'>Hari Tanggal</th>
                                    <th className='p-3 text-left'>Tujuan</th>
                                    <th className='p-3 text-left'>Nama Yang Dikunjungi</th>
                                    <th className='p-3 text-center'>Keperluan</th>
                                    <th className='p-3 text-left'>Status</th>
                                    <th className='p-3 text-left'>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(filteredData) && filteredData.length > 0 ? (
                                    filteredData.map((item, index) =>
                                        item ? (
                                            <tr key={index} className="border-b">
                                                <td></td>
                                                <td className="font-medium" style={{ padding: "8px", textAlign: "left" }}>
                                                    {item.nama_tamu}<br />
                                                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{item.instansi}</span>
                                                </td>
                                                <td style={{ padding: "8px", textAlign: "left" }}>
                                                    {item.created_at
                                                        ? new Date(item.created_at).toLocaleDateString("id-ID", {
                                                            weekday: "long",
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })
                                                        : "Tanggal tidak tersedia"}
                                                </td>
                                                <td style={{ padding: "8px", textAlign: "left" }}>
                                                    {item.tujuan}
                                                </td>
                                                <td style={{ padding: "8px", textAlign: "left" }}>
                                                    {item.nama_yang_dikunjungi}
                                                </td>
                                                <td style={{ padding: "8px", textAlign: "left" }}>
                                                    {item.keperluan}
                                                </td>
                                                <td style={{ padding: "8px", textAlign: "left" }}>
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
                                                            handleStatusChange(item.id || "", e.target.value);
                                                        }}
                                                        className="w-28 text-sm border rounded px-3 py-1.5 bg-white text-center font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                                <td style={{ padding: "8px", textAlign: "left" }}>
                                                    <button
                                                        onClick={() => handleDelete(item.created_at.toString(), item.nama_tamu)}
                                                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition duration-200"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : null
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-4">Tidak ada data</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Modal Konfirmasi Logout */}
            {showWarningModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-12 rounded-lg">
                        <p className="mb-4">Apakah Anda yakin ingin keluar?</p>
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
