"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Stelker1 from "../assets/images/StelkerAtas.png";
import Stelker2 from "../assets/images/StelkerBawah.png";
import tschool from "../assets/images/LogoTSWarna.png";
import vector1 from "../assets/svgs/Vector1.svg";
import vector2 from "../assets/svgs/vector2.svg";
import vector3 from "../assets/svgs/vector3.svg";
import vector4 from "../assets/svgs/vector4.svg";
import Link from "next/link";
import api from "../utils/axios";

// Interface untuk guru dengan status kehadiran
interface GuruWithStatus {
  id?: number;
  nama: string;
  unit: string;
  telegram_id?: string;
  status?: 'present' | 'permission' | 'sick' | null;
  reason?: string;
}

function Page() {
  // Data statis sebagai fallback jika API gagal
  const staticGuruPerUnit = {
    "Kepala Sekolah": ["MUHAMMAD SAAD, S.Pd., M.P.d."],
    "Perf. QMR": ["ASMAWATI, S.Sos","ERWINDA DWI PRATIWI, S.Pd., M.S.Ed"],
    "Keuangan / Administrasi": ["RUMAISHA IKHWANA, SE","ADHYTIA ADHYAKSA, S.E.","ADLI DZIL IKRAM, S.Ak","ANDI MUHAMMAD MAULANA SIDENG, Amd","SJAMSIAH, S.S."],
    "Kurikulum": ["DR. RAHMAT MAHMUD, S.Pd, M.Pd","SRI HASTUTI, S.S.","Drs. SATTUBANG, S.ST, M.Pd","RATU ELIA YUANITA, S.Si","RAODATUL JANNAH, S.T, S.Pd, M.Pd","ALI AKBAR, S. Kom., M.Pd","KHAERUL ISHAK, S.Pd, M.Pd","NURFAIDAH JABBAR, S.IP","YAYU APRILIKA YUNUS, S.Si"],
    "Kesiswaan": ["ERLINDAH ZULHAIDAH SIDNIWATI SUYUTHI, ST., M.Pd","WIDIANI, S.Pd","ROSMAWATI, S.Pd","ABU ALI, S.Pd, Gr","MUHAMMAD IKMAL AKBAR, S.Pd","A. NOORIAH MUJAHIDAH, S.Pd","FARID MAWARDI, S.Pd, Gr., M.Pd","NURDIANAH, S.Pd., M.Pd","HARYADI INDRAWIJAYA, S.Pd"],
    "Sarpra (Sarana dan Prasarana)": ["ALI AKBAR, S. Kom., M.Pd","SUKIRMAN","ASRUL, S.Pd, M.Pd","MATIUS RAWA, S.H.","MANSYUR MUIS, S.M.","EKA MERDEKAWATI, ST, M.Pd","AHWAN AZHARI TAHIR, S.T., Gr"],
    "Hubin (Hubungan Industri)": ["MUSLIADI, S.ST","FIRMAN SYAHIR, S.Pd., M.Pd","DANIEL D. TANAN, SH. M.Pd","SANDY ARDIANSYAH","AYU RISMAYANTI, S.Pd., M.Pd","HASLINA, S.Pd","NURWAHYUNI"],
    "PPDB (Penerimaan Peserta Didik Baru)": ["DANIEL D. TANAN, SH. M.Pd","FIRMAN SYAHIR, S.Pd., M.Pd"],
    "Guru": ["ABDUL MALIK, S.Pd","ADI MANGGALIA AMAHORU, S.Pd","ANANDA DZIKMAH AMALIA AZ, S.Tr.Par","ANDI HANIFAH PUTRI RANI, S.Kom","ARMAN, S.Pd., M.Hum.","ASKAR ASWIN AHMAD, S.Pd","ASNAWI, S.HI., Gr","BAKRI CACO, S.Ag, M.Si","DEMETER JANNIAH SABATINI, S.Pd., M.Pd","DEWI, S.Pd","DINDA PUTRU OETAMI, S.Pd., M.Pd","HARI SUSANTO, S.Pd","HILMAWATI, S.Ag., Gr","KARMILA INDAH HASIN, S.Pd., M.Pd","MESY ANDI IDHAM, S.T"," MOSES SALEMBAN, S.Pd","MUH. ADE SYAM AGUNG, S.Pd","MUHAMMAD FADHLAN SUPRIADI, S.Kom","MUHAMMAD NUR ARBI, S.Pd., M.Pd","NADYAH NURHIDAYAH N, S.Pd., M.Pd","NURHIKMAH UTAMI, S.Pd","OKTAVIANTO, S.Kom","PADLI SEPTIAN, S.Pd","RAHMAT DANI S., S.Kom","RISDAYANTI, S.Pd","ROSALINA, S.Ag, M.Si","SAMRIANI, S.Pd., M.Pd"," SITTI DARMAWATI, S.Pd., M.Pd","SUKMAWATI, S.Pd., M.Pd","TIRSA WULANDARI, S.Pd","TRY SUHARTO, S.Pd","UMMI SUNAIR, S.Pd., M.Pd","WAHYU ILAHI SYAM, S.Pd","YHUGI PRATAMA SAPUTRA A., S.Pd"],
  };

  // State untuk menyimpan data guru dari API
  const [guruPerUnit, setGuruPerUnit] = useState(staticGuruPerUnit);
  // Tambahkan state untuk menyimpan ID Telegram guru
  const [guruTelegramIds, setGuruTelegramIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama_tamu: "",
    instansi: "",
    tujuan: "",
    nama_yang_dikunjungi: "",
    keperluan: "",
    kartu_identitas: "",
    nomor_identitas:"",
    nomor_telepon: "",
  });

  const [showNotification, setShowNotification] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [focusedInputs, setFocusedInputs] = useState<Record<string, boolean>>({});
  const [daftarGuru, setDaftarGuru] = useState<string[]>([]);
  
  // Add this new state to store available units from API
  const [availableUnits, setAvailableUnits] = useState<string[]>([
    "Kepala Sekolah",
    "Perf. QMR",
    "Keuangan / Administrasi",
    "Kurikulum",
    "Kesiswaan",
    "Sarpra (Sarana dan Prasarana)",
    "Hubin (Hubungan Industri)",
    "PPDB (Penerimaan Peserta Didik Baru)",
    "Guru"
  ]);

  // Di dalam komponen Page, tambahkan state baru
  const [guruStatus, setGuruStatus] = useState<Record<string, string>>({});
  const [guruReasons, setGuruReasons] = useState<Record<string, string>>({});

  // Fix 4: Define fetchGuruData outside useEffect
  const fetchGuruData = async () => {
    try {
      setLoading(true);
      console.log("Mengambil data dari API guru-telegram-ids...");
      
      // Fetch teacher data from API
      const response = await fetch('http://127.0.0.1:8000/api/guru-telegram-ids');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data guru');
      }
      
      const data = await response.json();
      console.log(`Berhasil mendapatkan ${data.length} data guru dari API`);
  
      // Group teachers by unit and combine with attendance data
      const groupedGuru: Record<string, string[]> = {};
      const telegramIds: Record<string, string> = {};
      const statuses: Record<string, string> = {};
      const reasons: Record<string, string> = {};
  
      // Get unique units
      const uniqueUnits = Array.from(new Set(data.map((guru: any) => guru.unit))).filter(Boolean);
      uniqueUnits.forEach(unit => {
        groupedGuru[unit] = [];
      });
  
      // Process each teacher
      data.forEach((guru: any) => {
        if (!guru.nama || !guru.unit) {
          console.warn("Data guru tidak lengkap:", guru);
          return;
        }
        
        const unit = guru.unit;
        if (!groupedGuru[unit]) {
          groupedGuru[unit] = [];
        }
        
        // Ambil status kehadiran dari API
        if (guru.kehadiran) {
          // Konversi status API ke format internal
          let status = 'present';
          if (guru.kehadiran === 'sakit') status = 'sick';
          else if (guru.kehadiran === 'izin') status = 'permission';
          
          statuses[guru.nama] = status;
          
          // Simpan alasan jika ada
          if (guru.alasan_ketidakhadiran) {
            reasons[guru.nama] = guru.alasan_ketidakhadiran;
          }
        } else {
          // Default to present jika tidak ada data kehadiran
          statuses[guru.nama] = 'present';
        }
        
        // Add to grouped guru
        if (!groupedGuru[unit].includes(guru.nama)) {
          groupedGuru[unit].push(guru.nama);
        }
  
        // Save Telegram ID if available
        if (guru.telegram_id) {
          telegramIds[guru.nama] = guru.telegram_id;
        }
      });
  
      // Update state with API data
      setGuruPerUnit(groupedGuru);
      setGuruTelegramIds(telegramIds);
      setGuruStatus(statuses);
      setGuruReasons(reasons);
      setAvailableUnits(uniqueUnits);
      
      // Update daftarGuru if unit is already selected
      if (formData.tujuan && groupedGuru[formData.tujuan]) {
        setDaftarGuru(groupedGuru[formData.tujuan]);
      }
  
      console.log('Data guru dan unit berhasil diperbarui:', groupedGuru, uniqueUnits);
      console.log('Data status guru:', statuses);
      console.log('Data alasan ketidakhadiran:', reasons);
    } catch (error) {
      console.error('Error fetching guru data:', error);
  
      // Fallback to static data if API fails
      setGuruPerUnit(staticGuruPerUnit);
      setAvailableUnits(Object.keys(staticGuruPerUnit));
      setGuruTelegramIds({ "MUHAMMAD SAAD, S.Pd., M.P.d.": "" });
      
      if (formData.tujuan) {
        setDaftarGuru(staticGuruPerUnit[formData.tujuan] || []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a new function to fetch units
  const fetchUnits = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/units');
      if (!response.ok) {
        // If units endpoint doesn't exist, try to extract units from guru-telegram-ids
        const guruResponse = await fetch('http://127.0.0.1:8000/api/guru-telegram-ids');
        if (guruResponse.ok) {
          const guruData = await guruResponse.json();
          // Extract unique units from guru data
          const uniqueUnits = Array.from(new Set(guruData.map((guru: any) => guru.unit))).filter(Boolean);
          if (uniqueUnits.length > 0) {
            setAvailableUnits(uniqueUnits as string[]);
            
            // Create empty arrays for any new units in guruPerUnit
            const updatedGuruPerUnit = { ...guruPerUnit };
            uniqueUnits.forEach(unit => {
              if (!updatedGuruPerUnit[unit]) {
                updatedGuruPerUnit[unit] = [];
              }
            });
            setGuruPerUnit(updatedGuruPerUnit);
          }
        }
        return;
      }
      
      const unitsData = await response.json();
      if (Array.isArray(unitsData) && unitsData.length > 0) {
        setAvailableUnits(unitsData);
        
        // Create empty arrays for any new units in guruPerUnit
        const updatedGuruPerUnit = { ...guruPerUnit };
        unitsData.forEach(unit => {
          if (!updatedGuruPerUnit[unit]) {
            updatedGuruPerUnit[unit] = [];
          }
        });
        setGuruPerUnit(updatedGuruPerUnit);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      // Fallback to default units already in state
    }
  };

  // Hapus useEffect duplikat dan gabungkan menjadi satu useEffect untuk pembaruan berkala
useEffect(() => {
  // Inisialisasi data saat komponen dimuat
  const initializeData = async () => {
    setLoading(true);
    try {
      await fetchGuruData();
      // fetchUnits tidak diperlukan lagi karena sudah dihandle oleh fetchGuruData
    } finally {
      setLoading(false);
    }
  };
  
  initializeData();
  
  // Set interval untuk pembaruan berkala
  const guruIntervalId = setInterval(() => {
    fetchGuruData();
  }, 60000); // Update setiap 15 detik
  
  return () => {
    clearInterval(guruIntervalId);
  };
}, []);

  useEffect(() => {
    console.log('guruPerUnit:', guruPerUnit);
    console.log('availableUnits:', availableUnits);
    console.log('daftarGuru:', daftarGuru);
  }, [guruPerUnit, availableUnits, daftarGuru]);

  const getInputClass = (name: string) => {
    const baseClass = "w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md text-sm transition-all duration-300";
    return activeInput === name 
      ? `${baseClass} scale-[1.02] border-[#d62b4e]` 
      : baseClass;
  };
  
  const getLabelClass = (name: string) => {
    const baseClass = "block text-sm font-medium mb-2 transition-all duration-300";
    return focusedInputs[name] || formData[name as keyof typeof formData]
      ? `${baseClass} transform -translate-x-2 text-[#d62b4e]`
      : `${baseClass} text-black`;
  };

  // Rest of your existing code remains the same...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // Specific validation
      if (!formData.nama_tamu.trim()) {
        throw new Error("Nama tidak boleh kosong");
      }
      if (!formData.nomor_telepon.trim() || formData.nomor_telepon.length < 10) {
        throw new Error("Nomor telepon tidak valid (minimal 10 digit)");
      }
      const isFormValid = Object.values(formData).every(
        (value) => value.trim() !== ""
      );
      if (!isFormValid) {
        throw new Error("Harap isi semua kolom yang diperlukan");
      }
      
      // Di dalam handleSubmit, tambahkan sebelum endpoint creation
      const selectedGuru = formData.nama_yang_dikunjungi;
      const guruCurrentStatus = guruStatus[selectedGuru];

      if (guruCurrentStatus === 'sick' || guruCurrentStatus === 'permission') {
        const statusMsg = guruCurrentStatus === 'sick' ? 'sedang sakit' : 
                        `sedang izin${guruReasons[selectedGuru] ? ': ' + guruReasons[selectedGuru] : ''}`;
        
        throw new Error(`${selectedGuru} ${statusMsg} dan tidak dapat dikunjungi. Silakan pilih guru lain.`);
      }

      // Gunakan endpoint baru untuk semua tujuan
      const endpoint = "/form-submissions";
      
      console.log("Endpoint yang digunakan:", endpoint);
      console.log("Data yang dikirim:", formData);
      // Send form data to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log("Response dari API:", response.data);
      
      // Kirim notifikasi Telegram ke guru yang dipilih
      try {
        // Dapatkan nama guru yang dipilih
        const selectedGuru = formData.nama_yang_dikunjungi;
        const telegramId = guruTelegramIds[selectedGuru];
        
        if (telegramId) {
          // Format pesan notifikasi
          const message = `🔔 PEMBERITAHUAN PENGUNJUNG 🔔

Halo ${selectedGuru},

Ada pengunjung yang ingin menemui Anda:

👤 Nama: ${formData.nama_tamu}
🏢 Instansi: ${formData.instansi}
📝 Keperluan: ${formData.keperluan}
📱 Nomor Telepon: ${formData.nomor_telepon}
⏰ Waktu: ${new Date().toLocaleString('id-ID')}`;
          
          // Kirim notifikasi ke Telegram dengan timeout
          const notifController = new AbortController();
          const notifTimeoutId = setTimeout(() => notifController.abort(), 5000);
          
          await api.post('http://127.0.0.1:8000/api/send-telegram-notification', {
            telegram_id: telegramId,
            message: message
          }, {
            signal: notifController.signal
          });
          
          clearTimeout(notifTimeoutId);
          
          console.log('Notifikasi Telegram berhasil dikirim ke:', selectedGuru);
        } else {
          console.warn("ID Telegram tidak ditemukan untuk guru:", selectedGuru);
        }
      } catch (notifError) {
        console.error("Gagal mengirim notifikasi Telegram:", notifError);
        // Lanjutkan proses meskipun notifikasi gagal
      }
      
      if (response.status === 201 || response.status === 200) {
        window.location.href = "/closing";
      } else {
        throw new Error("Gagal mengirim data, coba lagi.");
      }
    } catch (error: any) {
      console.error("Error response:", error);
      let errorMessage = "";
      if (error.name === 'AbortError') {
        errorMessage = "Permintaan timeout. Silakan coba lagi.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = "Terjadi kesalahan saat mengirim data.";
      }
      setErrorMsg(errorMessage);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add missing handleChange function that updates formData and handles unit selection
  // Fix 3: Improve handleChange to handle new units
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validasi guru tersedia jika mencoba memilih guru
    if (name === 'nama_yang_dikunjungi' && value) {
      const status = guruStatus[value];
      
      if (status === 'sick' || status === 'permission') {
        const statusMsg = status === 'sick' ? 'sedang sakit' : 
                         `sedang izin${guruReasons[value] ? ': ' + guruReasons[value] : ''}`;
        
        setErrorMsg(`${value} ${statusMsg} dan tidak dapat dikunjungi. Silakan pilih guru lain.`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        return; // Jangan update state jika guru tidak tersedia
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Ketika tujuan (unit) berubah, perbarui daftarGuru dengan guru list untuk unit tersebut
    if (name === 'tujuan') {
      setFormData(prev => ({
        ...prev,
        nama_yang_dikunjungi: '' // Reset selected guru ketika unit berubah
      }));
      
      // Set daftar guru untuk unit yang dipilih
      if (value) {
        console.log(`Unit dipilih: ${value}, memperbarui daftar guru`);
        
        if (guruPerUnit[value]) {
          console.log(`Ditemukan ${guruPerUnit[value].length} guru untuk unit ${value}`);
          setDaftarGuru(guruPerUnit[value]);
        } else {
          console.log(`Tidak ada guru untuk unit ${value}`);
          setDaftarGuru([]);
        }
      } else {
        setDaftarGuru([]);
      }
    }
  };

  // Add functions for input focus handling
  const handleFocus = (name: string) => {
    setActiveInput(name);
    setFocusedInputs(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (name: string) => {
    setActiveInput(null);
    setFocusedInputs(prev => ({
      ...prev,
      [name]: false
    }));
  };

  // Add a function to refresh units (to be called manually or on some event)
  const refreshUnits = () => {
    fetchUnits();
  };

  return (
    <>
      <div className="min-h-screen bg-[#e6e6e9] relative overflow-y-auto flex flex-col">
        {/* Header Image */}
        <div className="flex justify-center pt-5 bg-[#c5192d] relative z-20">
          <Image
            src={Stelker1}
            alt="stelker"
            className="w-auto h-auto opacity-60"
          />
        </div>

        {/* Background Vectors */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-16 -left-10 w-[400px] hidden md:block">
            <Image alt="vector1" src={vector1} className="w-full h-auto" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[200px] w-[320px] mb-36 md:mb-[-10px] md:block">
            <Image
              alt="tschool logo"
              src={tschool}
              className="w-full h-auto opacity-50"
            />
          </div>
          <div className="absolute right-1 w-[400px] hidden md:block">
            <Image alt="vector3" src={vector3} className="w-full h-auto" />
          </div>
          <div className="absolute bottom-[94px] w-[500px] hidden md:block">
            <Image alt="vector2" src={vector2} className="w-full h-auto" />
          </div>
          <div className="absolute bottom-28 right-[5%] w-[300px] hidden md:block">
            <Image alt="vector4" src={vector4} className="w-full h-auto" />
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 relative z-20">
          <Link href="/">
            <div className="p-3">
              <button className="text-[#d62b4e] text-sm">&lt; Kembali</button>
            </div>
          </Link>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d62b4e]"></div>
              <p className="ml-3 text-[#d62b4e]">Memuat data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <style jsx global>{`
                option:disabled {
                  color: #999;
                  font-style: italic;
                  background-color: #f3f4f6;
                }
              `}</style>
              <div className="relative z-10 flex justify-center pt-2">
                <div className="w-[90%] max-w-5xl rounded-xl p-4">
                  <div className="flex justify-between flex-wrap gap-3">
                    {/* Left Column */}
                    <div className="flex flex-col gap-3 w-full md:w-[48%]">
                      <div>
                        <label className={getLabelClass("nama_tamu")}
                          htmlFor="nama_tamu"
                        >
                          Nama
                        </label>
                        <input
                          type="text"
                          name="nama_tamu"
                          id="nama_tamu"
                          placeholder="Nama lengkap (KAPITAL)"
                          className={getInputClass("nama_tamu")}
                          value={formData.nama_tamu}
                          onChange={handleChange}
                          onFocus={() => handleFocus("nama_tamu")}
                          onBlur={() => handleBlur("nama_tamu")}
                        />
                      </div>
                      <div>
                        <label className={getLabelClass("instansi")}
                          htmlFor="instansi"
                        >
                          Instansi
                        </label>
                        <input
                          type="text"
                          name="instansi"
                          id="instansi"
                          placeholder="Instansi / Jabatan"
                          className={getInputClass("instansi")}
                          value={formData.instansi}
                          onChange={handleChange}
                          onFocus={() => handleFocus("instansi")}
                          onBlur={() => handleBlur("instansi")}
                        />
                      </div>
                      <div>
                        <label className={getLabelClass("tujuan")}
                          htmlFor="tujuan"
                        >
                          Tujuan (Unit)
                        </label>
                        <select
                          name="tujuan"
                          id="tujuan"
                          className={getInputClass("tujuan")}
                          value={formData.tujuan}
                          onChange={handleChange}
                          onFocus={() => handleFocus("tujuan")}
                          onBlur={() => handleBlur("tujuan")}
                        >
                          <option value="">Pilih Unit</option>
                          {availableUnits.map((unit, index) => (
                            <option key={index} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={getLabelClass("nama_yang_dikunjungi")}
                          htmlFor="nama_yang_dikunjungi"
                        >
                          Nama yang dikunjungi
                        </label>
                        <select
                          name="nama_yang_dikunjungi"
                          id="nama_yang_dikunjungi"
                          className={getInputClass("nama_yang_dikunjungi")}
                          value={formData.nama_yang_dikunjungi}
                          onChange={handleChange}
                          onFocus={() => handleFocus("nama_yang_dikunjungi")}
                          onBlur={() => handleBlur("nama_yang_dikunjungi")}
                        >
                          <option value="">Pilih Guru</option>
                          {daftarGuru.map((guru, index) => {
                            const status = guruStatus[guru] || 'present';
                            const isAvailable = status === 'present';
                            const statusText = status === 'sick' ? ' (Sakit)' : 
                                               status === 'permission' ? ` (Izin: ${guruReasons[guru] || ''})` : 
                                               '';
                            
                            return (
                              <option 
                                key={index} 
                                value={guru}
                                disabled={!isAvailable}
                                className={!isAvailable ? 'text-gray-400' : ''}
                              >
                                {guru}{statusText}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-3 w-full md:w-[48%]">
                      <div>
                        <label className={getLabelClass("keperluan")}
                          htmlFor="keperluan"
                        >
                          Keperluan
                        </label>
                        <input
                          name="keperluan"
                          id="keperluan"
                          placeholder="Jelaskan keperluan Anda ..."
                          className={getInputClass("keperluan")}
                          value={formData.keperluan}
                          onChange={handleChange}
                          onFocus={() => handleFocus("keperluan")}
                          onBlur={() => handleBlur("keperluan")}
                        />
                      </div>

                      <div>
                        <label className={getLabelClass("kartu_identitas")}
                          htmlFor="kartu_identitas"
                        >
                          Kartu Identitas
                        </label>
                        <select
                          name="kartu_identitas"
                          id="kartu_identitas"
                          className={getInputClass("kartu_identitas")}
                          value={formData.kartu_identitas}
                          onChange={handleChange}
                          onFocus={() => handleFocus("kartu_identitas")}
                          onBlur={() => handleBlur("kartu_identitas")}
                        >
                          {!formData.kartu_identitas && <option value="">
                            Pilih Kartu Identitas
                          </option>}
                          <option value="KTP (Kartu Tanda Penduduk)">
                            KTP (Kartu Tanda Penduduk)
                          </option>
                          <option value="NPWP (Nomor Pokok Wajib Pajak)">
                            NPWP (Nomor Pokok Wajib Pajak)
                          </option>
                          <option value="ID Pegawai / Karyawan">
                            ID Pegawai / Karyawan
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className={getLabelClass("nomor_identitas")}
                          htmlFor="nomor_identitas"
                        >
                          Nomor Identitas
                        </label>
                        <input
                          name="nomor_identitas"
                          id="nomor_identitas"
                          placeholder={formData.kartu_identitas ? "Masukkan nomor identitas ..." : "Pilih Kartu Identitas Terlebih dahulu"}
                          className={getInputClass("nomor_identitas")}
                          value={formData.nomor_identitas}
                          onChange={handleChange}
                          onFocus={() => handleFocus("nomor_identitas")}
                          onBlur={() => handleBlur("nomor_identitas")}
                          disabled={!formData.kartu_identitas}
                          type="text"
                          inputMode="numeric"
                        />
                      </div>

                      <div>
                        <label className={getLabelClass("nomor_telepon")}
                          htmlFor="nomor_telepon"
                        >
                          Nomor Telepon
                        </label>
                        <input
                          type="text"
                          name="nomor_telepon"
                          id="nomor_telepon"
                          placeholder="08.."
                          className={getInputClass("nomor_telepon")}
                          value={formData.nomor_telepon}
                          onChange={handleChange}
                          onFocus={() => handleFocus("nomor_telepon")}
                          onBlur={() => handleBlur("nomor_telepon")}
                          maxLength={13}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Div terpisah untuk tombol submit */}
                  <div className="flex justify-center mt-10 mb-4">
                    <button
                      type="submit"
                      className="text-white bg-[#BA272D] px-6 py-2 rounded-lg font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b82543]"
                      disabled={
                        !Object.values(formData).every((value) => value.trim() !== "")
                      }
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Notification */}
        {showNotification && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-0">
            {errorMsg || "Harap isi semua form!"}
          </div>
        )}

        {/* Footer Image */}
        <div className="flex justify-center bg-[#c5192d] pb-5 relative z-20">
          <Image
            src={Stelker2}
            alt="stelker"
            className="w-auto h-auto opacity-60"
          />
        </div>
      </div>
    </>
  );
}

export default Page;