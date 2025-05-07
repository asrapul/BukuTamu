<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TamuController extends Controller
{
    private $unitMap = [
        'guru' => 'gurus',
        'hubin' => 'hubins',
        'kepsek' => 'kepseks',
        'kesiswaan' => 'kesiswaans',
        'keuangan' => 'keuangan_administrasis',
        'kurikulum' => 'kurikulums',
        'perfqmrs' => 'perf_q_m_rs',
        'ppdb' => 'ppdbs',
        'sarpras' => 'sarpras'
    ];

    private $unitDisplay = [
        'guru' => 'Guru',
        'hubin' => 'Hubin',
        'kepsek' => 'Kepala Sekolah',
        'kesiswaan' => 'Kesiswaan',
        'keuangan' => 'Keuangan / Administrasi',
        'kurikulum' => 'Kurikulum',
        'perfqmrs' => 'Perf. QMR',
        'ppdb' => 'PPDB',
        'sarpras' => 'Sarpras'
    ];

    private $unitAlias = [
        'keuangan / administrasi' => 'keuangan',
        'keuangan/administrasi' => 'keuangan',
        'kurikulum & evaluasi' => 'kurikulum',
        'kurikulum dan evaluasi' => 'kurikulum',
        'hubin (hubungan industri)' => 'hubin',
        'hubin / humas' => 'hubin',
        'hubin/humas' => 'hubin',
        'kepala sekolah' => 'kepsek',
        'perf. qmr' => 'perfqmrs',
        'perf qmr' => 'perfqmrs',
        'sarana & prasarana' => 'sarpras',
        'sarpra (sarana dan prasarana)' => 'sarpras',
        'sarpras (sarana dan prasarana)' => 'sarpras',
        'sarpras' => 'sarpras',
        'ppdb (penerimaan peserta didik baru)' => 'ppdb',
        'ppdb(penerimaan peserta didik baru)' => 'ppdb',
    ];

    private function normalizeUnit($unit)
    {
        // Jika unit kosong, kembalikan string kosong
        if (empty($unit)) {
            return '';
        }
        
        $normalized = strtolower(trim($unit));
        
        // Coba cari di unitAlias dulu
        if (isset($this->unitAlias[$normalized])) {
            return $this->unitAlias[$normalized];
        }
        
        // Jika tidak ditemukan, coba ekstrak bagian sebelum tanda kurung
        if (strpos($normalized, '(') !== false) {
            $mainPart = trim(substr($normalized, 0, strpos($normalized, '(')));
            if (isset($this->unitAlias[$mainPart])) {
                return $this->unitAlias[$mainPart];
            }
        }
        
        // Tambahkan log untuk debugging
        Log::info('Unit tidak ditemukan dalam alias: ' . $normalized);
        
        // Jika masih tidak ditemukan, hapus semua karakter non-alfanumerik
        return preg_replace('/[^a-z0-9]/', '', $normalized);
    }

    private function getDisplayName($unit)
    {
        return $this->unitDisplay[$unit] ?? ucfirst($unit);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_tamu' => 'required',
            'instansi' => 'required',
            'nama_yang_dikunjungi' => 'required',
            'keperluan' => 'required',
            'kartu_identitas' => 'required',
            'nomor_identitas' => 'required',
            'nomor_telepon' => 'required',
            'unit' => 'required',
            'created_at' => 'required',
        ]);

        $unit = $this->normalizeUnit($request->input('unit'));

        if (!array_key_exists($unit, $this->unitMap)) {
            return response()->json(['message' => 'Unit tujuan tidak valid.'], 400);
        }

        $tableTujuan = $this->unitMap[$unit];

        DB::table($tableTujuan)->insert([
            'nama_tamu' => $request->input('nama_tamu'),
            'instansi' => $request->input('instansi'),
            'nama_yang_dikunjungi' => $request->input('nama_yang_dikunjungi'),
            'keperluan' => $request->input('keperluan'),
            'kartu_identitas' => $request->input('kartu_identitas'),
            'nomor_telepon' => $request->input('nomor_telepon'),
            'tujuan' => $unit,
        ]);

        return response()->json(['message' => 'Data berhasil disimpan ke tabel: ' . $tableTujuan], 200);
    }

    public function updateAndMove(Request $request, $id)
    {
        $request->validate([
            'nama_tamu' => 'required',
            // Hapus validasi wajib untuk unit_baru dan nama_yang_dikunjungi
            // 'unit_baru' => 'required',
            // 'nama_yang_dikunjungi' => 'required',
        ], [
            'nama_tamu.required' => 'Nama tamu harus diisi.',
        ]);
    
        $dataLama = null;
        $tableAsal = null;
    
        // Cari data lama berdasarkan id
        foreach ($this->unitMap as $unit => $table) {
            $data = DB::table($table)->where('id', $id)->first();
            if ($data) {
                $dataLama = $data;
                $tableAsal = $table;
                break;
            }
        }
    
        if (!$dataLama) {
            return response()->json(['message' => 'Data tidak ditemukan di semua tabel unit.'], 404);
        }
    
        // Jika unit_baru tidak diisi, gunakan unit yang sama dengan data lama
        $unitBaru = $request->input('unit_baru') ? $this->normalizeUnit($request->input('unit_baru')) : $this->normalizeUnit($dataLama->tujuan);
    
        Log::info('Unit diterima (updateAndMove): ' . json_encode(['unit_baru' => $request->input('unit_baru'), 'unitBaru_normalized' => $unitBaru]));
    
        if (!array_key_exists($unitBaru, $this->unitMap)) {
            return response()->json(['message' => 'Unit tujuan tidak valid.'], 400);
        }
    
        $tableTujuan = $this->unitMap[$unitBaru];
    
        // Jika tabel tujuan sama dengan tabel asal, update data di tempat
        if ($tableTujuan === $tableAsal) {
            DB::beginTransaction();
            try {
                DB::table($tableAsal)->where('id', $id)->update([
                    'nama_tamu' => $request->input('nama_tamu', $dataLama->nama_tamu),
                    'instansi' => $request->input('instansi', $dataLama->instansi),
                    'nama_yang_dikunjungi' => $request->input('nama_yang_dikunjungi', $dataLama->nama_yang_dikunjungi),
                    'keperluan' => $request->input('keperluan', $dataLama->keperluan),
                    'kartu_identitas' => $request->input('kartu_identitas', $dataLama->kartu_identitas),
                    'nomor_identitas' => $request->input('nomor_identitas', $dataLama->nomor_identitas),
                    'nomor_telepon' => $request->input('nomor_telepon', $dataLama->nomor_telepon),
                    // Tujuan tetap sama
                ]);
                
                DB::commit();
                return response()->json(['message' => 'Data berhasil diperbarui.'], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error while updating data: ' . $e->getMessage());
                return response()->json(['message' => 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage()], 500);
            }
        }
    
        // Jika tabel tujuan berbeda, pindahkan data
        DB::beginTransaction();
    
        try {
            // Insert data ke table tujuan
            DB::table($tableTujuan)->insert([
                'nama_tamu' => $request->input('nama_tamu', $dataLama->nama_tamu),
                'instansi' => $request->input('instansi', $dataLama->instansi),
                'nama_yang_dikunjungi' => $request->input('nama_yang_dikunjungi', $dataLama->nama_yang_dikunjungi),
                'keperluan' => $request->input('keperluan', $dataLama->keperluan),
                'kartu_identitas' => $request->input('kartu_identitas', $dataLama->kartu_identitas),
                'nomor_identitas' => $request->input('nomor_identitas', $dataLama->nomor_identitas),
                'nomor_telepon' => $request->input('nomor_telepon', $dataLama->nomor_telepon),
                'tujuan' => $this->getDisplayName($unitBaru), // Gunakan display name
                'created_at' => $dataLama->created_at,
            ]);
    
            // Hapus data lama dari tabel asal
            DB::table($tableAsal)->where('id', $id)->delete();
    
            DB::commit();
    
            return response()->json(['message' => 'Data berhasil dipindahkan dari ' . $tableAsal . ' ke ' . $tableTujuan], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error while updating and moving data: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat memindahkan data: ' . $e->getMessage()], 500);
        }
    }

    public function getDataForEdit($id)
    {
        // Cari data lama berdasarkan id
        foreach ($this->unitMap as $unit => $table) {
            $data = DB::table($table)->where('id', $id)->first();
            if ($data) {
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'nama_tamu' => $data->nama_tamu,
                        'instansi' => $data->instansi,
                        'tujuan' => $data->tujuan,
                        'nama_yang_dikunjungi' => $data->nama_yang_dikunjungi,
                        'keperluan' => $data->keperluan,
                        'kartu_identitas' => $data->kartu_identitas,
                        'nomor_identitas' => $data->nomor_identitas,
                        'nomor_telepon' => $data->nomor_telepon,
                        'current_unit' => $unit
                    ]
                ]);
            }
        }
        
        return response()->json([
            'status' => 'error',
            'message' => 'Data tidak ditemukan'
        ], 404);
    }
}