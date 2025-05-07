<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChartController extends Controller
{
    public function getChartData(Request $request)
    {
        $selectedWeek = $request->query('minggu'); // e.g., 'Minggu 1'
        $selectedMonth = $request->query('bulan'); // e.g., 'Januari'
        $selectedYear = $request->query('tahun'); // e.g., '2024'
        $showAll = $request->query('semua') === 'true';

        Log::info("Filter diterima => Minggu: $selectedWeek, Bulan: $selectedMonth, Tahun: $selectedYear, Semua: " . ($showAll ? 'Ya' : 'Tidak'));

        $labels = [
            'Kepala Sekolah',
            'PPDB (Penerimaan Peserta Didik Baru)',
            'Hubin (Hubungan Industri)',
            'Kesiswaan',
            'Sarpra (Sarana dan Prasarana)',
            'Kurikulum',
            'Keuangan / Administrasi',
            'Guru',
            'Perf. QMR '
        ];

        $tables = [
            'kepseks',
            'ppdbs',
            'hubins',
            'kesiswaans',
            'sarpras',
            'kurikulums',
            'keuangan_administrasis',
            'gurus',
            'perf_q_m_rs'
        ];

        $totals = [];

        if ($showAll) {
            Log::info("Filter: Semua Data - tanpa batas tanggal");

            foreach ($tables as $table) {
                $count = DB::table($table)->count();
                Log::info("Total $table: $count");
                $totals[] = $count;
            }

        } else {
            // Mapping bulan Indonesia ke angka
            $bulanMap = [
                'Januari' => 1,
                'Februari' => 2,
                'Maret' => 3,
                'April' => 4,
                'Mei' => 5,
                'Juni' => 6,
                'Juli' => 7,
                'Agustus' => 8,
                'September' => 9,
                'Oktober' => 10,
                'November' => 11,
                'Desember' => 12,
            ];

            $bulanAngka = $selectedMonth && isset($bulanMap[$selectedMonth]) ? $bulanMap[$selectedMonth] : null;

            // Parsing minggu (ambil angka dari 'Minggu 1', dst)
            $mingguAngka = null;
            if ($selectedWeek && strpos($selectedWeek, 'Minggu') !== false) {
                $mingguAngka = (int) filter_var($selectedWeek, FILTER_SANITIZE_NUMBER_INT);
            }

            $tahunAngka = $selectedYear ? intval($selectedYear) : null;

            $startDate = null;
            $endDate = null;

            if ($bulanAngka && $tahunAngka) {
                $startOfMonth = Carbon::createFromDate($tahunAngka, $bulanAngka, 1);

                if ($mingguAngka >= 1) {
                    // Hitung minggu ke-N dalam bulan
                    $startDate = $startOfMonth->copy()->addWeeks($mingguAngka - 1)->startOfWeek(Carbon::MONDAY);
                    $endDate = $startDate->copy()->endOfWeek(Carbon::SUNDAY);

                    // Pastikan endDate tidak melewati akhir bulan
                    $endOfMonth = $startOfMonth->copy()->endOfMonth();
                    if ($endDate->gt($endOfMonth)) {
                        $endDate = $endOfMonth;
                    }

                    Log::info("Filter: Minggu ke-$mingguAngka di bulan $selectedMonth $tahunAngka");
                } else {
                    // Filter per bulan
                    $startDate = $startOfMonth->startOfMonth();
                    $endDate = $startOfMonth->endOfMonth();
                    Log::info("Filter: Bulan $selectedMonth $tahunAngka");
                }

            } elseif ($tahunAngka) {
                // Filter per tahun
                $startDate = Carbon::createFromDate($tahunAngka, 1, 1)->startOfYear();
                $endDate = $startDate->copy()->endOfYear();
                Log::info("Filter: Tahun $tahunAngka");
            }

            Log::info("Tanggal rentang: $startDate hingga $endDate");

            foreach ($tables as $table) {
                $query = DB::table($table);

                if ($startDate && $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }

                $count = $query->count();
                Log::info("Total $table dalam rentang: $count");
                $totals[] = $count;
            }
        }

        return response()->json([
            'labels' => $labels,
            'totals' => $totals,
        ]);
    }
}
