"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

// Interface untuk data guru dari API
interface GuruData {
  id?: number;
  nama: string;
  unit: string;
  telegram_id?: string;
}

// Interface untuk menyimpan guru per unit
interface GuruPerUnit {
  [unit: string]: string[];
}

const EditFormSubmission = () => {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_tamu: "",
    instansi: "",
    tujuan: "", 
    nama_yang_dikunjungi: "",
    keperluan: "",
    kartu_identitas: "",
    nomor_telepon: "",
    nomor_identitas: "",
    status: "Pending"
  });
  
  // Gunakan state untuk menyimpan data guru yang diambil dari API
  const [guruPerUnit, setGuruPerUnit] = useState<GuruPerUnit>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fungsi untuk mengambil data guru dari API
  const fetchGuruData = async () => {
    try {
      console.log("Mengambil data guru dari API...");
      const response = await axios.get("http://127.0.0.1:8000/api/guru-telegram-ids");
      
      // Log data mentah untuk debugging
      console.log("Data guru dari API:", response.data);
      
      // Kelompokkan guru berdasarkan unit
      const groupedGuru: GuruPerUnit = {};
      
      // Asumsikan response.data adalah array dari objek guru
      response.data.forEach((guru: GuruData) => {
        // Pastikan unit ada
        if (!guru.unit) return;
        
        // Inisialisasi array jika unit belum ada
        if (!groupedGuru[guru.unit]) {
          groupedGuru[guru.unit] = [];
        }
        
        // Tambahkan nama guru ke unit
        groupedGuru[guru.unit].push(guru.nama);
      });
      
      console.log("Data guru yang dikelompokkan:", groupedGuru);
      setGuruPerUnit(groupedGuru);
      
    } catch (error) {
      console.error("Error mengambil data guru:", error);
      // Tampilkan pesan error, tetapi jangan gagalkan seluruh proses
      Swal.fire({
        title: 'Peringatan',
        text: 'Gagal memuat data guru. Menggunakan data cadangan.',
        icon: 'warning',
        timer: 3000
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ambil data guru terlebih dahulu
        await fetchGuruData();
        
        // Kemudian ambil data form submission
        const response = await axios.get(`http://127.0.0.1:8000/api/form-submissions/${id}`);
        
        // Assuming the API returns the data directly
        if (response.data) {
          setFormData({
            nama_tamu: response.data.nama_tamu || "",
            instansi: response.data.instansi || "",
            tujuan: response.data.tujuan || "",
            nama_yang_dikunjungi: response.data.nama_yang_dikunjungi || "",
            keperluan: response.data.keperluan || "",
            kartu_identitas: response.data.kartu_identitas || "",
            nomor_identitas: response.data.nomor_identitas || "",
            nomor_telepon: response.data.nomor_telepon || "",
            status: response.data.status || "Pending"
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data. Silakan coba lagi nanti.");
        
        Swal.fire({
          title: 'Error!',
          text: 'Terjadi masalah dalam pengambilan data',
          icon: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi handleSubmit yang diperbarui
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah Anda yakin ingin menyimpan perubahan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try {
        // Loading state
        Swal.fire({
          title: 'Menyimpan...',
          text: 'Mohon tunggu',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Gunakan endpoint yang konsisten dengan pattern yang ada
        // Gunakan PUT untuk update data lengkap
        const response = await axios.put(
          `http://127.0.0.1:8000/api/form-submissions/${id}`,
          formData
        );
        
        console.log("Respons dari server:", response.data);
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil diperbarui',
          icon: 'success'
        });

        // Redirect to form submissions page after successful update
        router.push('/daftaradmin'); // Disesuaikan dengan route yang benar
      } catch (error) {
        console.error("Error saat mengirim data:", error);
        
        // Coba dengan endpoint alternatif jika yang pertama gagal
        try {
          console.log("Mencoba dengan endpoint alternatif...");
          const response = await axios.patch(
            `http://127.0.0.1:8000/api/form-submissions/${id}`,
            formData
          );
          
          console.log("Respons dari endpoint alternatif:", response.data);
          
          Swal.fire({
            title: 'Berhasil!',
            text: 'Data berhasil diperbarui',
            icon: 'success'
          });
          
          // Redirect setelah sukses
          router.push('/daftaradmin');
        } catch (secondError) {
          console.error("Error dengan endpoint alternatif:", secondError);
          throw secondError;
        }
      }
    }
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat menyimpan data';
    
    if (axios.isAxiosError(error)) {
      console.error("Response error:", error.response?.data);
      errorMessage = error.response?.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    Swal.fire({
      title: 'Gagal!',
      text: errorMessage,
      icon: 'error'
    });
  }
};

  const selectedTujuan = formData.tujuan;

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Edit Data Tamu</h1>
        <button
          onClick={() => router.push('/form-submissions')}
          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
        >
          X
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Tamu */}
        <div>
          <label className="block font-semibold">Nama Tamu</label>
          <input
            type="text"
            name="nama_tamu"
            value={formData.nama_tamu}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Instansi */}
        <div>
          <label className="block font-semibold">Instansi</label>
          <input
            type="text"
            name="instansi"
            value={formData.instansi}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Tujuan - Menggunakan data dari API */}
        <div>
          <label className="block font-semibold">Tujuan</label>
          <select
            name="tujuan"
            value={formData.tujuan || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded-md mb-2"
          >
            <option value="">-- Tidak Ada Tujuan --</option>
            {Object.keys(guruPerUnit).length > 0 ? (
              Object.keys(guruPerUnit).map((unitKey) => (
                <option key={unitKey} value={unitKey}>
                  {unitKey}
                </option>
              ))
            ) : (
              <option disabled>Loading data unit...</option>
            )}
          </select>
        </div>

        {/* Nama yang Dikunjungi - Menggunakan data dari API */}
        <div>
          <label className="block font-semibold">Nama yang Dikunjungi</label>
          <select
            name="nama_yang_dikunjungi"
            value={formData.nama_yang_dikunjungi || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          >
            <option value="">-- Tidak Ada Nama --</option>
            {selectedTujuan && 
             guruPerUnit[selectedTujuan] && 
             guruPerUnit[selectedTujuan].length > 0 ? (
              guruPerUnit[selectedTujuan].map((guru) => (
                <option key={guru} value={guru}>
                  {guru}
                </option>
              ))
            ) : (
              <option disabled>
                {selectedTujuan ? "Tidak ada guru di unit ini" : "Pilih tujuan terlebih dahulu"}
              </option>
            )}
          </select>
        </div>

        {/* Keperluan */}
        <div>
          <label className="block font-semibold">Keperluan</label>
          <input
            type="text"
            name="keperluan"
            value={formData.keperluan}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Sisanya tetap sama */}
        {/* Kartu Identitas */}
        <div>
          <label className="block font-semibold">Kartu Identitas</label>
          <select
            name="kartu_identitas"
            value={formData.kartu_identitas}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          >
            <option value="">-- Pilih Jenis Identitas --</option>
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

        {/* Nomor Identitas */}
        <div>
          <label className="block font-semibold">Nomor Identitas</label>
          <input
            type="text"
            name="nomor_identitas"
            value={formData.nomor_identitas}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="block font-semibold">Nomor Telepon</label>
          <input
            type="text"
            name="nomor_telepon"
            value={formData.nomor_telepon}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block font-semibold">Status</label>
          <select
            name="status"
            value={formData.status || "Pending"}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          >
            <option value="Pending">Pending</option>
            <option value="Selesai">Selesai</option>
            <option value="Batal">Batal</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default EditFormSubmission;