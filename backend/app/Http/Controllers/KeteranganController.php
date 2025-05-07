<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KeteranganController extends Controller
{
    public function updateKeterangan(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'source_table' => 'required|string',
            'keterangan' => 'required|string',
        ]);

        $id = $validated['id'];
        $sourceTable = $validated['source_table'];
        $keterangan = $validated['keterangan']; 

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
                ->update(['keterangan' => $keterangan]);
        
            if ($updated) {
                // Log aktivitas update
                Log::info("Keterangan updated", [
                    'table' => $sourceTable,
                    'id' => $id,
                    'new_keterangan' => $keterangan,
                    'timestamp' => now()->toDateTimeString()
                ]);
        
                return response()->json(['message' => 'Keterangan berhasil diperbarui'], 200);
            } else {
                Log::warning("Update failed or no changes", [
                    'table' => $sourceTable,
                    'id' => $id,
                    'attempted_keterangan' => $keterangan,
                    'timestamp' => now()->toDateTimeString()
                ]);
        
                return response()->json(['message' => 'ID tidak ditemukan atau keterangan tidak berubah'], 404);
            }
        } catch (\Exception $e) {
            Log::error("Error updating keterangan", [
                'error' => $e->getMessage(),
                'table' => $sourceTable,
                'id' => $id,
                'timestamp' => now()->toDateTimeString()
            ]);
        
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
    
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'source_table' => 'required|string',
            'status' => 'required|string|in:present,permission,sick',
            'reason' => 'nullable|string',
        ]);

        $id = $validated['id'];
        $sourceTable = $validated['source_table'];
        $status = $validated['status'];
        $reason = $validated['reason'] ?? '';

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
            $data = ['status' => $status];
            
            // Tambahkan reason jika status adalah permission atau sick
            if ($status === 'permission' || $status === 'sick') {
                $data['reason'] = $reason;
            }
            
            $updated = DB::table($sourceTable)
                ->where('id', $id)
                ->update($data);
        
            if ($updated) {
                // Log aktivitas update
                Log::info("Status kehadiran updated", [
                    'table' => $sourceTable,
                    'id' => $id,
                    'new_status' => $status,
                    'reason' => $reason,
                    'timestamp' => now()->toDateTimeString()
                ]);
        
                return response()->json(['message' => 'Status kehadiran berhasil diperbarui'], 200);
            } else {
                Log::warning("Update status failed or no changes", [
                    'table' => $sourceTable,
                    'id' => $id,
                    'attempted_status' => $status,
                    'timestamp' => now()->toDateTimeString()
                ]);
        
                return response()->json(['message' => 'ID tidak ditemukan atau status tidak berubah'], 404);
            }
        } catch (\Exception $e) {
            Log::error("Error updating status kehadiran", [
                'error' => $e->getMessage(),
                'table' => $sourceTable,
                'id' => $id,
                'timestamp' => now()->toDateTimeString()
            ]);
        
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
    
    public function getAttendance(Request $request)
    {
        $validated = $request->validate([
            'source_table' => 'required|string',
        ]);

        $sourceTable = $validated['source_table'];

        // Daftar nama tabel yang diizinkan
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
            $data = DB::table($sourceTable)
                ->select('id', 'nama_tamu as name', 'status', 'reason')
                ->get();
            
            return response()->json($data);
            
        } catch (\Exception $e) {
            Log::error("Error getting attendance data", [
                'error' => $e->getMessage(),
                'table' => $sourceTable,
                'timestamp' => now()->toDateTimeString()
            ]);
        
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
    // Di KeteranganController.php
public function resetKeterangan(Request $request)
{
    try {
        $teacherId = $request->input('teacherId');
        
        // Jika teacherId disediakan, reset hanya guru tersebut
        if ($teacherId) {
            DB::table('kepseks')
                ->where('id', $teacherId)
                ->update([
                    'status' => 'present',
                    'reason' => null
                ]);
                
            return response()->json(['message' => 'Status guru berhasil direset'], 200);
        }
        
        // Jika tidak ada teacherId, reset semua guru
        DB::table('kepseks')
            ->update([
                'status' => 'present',
                'reason' => null
            ]);
            
        return response()->json(['message' => 'Status semua guru berhasil direset'], 200);
    } catch (\Exception $e) {
        Log::error("Error resetting keterangan", [
            'error' => $e->getMessage(),
            'timestamp' => now()->toDateTimeString()
        ]);
        
        return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
    }
}
    
    /**
     * Mendapatkan status kehadiran berdasarkan nama
     */
    public function getStatusByName(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'source_table' => 'required|string',
        ]);

        $name = $validated['name'];
        $sourceTable = $validated['source_table'];

        // Daftar nama tabel yang diizinkan
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
            $data = DB::table($sourceTable)
                ->where('nama_tamu', $name)
                ->select('id', 'nama_tamu as name', 'status', 'reason')
                ->first();
            
            if (!$data) {
                return response()->json(['error' => 'Nama tidak ditemukan'], 404);
            }
            
            return response()->json($data);
            
        } catch (\Exception $e) {
            Log::error("Error getting attendance status by name", [
                'error' => $e->getMessage(),
                'table' => $sourceTable,
                'name' => $name,
                'timestamp' => now()->toDateTimeString()
            ]);
        
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
}