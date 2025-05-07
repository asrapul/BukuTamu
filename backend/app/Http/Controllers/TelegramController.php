<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

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

            // Kirim pesan ke Telegram
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $telegramId,
                'text' => $message,
                'parse_mode' => 'HTML'
            ]);

            if ($response->successful()) {
                return response()->json(['message' => 'Notifikasi berhasil dikirim']);
            } else {
                return response()->json(['message' => 'Gagal mengirim notifikasi: ' . $response->body()], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
}
