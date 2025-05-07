"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { FaPlus, FaPen, FaTrash, FaEdit } from "react-icons/fa";
import Link from "next/link";
import { FaTelegramPlane } from "react-icons/fa";
import segitiga from "../assets/svgs/SegitigaSidebarKecil.svg";
import Icon from "../assets/svgs/IconTelkomSchool.svg";
import Daftar from "../assets/svgs/logoDaftarTamu.svg";
import Orang from "../assets/svgs/LogoPengguna.svg";
import statistik from "../assets/svgs/LogoStatistik.svg";
import keluar from "../assets/svgs/LogoKeluar.svg";
import Home from "../assets/svgs/LogoHomeAbu.svg";
import Swal from "sweetalert2";

interface GuruTelegram {
  id?: string;
  nama: string;
  telegram_id: string;
  unit: string;
  created_at?: Date;
}

// Change the function name to start with uppercase (React component convention)
function Page() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [guruData, setGuruData] = useState<GuruTelegram[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<GuruTelegram>({
    nama: '',
    telegram_id: '',
    unit: ''
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('');
  const [unitOptions, setUnitOptions] = useState<string[]>(() => {
    // Default units
    const defaultUnits = [
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
    
    // Try to get saved units from localStorage
    const savedUnits = localStorage.getItem('unitOptions');
    
    // If there are saved units, use those; otherwise use the default units
    return savedUnits ? JSON.parse(savedUnits) : defaultUnits;
  });
  const [showUnitModal, setShowUnitModal] = useState<boolean>(false);

  useEffect(() => {
    fetchGuruData();
  }, []);

  const fetchGuruData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/guru-telegram-ids");
      // Validate and clean data before setting state
      const validData = response.data.map((item: any) => ({
        id: item.id || '',
        nama: item.nama || '',
        telegram_id: item.telegram_id || '',
        unit: item.unit || '',
      }));
      setGuruData(validData);
    } catch (error) {
      console.error("Error fetching data guru telegram:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal mengambil data guru telegram",
        icon: "error"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Data yang dikirim:", formData);
      if (isEditing) {
        // Update existing guru
        await axios.put(`http://127.0.0.1:8000/api/guru-telegram-ids/${currentId}`, formData);
        Swal.fire({
          title: "Berhasil!",
          text: "Data guru telegram berhasil diperbarui",
          icon: "success",
          timer: 2000
        });
      } else {
        // Create new guru
        await axios.post("http://127.0.0.1:8000/api/guru-telegram-ids", formData);
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

  const handleEdit = (guru: GuruTelegram) => {
    setFormData({
      nama: guru.nama,
      telegram_id: guru.telegram_id,
      unit: guru.unit
    });
    setCurrentId(guru.id || '');
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus data guru telegram ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/guru-telegram-ids/${id}`);
          Swal.fire({
            title: "Terhapus!",
            text: "Data guru telegram berhasil dihapus",
            icon: "success",
            timer: 2000
          });
          fetchGuruData();
        } catch (error) {
          console.error("Error deleting data:", error);
          Swal.fire({
            title: "Error",
            text: "Gagal menghapus data guru telegram",
            icon: "error"
          });
        }
      }
    });
  };

  const handleDeleteUnit = (unit: string) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus unit "${unit}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedUnits = unitOptions.filter((u) => u !== unit);
        setUnitOptions(updatedUnits);

        // Simpan perubahan ke localStorage
        localStorage.setItem("unitOptions", JSON.stringify(updatedUnits));

        Swal.fire({
          title: "Terhapus!",
          text: `Unit "${unit}" berhasil dihapus.`,
          icon: "success",
          timer: 2000,
        });
      }
    });
  };

  const filteredData = guruData.filter(guru =>
    (unitFilter === '' || guru.unit === unitFilter) &&
    ((guru.nama ? guru.nama.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (guru.telegram_id ? guru.telegram_id.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (guru.unit ? guru.unit.toLowerCase().includes(searchTerm.toLowerCase()) : false))
  );

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
            <Link href='/daftaradmin'>
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
              <div className='ml-[-22px] rounded-lg mt-3 hover:bg-[#9C0006] p-[7px]'>
                <Image src={Orang} alt='Akses Pengguna' width={30} />
              </div>
            </Link>
            <div className='ml-[-20px]  text-white text-2xl rounded-lg mt-3 bg-[#9C0006] p-[8px]'>
              <FaTelegramPlane/>
            </div>
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
                <span className='text-lg font-semibold'>Akun Guru Telegram</span>
              </p>
            </Link>
            <div className="flex items-center space-x-4 mr-10">
              <div className="relative flex items-center">
                <IoMdSearch className="absolute left-3 text-gray-400" />
                <input
                  type='text'
                  placeholder='Cari'
                  className="pl-10 pr-5 py-1 rounded-full border border-gray-300 text-sm transition-all duration-300 focus:w-[250px] w-[200px] focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="px-3 py-1 rounded-full border border-gray-300 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              >
                <option value="">Semua Unit</option>
                {unitOptions.map((unit, index) => (
                  <option key={index} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className='mt-6 flex space-x-3'>
            <button
              className='bg-red-600 text-white px-4 py-2 rounded-md flex items-center text-sm'
              onClick={() => {
                setFormData({ nama: '', telegram_id: '', unit: '' });
                setIsEditing(false);
                setShowModal(true);
              }}
            >
              <FaPlus className='mr-2' size={14} /> Tambah Data Guru Telegram
            </button>
            
            <button
              className='bg-blue-600 text-white px-4 py-2 rounded-md flex items-center text-sm'
              onClick={() => setShowUnitModal(true)}
            >
              <FaPlus className='mr-2' size={14} /> Tambah Unit
            </button>
          </div>

          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Telegram</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((guru, index) => (
                      <tr key={guru.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{guru.nama}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{guru.unit}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{guru.telegram_id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleEdit(guru)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(guru.id || '')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash size={16} />
                          </button>
                          <button
                            onClick={() => handleSendNotification(guru)}
                            className="text-green-600 hover:text-green-900"
                            title="Kirim Notifikasi Tes"
                          >
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                        {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data guru telegram"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Form untuk tambah/edit guru */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{isEditing ? 'Edit Data Guru Telegram' : 'Tambah Data Guru Telegram'}</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Nama</label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Pilih Unit</option>
                      {unitOptions.map((unit, index) => (
                        <option key={index} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">ID Telegram</label>
                    <input
                      type="text"
                      name="telegram_id"
                      value={formData.telegram_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-400"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                    >
                      {isEditing ? 'Perbarui' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Modal untuk Tambah/Hapus Unit */}
          {showUnitModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Kelola Unit</h3>
                  <button
                    onClick={() => setShowUnitModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    &times;
                  </button>
                </div>

                {/* Input untuk menambahkan unit baru */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Nama Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Masukkan nama unit baru"
                    className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Daftar unit yang tersedia */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Unit yang Tersedia:</h4>
                  <div className="max-h-[200px] overflow-y-auto p-2 border rounded bg-gray-50">
                    {unitOptions.map((unit, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-1 px-2 border-b last:border-b-0"
                      >
                        <span>{unit}</span>
                        <button
                          onClick={() => handleDeleteUnit(unit)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tombol untuk menambahkan unit */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowUnitModal(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (newUnit.trim() && !unitOptions.includes(newUnit)) {
                        const updatedUnits = [...unitOptions, newUnit];
                        setUnitOptions(updatedUnits);

                        // Simpan ke localStorage
                        localStorage.setItem("unitOptions", JSON.stringify(updatedUnits));

                        setNewUnit("");
                        Swal.fire({
                          title: "Berhasil!",
                          text: "Unit baru berhasil ditambahkan",
                          icon: "success",
                          timer: 2000,
                        });
                      } else {
                        Swal.fire({
                          title: "Error",
                          text: "Unit sudah ada atau nama unit kosong",
                          icon: "error",
                        });
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Tambah Unit
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

// Make sure there's only ONE default export at the end of the file
export default Page;

// Hapus seluruh kode di bawah ini
const handleSendNotification = async (guru: GuruTelegram) => {
  // Pastikan guru memiliki telegram_id
  if (!guru.telegram_id) {
    Swal.fire({
      title: "Error",
      text: "Guru ini tidak memiliki ID Telegram yang valid",
      icon: "error"
    });
    return;
  }

  // Tampilkan form untuk mengisi data pengunjung
  Swal.fire({
    title: "Data Pengunjung",
    html: `
      <div class="mb-3">
        <label class="block text-sm font-medium mb-1">Nama Pengunjung</label>
        <input id="nama-pengunjung" class="w-full px-3 py-2 text-sm border rounded" required>
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium mb-1">Instansi</label>
        <input id="instansi" class="w-full px-3 py-2 text-sm border rounded" required>
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium mb-1">Keperluan</label>
        <input id="keperluan" class="w-full px-3 py-2 text-sm border rounded" required>
      </div>
      <div class="mb-3">
        <label class="block text-sm font-medium mb-1">Nomor Telepon</label>
        <input id="telepon" class="w-full px-3 py-2 text-sm border rounded" required>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Kirim Notifikasi",
    cancelButtonText: "Batal",
    preConfirm: () => {
      const namaPengunjung = (document.getElementById('nama-pengunjung') as HTMLInputElement).value;
      const instansi = (document.getElementById('instansi') as HTMLInputElement).value;
      const keperluan = (document.getElementById('keperluan') as HTMLInputElement).value;
      const telepon = (document.getElementById('telepon') as HTMLInputElement).value;
      
      if (!namaPengunjung || !instansi || !keperluan || !telepon) {
        Swal.showValidationMessage('Semua field harus diisi');
        return false;
      }
      
      return { namaPengunjung, instansi, keperluan, telepon };
    }
  }).then(async (result) => {
    if (result.isConfirmed && result.value) {
      const { namaPengunjung, instansi, keperluan, telepon } = result.value;
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}, ${currentDate.getHours()}.${currentDate.getMinutes()}.${currentDate.getSeconds()}`;
      
      try {
        // Format pesan notifikasi
        const message = `🔔 PEMBERITAHUAN PENGUNJUNG 🔔\n\nHalo ${guru.nama.toUpperCase()},\n\nAda pengunjung yang ingin menemui Anda:\n\n👤 Nama: ${namaPengunjung}\n🏢 Instansi: ${instansi}\n📝 Keperluan: ${keperluan}\n📱 Nomor Telepon: ${telepon}\n⏰ Waktu: ${formattedDate}\n\nSilakan menuju ke ruang tamu untuk menemuinya.`;
        
        // Kirim permintaan ke API untuk mengirim notifikasi
        const response = await axios.post("http://127.0.0.1:8000/api/send-telegram-notification", {
          telegram_id: guru.telegram_id,
          message: message
        });

        Swal.fire({
          title: "Berhasil!",
          text: "Notifikasi berhasil dikirim ke " + guru.nama,
          icon: "success",
          timer: 2000
        });
      } catch (error: any) {
        console.error("Error sending notification:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Gagal mengirim notifikasi",
          icon: "error"
        });
      }
    }
  });
};
