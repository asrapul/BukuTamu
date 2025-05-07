<?php

namespace App\Http\Controllers;

use App\Models\Kurikulum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class KurikulumsController extends Controller
{
    public function index()
    {
        $staf = Kurikulum::all();
        return response()->json($staf);
    }

    // GANTI "post" MENJADI "store"
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nama_tamu' => 'required|string',
                'instansi' => 'required|string',
                'tujuan' => 'required|in:Kepala Sekolah,Perf. QMR,Keuangan / Administrasi,Kurikulum,Kesiswaan,Sarpra (Sarana dan Prasarana),Hubin (Hubungan Industri),PPDB (Penerimaan Peserta Didik Baru),Guru',
                'nama_yang_dikunjungi' => ['required', 'string'],
                'keperluan' => 'required|string',
                'kartu_identitas' => 'required|in:KTP (Kartu Tanda Penduduk),NPWP (Nomor Pokok Wajib Pajak),ID Pegawai / Karyawan',
                'nomor_identitas' => 'required|string|min:10|max:20',
                'nomor_telepon' => 'required|string|min:10|max:15',
            ]);

            $staf = Kurikulum::create($validatedData);

            // Simpan file JSON di folder `storage/app/daftarstaf/`
            $fileName = '/daftarstaf' . time() . '.json';
            Storage::put('daftarstaf/' . $fileName, json_encode($validatedData, JSON_PRETTY_PRINT));

            return response()->json([
                'message' => 'Data berhasil disimpan!',
                'data' => $staf,
                'file' => $fileName,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan data:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $kurikulum = Kurikulum::findOrFail($id);
        $kurikulum->status = $request->status;
        $kurikulum->save();

        return response()->json(['message' => 'Status kepsek berhasil diperbarui'], 200);
    }

    public function show($id)
    {
        $kurikulum = Kurikulum::find($id);

        if ($kurikulum) {
            // Sembunyikan created_at dan updated_at
            $kurikulum->makeHidden(['created_at', 'updated_at', 'id', 'status', 'tujuan','read']);
            return response()->json($kurikulum);
        }

        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }
}

