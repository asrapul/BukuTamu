'use client';
import React, { useState, useEffect } from 'react'
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import Image from 'next/image'
import Link from 'next/link';
import Swal from "sweetalert2";
import axios from "axios";

// Interface untuk data guru dari API
interface GuruData {
  id?: number;
  nama: string;
  unit: string;
  telegram_id?: string;
  kehadiran?: string; // Tambahkan properti kehadiran
  alasan_ketidakhadiran?: string; // Tambahkan properti alasan ketidakhadiran
}

// Interface untuk guru yang dikelompokkan berdasarkan unit
interface GuruPerUnit {
  [unit: string]: GuruData[];
}

// Interface untuk kehadiran guru
interface Teacher {
  id: number;
  name: string;
  status: 'present' | 'permission' | 'sick' | null;
  reason: string;
  sickSubmitted?: boolean;
  permissionSubmitted?: boolean;
  unit?: string; // Tambahkan unit untuk mapping dengan data API
  statusLastUpdated?: string; // Timestamp ketika status terakhir diubah
}

// Tambahkan fungsi ini untuk membantu debugging API
const debugApiStatus = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/guru-telegram-ids');
    console.table(response.data.map((guru: GuruData) => ({
      id: guru.id,
      nama: guru.nama,
      kehadiran: guru.kehadiran || 'hadir',
      alasan: guru.alasan_ketidakhadiran || '-'
    })));
    return response.data;
  } catch (error) {
    console.error('Failed to fetch API status for debugging:', error);
    return [];
  }
};

const verifyApiUpdate = async (teacherId: number, expectedStatus: string) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/guru-telegram-ids/${teacherId}`);
    const data = response.data;
    
    if (data.kehadiran !== expectedStatus) {
      console.warn(`API tidak terupdate dengan benar. Harapan: ${expectedStatus}, Aktual: ${data.kehadiran}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Gagal memverifikasi status API:', error);
    return false;
  }
};

const verifyApiStatus = async (teacherId: number) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/guru-telegram-ids/${teacherId}`);
    const data = response.data;
    console.log("Status guru di API:", {
      id: data.id,
      nama: data.nama,
      kehadiran: data.kehadiran,
      alasan: data.alasan_ketidakhadiran
    });
    return data;
  } catch (error) {
    console.error("Gagal memeriksa status API:", error);
    return null;
  }
};

// Fungsi untuk testing endpoint updateKehadiran
const testUpdateKehadiran = async (id: number) => {
  try {
    const testData = {
      kehadiran: 'sakit',
      alasan_ketidakhadiran: 'Test update kehadiran'
    };
    
    console.log('Testing updateKehadiran endpoint with:', testData);
    
    const response = await axios.put(
      `http://127.0.0.1:8000/api/guru-telegram-ids/${id}/kehadiran`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Test response:', response.data);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Panggil fungsi ini untuk testing di useEffect atau fungsi lain
// testUpdateKehadiran(1);

function Page() {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 1, name: 'MUHAMMAD SAAD, S.Pd., M.P.d.', status: 'present', reason: '', unit: 'Kepala Sekolah' }
  ]);

  // State untuk data guru dari API
  const [guruData, setGuruData] = useState<GuruData[]>([]);
  const [guruPerUnit, setGuruPerUnit] = useState<GuruPerUnit>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data guru dan staf dari API
  const fetchGuruData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/guru-telegram-ids");
      console.log("Data guru dari API:", response.data);
      
      // Simpan data mentah
      setGuruData(response.data);
      
      // Kelompokkan guru berdasarkan unit
      const groupedGuru: GuruPerUnit = {};
      
      response.data.forEach((guru: GuruData) => {
        // Pastikan unit ada
        if (!guru.unit) return;
        
        // Inisialisasi array jika unit belum ada
        if (!groupedGuru[guru.unit]) {
          groupedGuru[guru.unit] = [];
        }
        
        // Tambahkan guru ke unit
        groupedGuru[guru.unit].push(guru);
      });
      
      console.log("Data guru yang dikelompokkan:", groupedGuru);
      setGuruPerUnit(groupedGuru);
      
      // Convert API data to Teacher format dengan status kehadiran dari API
      const teachersFromAPI: Teacher[] = response.data.map((guru: GuruData & {kehadiran?: string, alasan_ketidakhadiran?: string}, index: number) => {
        // Konversi status kehadiran dari API ke format internal
        let status: 'present' | 'permission' | 'sick' | null = 'present';
        if (guru.kehadiran === 'sakit') status = 'sick';
        else if (guru.kehadiran === 'izin') status = 'permission';
        else if (guru.kehadiran === 'hadir' || !guru.kehadiran) status = 'present';
        
        return {
          id: guru.id || index + 1,
          name: guru.nama,
          status: status,
          reason: guru.alasan_ketidakhadiran || '',
          unit: guru.unit,
          sickSubmitted: status === 'sick', // Jika status dari API adalah sakit, tandai sebagai sudah disubmit
          permissionSubmitted: status === 'permission' // Jika status dari API adalah izin, tandai sebagai sudah disubmit
        };
      });
      
      setTeachers(teachersFromAPI);
      setError(null);
    } catch (err) {
      console.error("Error fetching guru data:", err);
      setError("Gagal mengambil data guru dan staf. Mohon periksa koneksi dan coba lagi.");
      
      // Show error alert
      Swal.fire({
        title: 'Error',
        text: 'Gagal memuat data guru dan staf',
        icon: 'error',
        confirmButtonColor: '#BA272D',
      });
    } finally {
      setLoading(false);
    }
  };

  // Ambil data dari database dan API saat komponen mount
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        // Fetch data from local database first
        const res = await fetch('/api/keterangan'); 
        const localData = await res.json();
        
        // Now get data from API
        await fetchGuruData();
        
        // If we have local data with attendance info, merge it with API data
        if (localData && localData.length > 0) {
          setTeachers(prevTeachers => {
            return prevTeachers.map(teacher => {
              const localTeacher = localData.find((local: Teacher) => 
                local.name.toLowerCase() === teacher.name.toLowerCase()
              );
              
              return localTeacher ? {
                ...teacher,
                status: localTeacher.status,
                reason: localTeacher.reason,
                sickSubmitted: localTeacher.sickSubmitted,
                permissionSubmitted: localTeacher.permissionSubmitted,
                statusLastUpdated: localTeacher.statusLastUpdated
              } : teacher;
            });
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
        setError("Terjadi kesalahan dalam memuat data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherData();
    
    // Gunakan setTimeout recursive daripada setInterval untuk mencegah overlapping calls
    let timer: NodeJS.Timeout;
    
    const scheduleNextUpdate = () => {
      timer = setTimeout(async () => {
        await setAllTeachersPresent();
        scheduleNextUpdate(); // Schedule next update after current one completes
      }, 60000); // 60000 ms = 1 menit
    };
    
    scheduleNextUpdate(); // Start the cycle
    
    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Perbaikan fungsi updateTeacherStatus
const updateTeacherStatus = async (teacherId: number, status: 'present' | 'permission' | 'sick', reason: string = '') => {
  try {
    const currentTimestamp = new Date().toISOString();
    
    // Update state lokal terlebih dahulu agar UI responsif
    setTeachers(prevTeachers => 
      prevTeachers.map(teacher => 
        teacher.id === teacherId 
          ? { 
              ...teacher, 
              status,
              reason,
              statusLastUpdated: currentTimestamp,
              sickSubmitted: status === 'sick' ? true : teacher.sickSubmitted,
              permissionSubmitted: status === 'permission' ? true : teacher.permissionSubmitted
            }
          : teacher
      )
    );
    
    // Update status di database lokal
    try {
      const response = await fetch(`/api/keterangan/${teacherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          reason,
          statusLastUpdated: currentTimestamp
        }),
      });
      
      if (!response.ok) {
        console.error('Gagal update status di database lokal:', await response.text());
      }
    } catch (localError) {
      console.error('Error updating local database:', localError);
      // Lanjutkan proses meskipun database lokal gagal
    }
    
    // Update status ke API eksternal
    try {
      await updateTeacherStatusToAPI(teacherId, status, reason);
    } catch (apiError) {
      console.error('Gagal mengupdate API eksternal:', apiError);
      // Tidak menggagalkan proses keseluruhan jika API eksternal gagal
    }
    
    // Ambil data terbaru setelah update - opsional, karena state sudah diupdate sebelumnya
    try {
      const res = await fetch('/api/keterangan');
      const data = await res.json();
      if (data && data.length > 0) {
        setTeachers(prevTeachers => {
          return prevTeachers.map(teacher => {
            const updatedTeacher = data.find((t: Teacher) => t.id === teacher.id);
            return updatedTeacher ? { ...teacher, ...updatedTeacher } : teacher;
          });
        });
      }
    } catch (fetchError) {
      console.error('Error fetching updated data:', fetchError);
      // Tidak menggagalkan proses karena state sudah diupdate sebelumnya
    }
    
    // Return success karena state lokal sudah diupdate
    return true;
  } catch (error) {
    console.error('Gagal update status:', error);
    throw error;
  }
};

  // Perbaikan fungsi updateTeacherStatusToAPI
const updateTeacherStatusToAPI = async (teacherId: number, status: 'present' | 'permission' | 'sick', reason: string = '') => {
  try {
    // Konversi status internal ke format API
    const kehadiran = status === 'present' ? 'hadir' : 
                     status === 'permission' ? 'izin' : 
                     status === 'sick' ? 'sakit' : 'hadir';
    
    // Siapkan data untuk API - sesuai dengan format yang dibutuhkan updateKehadiran
    const apiData = {
      kehadiran: kehadiran,
      alasan_ketidakhadiran: status === 'permission' ? reason : ''
    };

    console.log('Mengirim data ke API:', apiData);
    
    // Gunakan endpoint /api/guru-telegram-ids/{id}/kehadiran, bukan /api/guru-telegram-ids/{id}
    const response = await axios.put(
      `http://127.0.0.1:8000/api/guru-telegram-ids/${teacherId}/kehadiran`,
      apiData,
      { 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Status API response:', response.status);
    console.log('Data API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Gagal mengupdate status di API:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
    
    Swal.fire({
      title: 'Peringatan',
      text: 'Gagal menyinkronkan dengan API, data hanya tersimpan lokal',
      icon: 'warning',
      toast: true,
      position: 'bottom-end',
      timer: 3000,
      showConfirmButton: false
    });
    
    return null;
  }
};

const updateTeacherStatusToAPIFull = async (teacherId: number, status: 'present' | 'permission' | 'sick', reason: string = '') => {
  try {
    // Ambil data lengkap guru dari API terlebih dahulu
    const getResponse = await axios.get(`http://127.0.0.1:8000/api/guru-telegram-ids/${teacherId}`);
    const guruData = getResponse.data;
    
    // Konversi status internal ke format API
    const kehadiran = status === 'present' ? 'hadir' : 
                     status === 'permission' ? 'izin' : 
                     status === 'sick' ? 'sakit' : 'hadir';
    
    // Siapkan data lengkap untuk API
    const apiData = {
      nama: guruData.nama,
      telegram_id: guruData.telegram_id,
      unit: guruData.unit,
      kehadiran: kehadiran,
      alasan_ketidakhadiran: status === 'permission' ? reason : ''
    };

    console.log('Mengirim data lengkap ke API:', apiData);
    
    // Update lengkap
    const response = await axios.put(
      `http://127.0.0.1:8000/api/guru-telegram-ids/${teacherId}`,
      apiData,
      { 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Status API response:', response.status);
    console.log('Data API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Gagal mengupdate status di API:', error);
    // error handling
    return null;
  }
};

async function updateWithRetry(teacherId, status, reason, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await updateTeacherStatusToAPI(teacherId, status, reason);
      if (result) return result;
    } catch (err) {
      console.log(`Attempt ${i+1} failed, retrying...`);
    }
  }
  return null;
}

  const handleStatusChange = (teacherId: number, status: 'present' | 'permission' | 'sick') => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher =>
        teacher.id === teacherId
          ? {
              ...teacher,
              status: status,
              reason: status !== 'permission' ? '' : teacher.reason,
              sickSubmitted: status === 'sick' ? false : undefined,
              permissionSubmitted: status === 'permission' ? false : undefined
            }
          : teacher
      )
    );
    
    // Jangan update database di sini, tunggu sampai user klik submit
  };

  const handleReasonChange = (teacherId: number, reason: string) => {
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher =>
        teacher.id === teacherId
          ? { ...teacher, reason }
          : teacher
      )
    );
    // Jangan update database di sini, tunggu sampai user klik submit
  };

const handleSickSubmit = async (teacherId: number) => {
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) return;
  
  const result = await Swal.fire({
    title: 'Konfirmasi',
    text: `Apakah Anda yakin ${teacher.name} sakit?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#BA272D',
    cancelButtonText: 'Batal',
    confirmButtonText: 'Ya, Submit'
  });
  
  if (result.isConfirmed) {
    try {
      Swal.fire({
        title: 'Memproses...',
        text: 'Sedang menyimpan data sakit',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Update state lokal
      setTeachers(prevTeachers =>
        prevTeachers.map(t =>
          t.id === teacherId
            ? { 
                ...t, 
                status: 'sick',
                sickSubmitted: true,
                statusLastUpdated: new Date().toISOString()
              }
            : t
        )
      );
      
      // Update database lokal
      await fetch(`/api/keterangan/${teacherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'sick',
          reason: '',
          statusLastUpdated: new Date().toISOString()
        }),
      });
      
      // Update API eksternal dan simpan responsenya
      const apiResponse = await updateTeacherStatusToAPI(teacherId, 'sick', '');
      const apiUpdateSuccess = !!apiResponse;
      
      // Verifikasi bahwa API diupdate dengan benar
      let verificationSuccess = false;
      if (apiUpdateSuccess) {
        try {
          const verifyResponse = await axios.get(`http://127.0.0.1:8000/api/guru-telegram-ids/${teacherId}`);
          verificationSuccess = verifyResponse.data.kehadiran === 'sakit';
          if (!verificationSuccess) {
            console.warn('API tidak terupdate dengan benar:', verifyResponse.data);
          }
        } catch (verifyError) {
          console.error('Error verifying update:', verifyError);
        }
      }
      
      Swal.fire({
        icon: apiUpdateSuccess ? 'success' : 'warning',
        title: apiUpdateSuccess ? 'Berhasil!' : 'Perhatian',
        text: apiUpdateSuccess 
          ? 'Status sakit berhasil disimpan di lokal dan API' 
          : 'Status sakit berhasil disimpan di lokal tetapi gagal di API',
        confirmButtonColor: '#BA272D',
        timer: apiUpdateSuccess ? 2000 : 3000,
        showConfirmButton: !apiUpdateSuccess
      });
      
    } catch (error) {
      console.error('Error submitting sick status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan status sakit.',
        confirmButtonColor: '#BA272D',
      });
    }
  }
};

const handlePermissionSubmit = async (teacherId: number) => {
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) return;
  
  if (!teacher.reason) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: 'Alasan izin harus diisi',
      confirmButtonColor: '#BA272D',
    });
    return;
  }
  
  const result = await Swal.fire({
    title: 'Konfirmasi',
    text: `Apakah Anda yakin ${teacher.name} izin dengan alasan: ${teacher.reason}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#BA272D',
    cancelButtonText: 'Batal',
    confirmButtonText: 'Ya, Submit'
  });
  
  if (result.isConfirmed) {
    try {
      Swal.fire({
        title: 'Memproses...',
        text: 'Sedang menyimpan data izin',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Update state lokal
      setTeachers(prevTeachers =>
        prevTeachers.map(t =>
          t.id === teacherId
            ? { 
                ...t, 
                status: 'permission',
                permissionSubmitted: true,
                statusLastUpdated: new Date().toISOString()
              }
            : t
        )
      );
      
      // Update database lokal dan API
      await fetch(`/api/keterangan/${teacherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'permission',
          reason: teacher.reason,
          statusLastUpdated: new Date().toISOString()
        }),
      });
      
      // Update API eksternal - pastikan alasan terkirim
      await updateTeacherStatusToAPI(teacherId, 'permission', teacher.reason);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Status izin berhasil disimpan',
        confirmButtonColor: '#BA272D',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Error submitting permission status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Status izin gagal disubmit. Silakan coba lagi.',
        confirmButtonColor: '#BA272D',
      });
    }
  }
};

const handlePresentSubmit = async (teacherId: number) => {
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) return;
  
  const result = await Swal.fire({
    title: 'Konfirmasi',
    text: `Apakah Anda yakin ${teacher.name} hadir?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4CAF50', // Warna hijau untuk status hadir
    cancelButtonText: 'Batal',
    confirmButtonText: 'Ya, Submit'
  });
  
  if (result.isConfirmed) {
    try {
      Swal.fire({
        title: 'Memproses...',
        text: 'Sedang menyimpan status hadir',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Update state lokal
      setTeachers(prevTeachers =>
        prevTeachers.map(t =>
          t.id === teacherId
            ? { 
                ...t, 
                status: 'present',
                sickSubmitted: undefined,
                permissionSubmitted: undefined,
                statusLastUpdated: new Date().toISOString()
              }
            : t
        )
      );
      
      // Update database lokal
      await fetch(`/api/keterangan/${teacherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'present',
          reason: '',
          statusLastUpdated: new Date().toISOString()
        }),
      });
      
      // Update API eksternal
      const apiResponse = await updateTeacherStatusToAPI(teacherId, 'present', '');
      const apiUpdateSuccess = !!apiResponse;
      
      Swal.fire({
        icon: apiUpdateSuccess ? 'success' : 'warning',
        title: apiUpdateSuccess ? 'Berhasil!' : 'Perhatian',
        text: apiUpdateSuccess 
          ? 'Status hadir berhasil disimpan di lokal dan API' 
          : 'Status hadir berhasil disimpan di lokal tetapi gagal di API',
        confirmButtonColor: '#4CAF50',
        timer: apiUpdateSuccess ? 2000 : 3000,
        showConfirmButton: !apiUpdateSuccess
      });
      
    } catch (error) {
      console.error('Error submitting present status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan status hadir.',
        confirmButtonColor: '#BA272D',
      });
    }
  }
};

// Fungsi untuk otomatis mengatur semua guru hadir tanpa konfirmasi
const setAllTeachersPresent = async () => {
  try {
    console.log('Otomatis mengatur semua guru hadir pada:', new Date().toLocaleTimeString());
    
    // Update state lokal terlebih dahulu untuk responsivitas UI
    setTeachers(prevTeachers =>
      prevTeachers.map(teacher => ({
        ...teacher,
        status: 'present',
        reason: '',
        sickSubmitted: undefined,
        permissionSubmitted: undefined,
        statusLastUpdated: new Date().toISOString()
      }))
    );

    // Update API eksternal dengan await Promise.all untuk menunggu semua request selesai
    const teacherIds = teachers.map(teacher => teacher.id);
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/guru-telegram-ids/bulk-update-kehadiran`,
        { teachers: teacherIds, kehadiran: 'hadir' }
      );
    } catch (error) {
      // error handling
    }
    
    // Update database lokal
    try {
      const response = await fetch('/api/keterangan/set-all-present', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString() // Mengirim timestamp untuk tracking
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update local API: ${response.status}`);
      }
      
      console.log('API lokal berhasil diupdate: Semua guru hadir');
    } catch (dbError) {
      console.error('Error updating local database:', dbError);
    }
    
    // Verifikasi status di API eksternal (opsional, untuk logging)
    try {
      const verifyResponse = await axios.get('http://127.0.0.1:8000/api/guru-telegram-ids');
      const notPresentCount = verifyResponse.data.filter(
        (guru: any) => guru.kehadiran !== 'hadir'
      ).length;
      
      if (notPresentCount > 0) {
        console.warn(`${notPresentCount} guru masih belum berstatus 'hadir' di API eksternal`);
      } else {
        console.log('Verifikasi berhasil: Semua guru berstatus hadir di API eksternal');
      }
    } catch (verifyError) {
      console.error('Error verifying API status:', verifyError);
    }
    
    console.log('Semua guru berhasil diatur hadir secara otomatis');
  } catch (error) {
    console.error('Error dalam pembaruan status hadir otomatis:', error);
  }

  // Periksa status setelah update massal
  const verifyResponse = await axios.get('http://127.0.0.1:8000/api/guru-telegram-ids');
  const stillNotPresent = verifyResponse.data.filter(g => g.kehadiran !== 'hadir');

  // Coba update lagi hanya untuk yang gagal
  if (stillNotPresent.length > 0) {
    for (const guru of stillNotPresent) {
      await updateTeacherStatusToAPI(guru.id, 'present', '');
    }
  }
};

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (teacher.unit && teacher.unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group teachers by unit for display
  const teachersByUnit: {[unit: string]: Teacher[]} = {};
  filteredTeachers.forEach(teacher => {
    const unit = teacher.unit || 'Lainnya';
    if (!teachersByUnit[unit]) {
      teachersByUnit[unit] = [];
    }
    teachersByUnit[unit].push(teacher);
  });

  // Tambahkan fungsi ini di dalam komponen Page untuk melihat respon API
  const debugGuruEndpoint = async (id: number) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/guru-telegram-ids/${id}`);
      console.log(`Data guru ID ${id} dari API:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching guru ID ${id}:`, error);
      return null;
    }
  };

  return (
    <div className='bg-[#EBEAF2] min-h-screen'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex justify-between items-center mb-8'>
          <Link href='/login2'>
            <div className='flex items-center hover:text-[#9C0006] transition-colors'>
              <MdOutlineKeyboardArrowLeft className='text-2xl' />
              <span className='text-lg font-semibold'>Info Kehadiran Guru</span>
            </div>
          </Link>
          <div className='flex items-center'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Cari guru...'
                className='px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#BA272D] focus:border-transparent w-64'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className='flex items-center ml-5 text-gray-700'>
              <FaRegUserCircle className='text-2xl' />
            </div>
          </div>
        </div>

        {/* Unit Navigation */}
        <div className='mt-10 flex flex-wrap justify-start gap-6 mb-4 overflow-x-auto pb-2'>
          {Object.keys(guruPerUnit).length > 0 ? (
            Object.keys(guruPerUnit).map((unit, idx) => {
              const isActive = searchTerm === unit;
              return (
                <button
                  key={idx}
                  onClick={() => setSearchTerm(isActive ? '' : unit)}
                  className={`px-[14px] py-2 font-medium rounded-full text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "hover:text-red-600"
                  }`}
                >
                  {unit}
                </button>
              );
            })
          ) : (
            <>
              {["Kepala Sekolah", "Perf. QMR", "Keuangan / Administrasi", "Kurikulum", "Kesiswaan", "Sarpra", "Hubin", "PPDB", "Guru"].map((label, idx) => (
                <button
                  key={idx}
                  className={`px-[14px] py-2 font-medium rounded-full text-sm mx-1 ${
                    label === "Kepala Sekolah" ? "bg-red-600 text-white" : "hover:text-red-600"
                  }`}
                  disabled={label === "Kepala Sekolah"}
                >
                  {label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Display loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
          </div>
        )}

        {/* Display error message */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={fetchGuruData}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Tambahkan setelah bagian error message */}
        {!loading && !error && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <div>
              <strong className="font-bold">Mode Otomatis Aktif!</strong>
              <span className="block sm:inline ml-1">
                Sistem akan mengatur semua guru hadir secara otomatis setiap menit.
              </span>
            </div>
            <div className="animate-pulse">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        )}

        {/* Display data by unit */}
        {!loading && !error && Object.entries(teachersByUnit).map(([unit, unitTeachers]) => (
          <div key={unit} className='bg-white rounded-xl shadow-md p-8 mb-10'>
            <div className='flex justify-between items-center mb-8'>
              <h2 className='text-2xl font-bold text-gray-800'>
                Daftar Kehadiran - {unit}
              </h2>
              <div className='flex items-center'>
                <div className='flex space-x-4 items-center ml-4'>
                  <div className='flex items-center'>
                    <div className='w-3 h-3 rounded-full bg-green-500 mr-2'></div>
                    <span className='text-sm text-gray-600'>Hadir</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-3 h-3 rounded-full bg-blue-500 mr-2'></div>
                    <span className='text-sm text-gray-600'>Izin</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-3 h-3 rounded-full bg-red-500 mr-2'></div>
                    <span className='text-sm text-gray-600'>Sakit</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              {unitTeachers.map((teacher) => (
                <div key={teacher.id} className='border-b border-gray-200 pb-6'>
                  <div className='flex justify-between items-center'>
                    <div className='font-medium text-lg'>
                      {teacher.name}
                      {teacher.status === 'sick' && (
                        <span className='ml-2 text-sm text-red-500 bg-red-100 px-3 py-1 rounded-full'>
                          Sakit {teacher.sickSubmitted ? '(Tersimpan)' : ''}
                        </span>
                      )}
                      {teacher.status === 'permission' && (
                        <span className='ml-2 text-sm text-blue-500 bg-blue-100 px-3 py-1 rounded-full'>
                          Izin {teacher.permissionSubmitted ? '(Tersimpan)' : ''}
                        </span>
                      )}
                      {teacher.status === 'present' && teacher.statusLastUpdated && (
                        <span className='ml-2 text-sm text-green-500 bg-green-100 px-3 py-1 rounded-full'>
                          Hadir (Tersimpan)
                        </span>
                      )}
                    </div>
                    <div className='flex space-x-6 items-center'>
                      <label className='flex items-center cursor-pointer'>
                        <input
                          type='radio'
                          name={`status-${teacher.id}`}
                          checked={teacher.status === 'present'}
                          onChange={() => handleStatusChange(teacher.id, 'present')}
                          className='mr-2 h-4 w-4 text-green-600 focus:ring-green-500'
                        />
                        <span className='text-green-600 font-medium'>Hadir</span>
                      </label>

                      <label className='flex items-center cursor-pointer'>
                        <input
                          type='radio'
                          name={`status-${teacher.id}`}
                          checked={teacher.status === 'permission'}
                          onChange={() => handleStatusChange(teacher.id, 'permission')}
                          className='mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='text-blue-600 font-medium'>Izin</span>
                      </label>

                      <label className='flex items-center cursor-pointer'>
                        <input
                          type='radio'
                          name={`status-${teacher.id}`}
                          checked={teacher.status === 'sick'}
                          onChange={() => handleStatusChange(teacher.id, 'sick')}
                          className='mr-2 h-4 w-4 text-red-600 focus:ring-red-500'
                        />
                        <span className='text-red-600 font-medium'>Sakit</span>
                      </label>

                      {teacher.status === 'present' && !teacher.statusLastUpdated && (
                        <button
                          onClick={() => handlePresentSubmit(teacher.id)}
                          className='ml-4 px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                        >
                          Submit
                        </button>
                      )}

                      {teacher.status === 'sick' && !teacher.sickSubmitted && (
                        <button
                          onClick={() => handleSickSubmit(teacher.id)}
                          className='ml-4 px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                        >
                          Submit
                        </button>
                      )}

                      {teacher.status === 'permission' && !teacher.permissionSubmitted && teacher.reason && (
                        <button
                          onClick={() => handlePermissionSubmit(teacher.id)}
                          className='ml-4 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>

                  {teacher.status === 'permission' && (
                    <div className='mt-4 ml-0'>
                      <input
                        type='text'
                        placeholder='Alasan izin...'
                        value={teacher.reason}
                        onChange={(e) => handleReasonChange(teacher.id, e.target.value)}
                        className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </div>
                  )}

                  {teacher.status !== 'present' && teacher.statusLastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                      Diperbarui: {new Date(teacher.statusLastUpdated).toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* If no data after search */}
        {!loading && !error && Object.keys(teachersByUnit).length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-10 text-center">
            <p className="text-gray-500 text-lg">Tidak ada data guru yang sesuai dengan pencarian.</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Hapus filter pencarian
              </button>
            )}
          </div>
        )}

        {/* Button to refresh API data */}
        <div className="flex justify-center mb-10">
          <button 
            onClick={fetchGuruData}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Segarkan Data Guru
          </button>
        </div>
      </div>
    </div>
  )
}

export default Page;
