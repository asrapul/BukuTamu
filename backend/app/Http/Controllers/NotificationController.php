<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    // Ambil notifikasi berdasarkan user_type
    public function getNotificationsByType($userType)
    {
        try {
            // Validasi tipe user yang diperbolehkan
            $allowedTypes = [
                'gurus', 'hubins', 'kepseks', 'kesiswaans', 
                'keuangan_administrasis', 'kurikulums', 
                'perf_q_m_rs', 'ppdbs', 'sarpras'
            ];

            if (!in_array($userType, $allowedTypes)) {
                return response()->json(['error' => 'Invalid user type'], 400);
            }

            // Ambil semua notifikasi berdasarkan user_type
            $notifications = DB::table('notifications')
                ->where('user_type', $userType)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($notifications);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    // Ambil notifikasi yang belum dibaca berdasarkan user_type
    public function getUnreadNotificationsByType($userType)
    {
        try {
            $allowedTypes = [
                'gurus', 'hubins', 'kepseks', 'kesiswaans',
                'keuangan_administrasis', 'kurikulums',
                'perf_q_m_rs', 'ppdbs', 'sarpras'
            ];

            if (!in_array($userType, $allowedTypes)) {
                return response()->json(['error' => 'Invalid user type'], 400);
            }

            // Ambil notifikasi yang belum dibaca berdasarkan user_type
            $notifications = DB::table('notifications')
                ->where('user_type', $userType)
                ->where('readd', 0)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($notifications);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    // Tandai satu notifikasi sebagai dibaca
    public function markAsRead($id)
    {
        try {
            // Cek apakah notifikasi ada
            $exists = DB::table('notifications')->where('id', $id)->exists();
            if (!$exists) {
                return response()->json(['error' => 'Notification not found'], 404);
            }

            // Tandai sebagai dibaca
            DB::table('notifications')->where('id', $id)->update(['readd' => 1]);

            return response()->json(['success' => true, 'id' => $id]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    // Tandai banyak notifikasi sebagai dibaca
    public function markAllAsRead(Request $request)
    {
        try {
            $ids = $request->input('ids');

            if (!is_array($ids) || empty($ids)) {
                return response()->json(['error' => 'ID list is required'], 400);
            }

            // Tandai semua notifikasi terpilih sebagai dibaca
            DB::table('notifications')
                ->whereIn('id', $ids)
                ->update(['readd' => 1]);

            return response()->json(['success' => true, 'updated_ids' => $ids]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}
