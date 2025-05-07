<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DataController extends Controller
{

    // Fungsi untuk menghapus data berdasarkan created_at
    public function destroyByCreatedAt(Request $request)
    {
        // Ambil tanggal created_at dari request
        $created_at = $request->input('created_at');

        // Validasi jika created_at tidak dikirim
        if (!$created_at) {
            return response()->json(['message' => 'Tanggal created_at diperlukan'], 400);
        }

        // Daftar tabel yang akan diperiksa
        $tables = ['gurus','hubins','kepseks','kesiswaans','keuangan_administrasis','kurikulums','perf_q_m_rs','ppdbs','sarpras']; // Sesuaikan nama tabel

        // Looping untuk mencari dan menghapus data dari tabel yang memiliki created_at
        foreach ($tables as $table) {
            $deleted = DB::table($table)->where('created_at', $created_at)->delete();

            // Jika data ditemukan dan dihapus, kembalikan response sukses
            if ($deleted) {
                return response()->json([
                    'message' => "Data dengan created_at $created_at berhasil dihapus dari tabel $table"
                ], 200);
            }
        }

        // Jika tidak ditemukan di tabel mana pun, kembalikan response 404
        return response()->json(['message' => 'Data tidak ditemukan di tabel mana pun'], 404);
    }

    // Fungsi untuk mengupdate status berdasarkan ID
    public function updateStatus(Request $request)
    {
        // Ambil data dari request
        $id = $request->input('id');
        $new_status = $request->input('status');

        // Validasi input
        if (!$id || !$new_status) {
            return response()->json(['message' => 'ID dan status diperlukan'], 400);
        }

        // Daftar tabel yang mungkin berisi data
        $tables = ['gurus','hubins','kepseks','kesiswaans','keuangan_administrasis','kurikulums','perf_q_m_rs','ppdbs','sarpras']; // Sesuaikan nama tabel

        // Looping untuk mencari dan mengupdate status
        foreach ($tables as $table) {
            $updated = DB::table($table)
                ->where('id', $id)
                ->update(['status' => $new_status]);

            if ($updated) {
                return response()->json([
                    'message' => "Status berhasil diperbarui di tabel $table"
                ], 200);
            }
        }

        return response()->json(['message' => 'Data tidak ditemukan di tabel mana pun'], 404);
    }
    
    /**
     * Hapus data yang lebih dari X hari
     */
    public function deleteOldData(Request $request)
    {
        // Default 30 hari jika tidak ada input
        $days = $request->input('days', 30);
        $date = Carbon::now()->subDays($days);
        
        $deletedCount = 0;
        
        // Daftar tabel yang akan diperiksa
        $tables = ['gurus','hubins','kepseks','kesiswaans','keuangan_administrasis','kurikulums','perf_q_m_rs','ppdbs','sarpras'];
        
        // Looping untuk menghapus data lama dari semua tabel
        foreach ($tables as $table) {
            $deleted = DB::table($table)->where('created_at', '<', $date)->delete();
            $deletedCount += $deleted;
        }
        
        return response()->json([
            'success' => true,
            'deleted' => $deletedCount,
            'message' => "Berhasil menghapus $deletedCount data yang lebih dari $days hari"
        ]);
    }
}
