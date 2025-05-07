<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FormSubmissionController;
use App\Http\Controllers\authController;
use App\Http\Controllers\KepseksController;
use App\Http\Controllers\Perf_QMRsController;
use App\Http\Controllers\Keuangan_AdministrasisController;
use App\Http\Controllers\KurikulumsController;
use App\Http\Controllers\KesiswaanController;
use App\Http\Controllers\SarpraController;
use App\Http\Controllers\HubinController;
use App\Http\Controllers\PpdbController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\ChartController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TamuController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\KeteranganController;
use App\Http\Controllers\TelegramNotificationController;



Route::post('/users', [UserController::class, 'store']);

// Rute untuk register
Route::post('/register', [UserController::class, 'store']);

// Rute untuk login
Route::post('/login', [UserController::class, 'login']);

// Rute untuk logout (Memerlukan token)
Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:api');

// Rute untuk mendapatkan data pengguna (Memerlukan token)
Route::get('/user', [UserController::class, 'getUser'])->middleware('auth:api');

Route::post('/register', [authController::class, 'register']);
Route::post('/login', [authController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [authController::class, 'user']);
    Route::post('/logout', [authController::class, 'logout']);

});


Route::apiResource('pengguna', PenggunaController::class);

Route::put('/keterangan/update', [KeteranganController::class, 'updateKeterangan']);
Route::put('/keterangan/update-status', [KeteranganController::class, 'updateStatus']);
Route::get('/keterangan/attendance', [KeteranganController::class, 'getAttendance']);
Route::post('/keterangan/reset', [KeteranganController::class, 'resetKeterangan']);

// Update Status
Route::put('/data/update-status', [DataController::class, 'updateStatus']);

// Delete Controller
Route::delete('/data/delete-by-created-at', [DataController::class, 'destroyByCreatedAt']);

Route::delete('/data/delete-old-data', [DataController::class, 'deleteOldData']);

// Route Notifikasi
//Route::get('/notifications/unread/{userId}', [NotificationController::class, 'getUnreadNotifications']);
Route::get('/notifications/type/{userType}', [NotificationController::class, 'getNotificationsByType']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::put('/notifications/read/all', [NotificationController::class, 'markAllAsRead']);
Route::get('/notifications/type/{userType}/unread', [NotificationController::class, 'getUnreadNotificationsByType']);

// route pindah tamu
Route::get('/tamu/{id}', [TamuController::class, 'getDataById']);
Route::put('/tamu/pindah/{id}', [TamuController::class, 'updateAndMove']);
Route::post('/tamu/move/{id}', [TamuController::class, 'updateAndMove']);
Route::get('/tamu/{id}/edit', [TamuController::class, 'getDataForEdit']);

Route::get('/notifications', [NotificationController::class, 'getNotifications']);

Route::get('/kepseks', [KepseksController::class, 'index']);
Route::get('/kepseks/{id}', [KepseksController::class, 'show']);
Route::post('/kepseks', [KepseksController::class, 'store']);

Route::get('/perf_q_m_rs', [Perf_QMRsController::class, 'index']);
Route::get('/perf_q_m_rs/{id}',[Perf_QMRsController::class, 'show']);
Route::post('/perf_q_m_rs', [Perf_QMRsController::class, 'store']);

Route::get('/keuangan_administrasis', [Keuangan_AdministrasisController::class, 'index']);
Route::get('keuangan_administrasis/{id}',[Keuangan_AdministrasisController::class, 'show']);
Route::post('/keuangan_administrasis', [Keuangan_AdministrasisController::class, 'store']);

Route::get('/kurikulums', [KurikulumsController::class, 'index']);
Route::get('kurikulums/{id}',[KurikulumsController::class, 'show']);
Route::post('/kurikulums', [KurikulumsController::class, 'store']);

Route::get('/kesiswaans', [KesiswaanController::class, 'index']);
Route::get('kesiswaans/{id}', [KesiswaanController::class, 'show']);
Route::post('/kesiswaans', [KesiswaanController::class, 'store']);

Route::get('/sarpras', [SarpraController::class, 'index']);
Route::get('sarpras/{id}', [SarpraController::class, 'show']);
Route::post('/sarpras', [SarpraController::class, 'store']);

Route::get('/hubins', [HubinController::class, 'index']);
Route::get('hubins/{id}',[HubinController::class, 'show']);
Route::post('/hubins', [HubinController::class, 'store']);

Route::get('/ppdbs', [PpdbController::class, 'index']);
Route::get('ppdbs/{id}',[PpdbController::class, 'show']);
Route::post('/ppdbs', [PpdbController::class, 'store']);

Route::get('/gurus', [GuruController::class, 'index']);
Route::get('gurus/{id}', [GuruController::class, 'show']);
Route::post('/gurus', [GuruController::class, 'store']);


// Chart Controller
Route::get('/chart-data', [ChartController::class, 'getChartData']);

// Route untuk mendapatkan status kehadiran berdasarkan nama
Route::get('/keterangan/status-by-name', [KeteranganController::class, 'getStatusByName']);

Route::get('/notifications/type/{userType}', [NotificationController::class, 'getNotificationsByType']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::put('/notifications/read/all', [NotificationController::class, 'markAllAsRead']);
Route::get('/notifications/type/{userType}/unread', [NotificationController::class, 'getUnreadNotificationsByType']);

// route pindah tamu
Route::get('/tamu/{id}', [TamuController::class, 'getDataById']);
Route::put('/tamu/pindah/{id}', [TamuController::class, 'updateAndMove']);
Route::post('/tamu/move/{id}', [TamuController::class, 'updateAndMove']);
Route::get('/tamu/{id}/edit', [TamuController::class, 'getDataForEdit']);

Route::get('/notifications', [NotificationController::class, 'getNotifications']);

Route::get('/kepseks', [KepseksController::class, 'index']);
Route::get('/kepseks/{id}', [KepseksController::class, 'show']);
Route::post('/kepseks', [KepseksController::class, 'store']);

Route::get('/perf_q_m_rs', [Perf_QMRsController::class, 'index']);
Route::get('/perf_q_m_rs/{id}',[Perf_QMRsController::class, 'show']);
Route::post('/perf_q_m_rs', [Perf_QMRsController::class, 'store']);

Route::get('/keuangan_administrasis', [Keuangan_AdministrasisController::class, 'index']);
Route::get('keuangan_administrasis/{id}',[Keuangan_AdministrasisController::class, 'show']);
Route::post('/keuangan_administrasis', [Keuangan_AdministrasisController::class, 'store']);

Route::get('/kurikulums', [KurikulumsController::class, 'index']);
Route::get('kurikulums/{id}',[KurikulumsController::class, 'show']);
Route::post('/kurikulums', [KurikulumsController::class, 'store']);

Route::get('/kesiswaans', [KesiswaanController::class, 'index']);
Route::get('kesiswaans/{id}', [KesiswaanController::class, 'show']);
Route::post('/kesiswaans', [KesiswaanController::class, 'store']);

Route::get('/sarpras', [SarpraController::class, 'index']);
Route::get('sarpras/{id}', [SarpraController::class, 'show']);
Route::post('/sarpras', [SarpraController::class, 'store']);

Route::get('/hubins', [HubinController::class, 'index']);
Route::get('hubins/{id}',[HubinController::class, 'show']);
Route::post('/hubins', [HubinController::class, 'store']);

Route::get('/ppdbs', [PpdbController::class, 'index']);
Route::get('ppdbs/{id}',[PpdbController::class, 'show']);
Route::post('/ppdbs', [PpdbController::class, 'store']);

// Hapus atau komentari rute duplikat untuk /gurus
// Route::get('/gurus', [GuruController::class, 'index']);
// Route::get('/gurus', [App\Http\Controllers\GuruController::class, 'index']);
// Route::get('/gurus', [App\Http\Controllers\TamuController::class, 'getAllGuruWithTelegramId']);

// Definisikan rute yang benar untuk guru dan telegram
Route::get('/gurus', [App\Http\Controllers\GuruController::class, 'index']);
Route::get('/gurus/{id}', [App\Http\Controllers\GuruController::class, 'show']);
Route::post('/gurus', [GuruController::class, 'store']);

// Routes untuk Guru Telegram IDs - pastikan ini tidak terduplikasi
// Hapus atau komentari salah satu set rute berikut
// Rute set 1 (baris 182-185)
// Route::get('/guru-telegram-ids', [TelegramNotificationController::class, 'getGuruTelegramIds']);
// Route::post('/guru-telegram-ids', [TelegramNotificationController::class, 'storeGuruTelegramId']);
// Route::put('/guru-telegram-ids/{id}', [TelegramNotificationController::class, 'updateGuruTelegramId']);
// Route::delete('/guru-telegram-ids/{id}', [TelegramNotificationController::class, 'deleteGuruTelegramId']);

// Rute untuk notifikasi Telegram
Route::post('/send-telegram-notification', [TelegramNotificationController::class, 'sendNotification']);

// Routes untuk Guru Telegram IDs
Route::get('/guru-telegram-ids', [App\Http\Controllers\TelegramNotificationController::class, 'getGuruTelegramIds']);
Route::post('/guru-telegram-ids', [App\Http\Controllers\TelegramNotificationController::class, 'storeGuruTelegramId']);
Route::put('/guru-telegram-ids/{id}', [App\Http\Controllers\TelegramNotificationController::class, 'updateGuruTelegramId']);
Route::delete('/guru-telegram-ids/{id}', [App\Http\Controllers\TelegramNotificationController::class, 'deleteGuruTelegramId']);
Route::put('guru-telegram-ids/{id}/kehadiran', [TelegramNotificationController::class, 'updateKehadiran']);
Route::put('guru-telegram-ids/set-all-present', [TelegramNotificationController::class, 'setAllPresent']);

Route::post('/send-telegram-notification', [TelegramNotificationController::class, 'sendNotification']);
Route::get('/gurus', [App\Http\Controllers\TamuController::class, 'getAllGuruWithTelegramId']);
Route::get('/gurus/{id}', [App\Http\Controllers\TamuController::class, 'getGuruWithTelegramId']);
// routes/api.php
// Form Submissions Routes
Route::get('/form-submissions', [FormSubmissionController::class, 'index']);
Route::post('/form-submissions', [FormSubmissionController::class, 'store']);
Route::get('/form-submissions/{id}', [FormSubmissionController::class, 'show']);
Route::get('/form-submissions/unit/{unit}', [FormSubmissionController::class, 'getByUnit']);
Route::delete('/form-submissions/{id}', [FormSubmissionController::class, 'destroy']);

// Khusus untuk update status
Route::put('/form-submissions/update-status', [FormSubmissionController::class, 'updateStatus']);

// Khusus untuk delete by created_at
Route::delete('/form-submissions/delete-by-created-at', [FormSubmissionController::class, 'deleteByCreatedAt']);

// Khusus untuk delete old data
Route::delete('/form-submissions/delete-old-data', [FormSubmissionController::class, 'deleteOldData']);

// Aktifkan route berikut untuk menggunakan metode PUT pada form-submissions/{id}
Route::put('/form-submissions/{id}', [FormSubmissionController::class, 'update']);
// Route::post('update-status', 'FormSubmissionController@updateStatus');
// Route::post('form-submissions/update/{id}', 'FormSubmissionController@update');
// Route::put('form-submissions/update-status', [FormSubmissionController::class, 'updateStatus']);

// Tambahkan endpoint alternatif untuk update
Route::post('/pengguna/update/{id}', function(Request $request, $id) {
    $pengguna = \App\Models\Pengguna::findOrFail($id);
    $pengguna->update($request->all());
    return response()->json($pengguna);
});

// Tambahkan route khusus untuk delete
Route::post('/pengguna/delete/{id}', [PenggunaController::class, 'destroy']);
