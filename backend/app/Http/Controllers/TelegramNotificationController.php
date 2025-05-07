<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\GuruTelegramId;

class TelegramNotificationController extends Controller
{
    public function sendNotification(Request $request)
    {
        $request->validate([
            'telegram_id' => 'required|string',
            'message' => 'required|string',
        ]);

        try {
            // Gunakan token bot Telegram dari .env
            $botToken = env('TELEGRAM_BOT_TOKEN');
            $telegramId = $request->telegram_id;
            $message = $request->message;

            // Log untuk debugging
            Log::info('Mengirim notifikasi Telegram ke: ' . $telegramId);

            // Kirim pesan ke Telegram
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $telegramId,
                'text' => $message,
                'parse_mode' => 'HTML'
            ]);

            if ($response->successful()) {
                Log::info('Notifikasi berhasil dikirim');
                return response()->json(['message' => 'Notifikasi berhasil dikirim']);
            } else {
                Log::error('Gagal mengirim notifikasi: ' . $response->body());
                return response()->json(['message' => 'Gagal mengirim notifikasi: ' . $response->body()], 500);
            }
        } catch (\Exception $e) {
            Log::error('Terjadi kesalahan saat mengirim notifikasi: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function getGuruTelegramIds()
    {
        $guruTelegramIds = GuruTelegramId::all();
        return response()->json($guruTelegramIds);
    }

    public function storeGuruTelegramId(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'telegram_id' => 'required|string',
            'unit' => 'required|string',
        ]);

        $guruTelegramId = GuruTelegramId::create([
            'nama' => $request->nama,
            'telegram_id' => $request->telegram_id,
            'unit' => $request->unit,
        ]);

        return response()->json($guruTelegramId, 201);
    }

    public function updateGuruTelegramId(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string',
            'telegram_id' => 'required|string',
            'unit' => 'required|string',
            'kehadiran' => 'nullable|string|in:hadir,izin,sakit',
            'alasan_ketidakhadiran' => 'nullable|string',
        ]);

        $guruTelegramId = GuruTelegramId::findOrFail($id);
        $guruTelegramId->update([
            'nama' => $request->nama,
            'telegram_id' => $request->telegram_id,
            'unit' => $request->unit,
            'kehadiran' => $request->kehadiran ?? 'hadir',
            'alasan_ketidakhadiran' => $request->alasan_ketidakhadiran ?? '',
        ]);

        return response()->json($guruTelegramId);
    }

    public function deleteGuruTelegramId($id)
    {
        $guruTelegramId = GuruTelegramId::findOrFail($id);
        $guruTelegramId->delete();

        return response()->json(null, 204);
    }

    public function updateKehadiran(Request $request, $id)
    {
        $request->validate([
            'kehadiran' => 'required|string|in:hadir,izin,sakit',
            'alasan_ketidakhadiran' => 'nullable|string',
        ]);

        $guruTelegramId = GuruTelegramId::findOrFail($id);
        $guruTelegramId->update([
            'kehadiran' => $request->kehadiran,
            'alasan_ketidakhadiran' => $request->alasan_ketidakhadiran ?? '',
        ]);

        return response()->json($guruTelegramId);
    }

    public function setAllPresent()
    {
        GuruTelegramId::query()->update([
            'kehadiran' => 'hadir',
            'alasan_ketidakhadiran' => ''
        ]);

        return response()->json(['message' => 'Semua guru berhasil diubah statusnya menjadi hadir']);
    }
}
