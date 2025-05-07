<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StatusController extends Controller
{
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'source_table' => 'required|string',
            'status' => 'required|string',
        ]);

        $id = $validated['id'];
        $sourceTable = $validated['source_table'];
        $status = $validated['status'];

        // Daftar nama tabel yang diizinkan untuk update
        $allowedTables = [
            'kepseks',
            'perf_q_m_rs',
            'keuangan_administrasis',
            'kurikulums',
            'kesiswaans',
            'sarpras',
            'hubins',
            'ppdbs',
            'gurus',
        ];

        if (!in_array($sourceTable, $allowedTables)) {
            return response()->json(['error' => 'Tabel tidak valid'], 400);
        }
        try {
            $updated = DB::table($sourceTable)
                ->where('id', $id)
                ->update(['status' => $status]);

            if ($updated) {
                // Log aktivitas update
                Log::info("Status updated", [
                    'table' => $sourceTable,
                    'id' => $id,
                    'new_status' => $status,
                    'timestamp' => now()->toDateTimeString()
                ]);

                return response()->json(['message' => 'Status berhasil diperbarui'], 200);
            } else {
                Log::warning("Update failed or no changes", [
                    'table' => $sourceTable,
                    'id' => $id,
                    'attempted_status' => $status,
                    'timestamp' => now()->toDateTimeString()
                ]);

                return response()->json(['message' => 'ID tidak ditemukan atau status tidak berubah'], 404);
            }
        } catch (\Exception $e) {
            Log::error("Error updating status", [
                'error' => $e->getMessage(),
                'table' => $sourceTable,
                'id' => $id,
                'timestamp' => now()->toDateTimeString()
            ]);

            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }

    }
}
