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
import axios from "axios";
import Swal from "sweetalert2";

// Interface untuk data guru dari API
interface GuruData {
  id: number;
  nama: string;
  telegram_id?: string; // Buat opsional untuk menghindari error jika tidak ada
  jabatan?: string; // Buat opsional untuk menghindari error jika tidak ada
  unit?: string; // Tambahkan unit sebagai alternatif jabatan
}

function Page() {
  // State untuk menyimpan data guru dari API
  const [guruData, setGuruData] = useState<GuruData[]>([]);
  // State untuk menyimpan data guru per unit
  const [guruPerUnit, setGuruPerUnit] = useState<Record<string, string[]>>({});
  // State untuk menyimpan ID Telegram guru
  const [guruTelegramIds, setGuruTelegramIds] = useState<Record<string, string>>({});
  // State untuk loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // Ambil data guru dari API saat komponen dimuat
  useEffect(() => {
    const fetchGuruData = async () => {
      try {
        setIsLoading(true);
        // Tambahkan timeout untuk menghindari permintaan yang terlalu lama
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Coba endpoint alternatif jika endpoint utama gagal
        let response;
        try {
          response = await axios.get("http://127.0.0.1:8000/api/guru-telegram-ids", {
            signal: controller.signal
          });
        } catch (initialError) {
          console.error("Error pada endpoint utama:", initialError);
          // Coba endpoint alternatif
          response = await axios.get("http://127.0.0.1:8000/api/gurus", {
            signal: controller.signal
          });
        }
        
        clearTimeout(timeoutId);
        
        console.log("Response API:", response.data); // Log untuk debugging
        
        if (response.data && Array.isArray(response.data)) {
          setGuruData(response.data);
          
          // Buat objek guruPerUnit dari data API
          const unitGroups: Record<string, string[]> = {};
          const telegramIds: Record<string, string> = {};
          
          response.data.forEach((guru: GuruData) => {
            // Tambahkan guru ke unit yang sesuai (gunakan jabatan atau unit)
            const unitName = guru.jabatan || guru.unit || "Guru";
            if (!unitGroups[unitName]) {
              unitGroups[unitName] = [];
            }
            unitGroups[unitName].push(guru.nama);
            
            // Simpan ID Telegram guru jika ada
            if (guru.telegram_id) {
              telegramIds[guru.nama] = guru.telegram_id;
            }
          });
          
          // Pastikan semua unit yang diperlukan ada
          const requiredUnits = [
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
          
          requiredUnits.forEach(unit => {
            if (!unitGroups[unit]) {
              unitGroups[unit] = [];
            }
          });
          
          // Tambahkan Kepala Sekolah jika tidak ada
          if (!unitGroups["Kepala Sekolah"].includes("MUHAMMAD SAAD, S.Pd., M.P.d.")) {
            unitGroups["Kepala Sekolah"].push("MUHAMMAD SAAD, S.Pd., M.P.d.");
            // Tambahkan ID Telegram default jika tidak ada
            if (!telegramIds["MUHAMMAD SAAD, S.Pd., M.P.d."]) {
              telegramIds["MUHAMMAD SAAD, S.Pd., M.P.d."] = "";
            }
          }
          
          setGuruPerUnit(unitGroups);
          setGuruTelegramIds(telegramIds);
          console.log("Data guru berhasil dimuat:", unitGroups);
          console.log("ID Telegram guru:", telegramIds);
        } else {
          console.error("Format data guru tidak valid:", response.data);
          Swal.fire({
            title: "Peringatan",
            text: "Format data guru tidak valid. Menggunakan data default.",
            icon: "warning",
            confirmButtonText: "OK"
          });
          
          // Gunakan data default jika API gagal
          const defaultUnits: Record<string, string[]> = {
            "Kepala Sekolah": ["MUHAMMAD SAAD, S.Pd., M.P.d."],
            "Guru": []
          };
          
          setGuruPerUnit(defaultUnits);
          setGuruTelegramIds({ "MUHAMMAD SAAD, S.Pd., M.P.d.": "" });
        }
      } catch (error: any) {
        console.error("Error fetching guru data:", error);
        
        // Pesan error yang lebih spesifik
        let errorMessage = "Gagal memuat data guru. ";
        
        if (error.name === 'AbortError') {
          errorMessage += "Permintaan timeout. ";
        } else if (error.response) {
          errorMessage += `Server merespon dengan status ${error.response.status}. `;
        } else if (error.request) {
          errorMessage += "Tidak ada respon dari server. ";
        } else {
          errorMessage += error.message;
        }
        
        errorMessage += "Menggunakan data default.";
        
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK"
        });
        
        // Gunakan data default jika API gagal
        const defaultUnits: Record<string, string[]> = {
          "Kepala Sekolah": ["MUHAMMAD SAAD, S.Pd., M.P.d."],
          "Guru": []
        };
        
        setGuruPerUnit(defaultUnits);
        setGuruTelegramIds({ "MUHAMMAD SAAD, S.Pd., M.P.d.": "" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuruData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "nomor_identitas") {
      // Hanya menerima angka
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prevState => ({
        ...prevState,
        [name]: numericValue
      }));
      return;
    }

    if (name === "nomor_telepon") {
      // Validasi nomor telepon: hanya angka dan maksimal 13 digit
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Pastikan dimulai dengan 08
      if (numericValue.startsWith("8") && numericValue.length === 1) {
        setFormData(prevState => ({
          ...prevState,
          [name]: "08"
        }));
      } else if (!numericValue.startsWith("0") && numericValue.length > 0) {
        setFormData(prevState => ({
          ...prevState,
          [name]: "0" + numericValue.substring(0, 12)
        }));
      } else {
        setFormData(prevState => ({
          ...prevState,
          [name]: numericValue.substring(0, 13)
        }));
      }
      return;
    }

    setFormData((prevState) => {
      let newState = { ...prevState, [name]: value };

      if (name === "tujuan" && value === "Kepala Sekolah") {
        newState.nama_yang_dikunjungi = "MUHAMMAD SAAD, S.Pd., M.P.d.";
      } else if (name === "tujuan") {
        newState.nama_yang_dikunjungi = "";
      }

      return newState;
    });
  };

  const daftarGuru =
    formData.tujuan && formData.tujuan !== "Kepala Sekolah"
      ? guruPerUnit[formData.tujuan] || []
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Validasi form
      if (!formData.nama_tamu || !formData.tujuan || !formData.nama_yang_dikunjungi || 
          !formData.keperluan || !formData.kartu_identitas || !formData.nomor_identitas || 
          !formData.nomor_telepon) {
        throw new Error("Semua field harus diisi");
      }

      // Tambahkan departemen berdasarkan tujuan
      const departemen = formData.tujuan;

      // Kirim data ke API baru
      const response = await axios.post("http://127.0.0.1:8000/api/form-submissions", {
        ...formData,
        departemen
      });

      // Tampilkan notifikasi sukses
      Swal.fire({
        title: "Berhasil!",
        text: "Data tamu berhasil disimpan",
        icon: "success",
        confirmButtonText: "OK"
      });

      // Reset form
      setFormData({
        nama_tamu: "",
        instansi: "",
        tujuan: "",
        nama_yang_dikunjungi: "",
        keperluan: "",
        kartu_identitas: "",
        nomor_identitas: "",
        nomor_telepon: "",
      });

      // Kirim notifikasi Telegram jika ada ID Telegram
      if (formData.nama_yang_dikunjungi && guruTelegramIds[formData.nama_yang_dikunjungi]) {
        try {
          await axios.post("http://127.0.0.1:8000/api/send-telegram-notification", {
            telegram_id: guruTelegramIds[formData.nama_yang_dikunjungi],
            message: `Ada tamu baru untuk Anda:\nNama: ${formData.nama_tamu}\nInstansi: ${formData.instansi}\nKeperluan: ${formData.keperluan}\nNo. Telepon: ${formData.nomor_telepon}`
          });
        } catch (telegramError) {
          console.error("Gagal mengirim notifikasi Telegram:", telegramError);
        }
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      
      let errorMessage = "Terjadi kesalahan saat menyimpan data";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      
      setErrorMsg(errorMessage);
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setIsSubmitting(false);
    }
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

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d62b4e] mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data guru...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="relative z-10 flex justify-center pt-5">
                <div className="w-[90%] max-w-5xl rounded-xl p-6">
                  <div className="flex justify-between flex-wrap gap-5">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4 w-full md:w-[48%]">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Nama
                        </label>
                        <input
                          type="text"
                          name="nama_tamu"
                          placeholder="Nama lengkap (KAPITAL)"
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm"
                          value={formData.nama_tamu}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Instansi
                        </label>
                        <input
                          type="text"
                          name="instansi"
                          placeholder="Instansi / Jabatan"
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm"
                          value={formData.instansi}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Tujuan (Unit)
                        </label>
                        <select
                          name="tujuan"
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm"
                          value={formData.tujuan}
                          onChange={handleChange}
                        >
                          <option value="">Unit</option>
                          <option value="Kepala Sekolah">Kepala Sekolah</option>
                          <option value="Perf. QMR">Perf. QMR</option>
                          <option value="Keuangan / Administrasi">Keuangan / Administrasi</option>
                          <option value="Kurikulum">Kurikulum</option>
                          <option value="Kesiswaan">Kesiswaan</option>
                          <option value="Sarpra (Sarana dan Prasarana)">Sarpra (Sarana dan Prasarana)</option>
                          <option value="Hubin (Hubungan Industri)">Hubin (Hubungan Industri)</option>
                          <option value="PPDB (Penerimaan Peserta Didik Baru)">PPDB (Penerimaan Peserta Didik Baru)</option>
                          <option value="Guru">Guru</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Nama yang dikunjungi
                        </label>
                        <select
                          name="nama_yang_dikunjungi"
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm"
                          value={formData.nama_yang_dikunjungi}
                          onChange={handleChange}
                          disabled={!formData.tujuan}
                        >
                          <option value="">Pilih Nama</option>
                          {formData.tujuan === "Kepala Sekolah" ? (
                            <option value="MUHAMMAD SAAD, S.Pd., M.P.d.">MUHAMMAD SAAD, S.Pd., M.P.d.</option>
                          ) : (
                            daftarGuru.map((guru, index) => (
                              <option key={index} value={guru}>
                                {guru}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4 w-full md:w-[48%]">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Keperluan
                        </label>
                        <input
                          name="keperluan"
                          placeholder="Jelaskan keperluan Anda ..."
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm resize-none"
                          value={formData.keperluan}
                          onChange={handleChange}
                        ></input>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Kartu Identitas
                        </label>
                        <select
                          name="kartu_identitas"
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm"
                          value={formData.kartu_identitas}
                          onChange={handleChange}
                        >
                          <option value="">Pilih Kartu Identitas</option>
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
                        <label className="block text-sm font-medium text-black mb-2">
                          Nomor Identitas
                        </label>
                        <input
                          name="nomor_identitas"
                          placeholder={formData.kartu_identitas ? "Masukkan nomor identitas ..." : "Pilih Kartu Identitas Terlebih dahulu"}
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm resize-none"
                          value={formData.nomor_identitas || ""}
                          onChange={handleChange}
                          disabled={!formData.kartu_identitas}
                          type="text"
                          inputMode="numeric"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Nomor Telpon
                        </label>
                        <input
                          type="text"
                          name="nomor_telepon"
                          placeholder="08.."
                          className="w-full py-3 px-4 border border-black rounded-xl bg-[#ECECF2] focus:outline-none focus:ring-1 focus:ring-[#d62b4e] shadow-md placeholder-gray-500 text-sm"
                          value={formData.nomor_telepon}
                          onChange={handleChange}
                          maxLength={13}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tombol Selesai */}
              <div className="flex justify-center mt-6 mb-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-[#d62b4e] text-white py-3 px-8 rounded-xl shadow-md hover:bg-[#b0243f] transition-colors ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Mengirim..." : "Selesai"}
                </button>
              </div>
            </form>
          )}

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
      </div>
    </>
  );
}

export default Page;
