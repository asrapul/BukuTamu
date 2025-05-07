<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GuruTelegramId;

class GuruTelegramIdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data guru berdasarkan unit
        $guruData = [
            "Kepala Sekolah" => ["MUHAMMAD SAAD, S.Pd., M.P.d."],
            "Perf. QMR" => ["ASMAWATI, S.Sos","ERWINDA DWI PRATIWI, S.Pd., M.S.Ed"],
            "Keuangan / Administrasi" => ["RUMAISHA IKHWANA, SE","ADHYTIA ADHYAKSA, S.E.","ADLI DZIL IKRAM, S.Ak","ANDI MUHAMMAD MAULANA SIDENG, Amd","SJAMSIAH, S.S."],
            "Kurikulum" => ["DR. RAHMAT MAHMUD, S.Pd, M.Pd","SRI HASTUTI, S.S.","Drs. SATTUBANG, S.ST, M.Pd","RATU ELIA YUANITA, S.Si","RAODATUL JANNAH, S.T, S.Pd, M.Pd","ALI AKBAR, S. Kom., M.Pd","KHAERUL ISHAK, S.Pd, M.Pd","NURFAIDAH JABBAR, S.IP","YAYU APRILIKA YUNUS, S.Si"],
            "Kesiswaan" => ["ERLINDAH ZULHAIDAH SIDNIWATI SUYUTHI, ST., M.Pd","WIDIANI, S.Pd","ROSMAWATI, S.Pd","ABU ALI, S.Pd, Gr","MUHAMMAD IKMAL AKBAR, S.Pd","A. NOORIAH MUJAHIDAH, S.Pd","FARID MAWARDI, S.Pd, Gr., M.Pd","NURDIANAH, S.Pd., M.Pd","HARYADI INDRAWIJAYA, S.Pd"],
            "Sarpra (Sarana dan Prasarana)" => ["ALI AKBAR, S. Kom., M.Pd","SUKIRMAN","ASRUL, S.Pd, M.Pd","MATIUS RAWA, S.H.","MANSYUR MUIS, S.M.","EKA MERDEKAWATI, ST, M.Pd","AHWAN AZHARI TAHIR, S.T., Gr"],
            "Hubin (Hubungan Industri)" => ["MUSLIADI, S.ST","FIRMAN SYAHIR, S.Pd., M.Pd","DANIEL D. TANAN, SH. M.Pd","SANDY ARDIANSYAH","AYU RISMAYANTI, S.Pd., M.Pd","HASLINA, S.Pd","NURWAHYUNI"],
            "PPDB (Penerimaan Peserta Didik Baru)" => ["DANIEL D. TANAN, SH. M.Pd","FIRMAN SYAHIR, S.Pd., M.Pd"],
            "Guru" => ["ABDUL MALIK, S.Pd","ADI MANGGALIA AMAHORU, S.Pd","ANANDA DZIKMAH AMALIA AZ, S.Tr.Par","ANDI HANIFAH PUTRI RANI, S.Kom","ARMAN, S.Pd., M.Hum.","ASKAR ASWIN AHMAD, S.Pd","ASNAWI, S.HI., Gr","BAKRI CACO, S.Ag, M.Si","DEMETER JANNIAH SABATINI, S.Pd., M.Pd","DEWI, S.Pd","DINDA PUTRU OETAMI, S.Pd., M.Pd","HARI SUSANTO, S.Pd","HILMAWATI, S.Ag., Gr","KARMILA INDAH HASIN, S.Pd., M.Pd","MESY ANDI IDHAM, S.T","MOSES SALEMBAN, S.Pd","MUH. ADE SYAM AGUNG, S.Pd","MUHAMMAD FADHLAN SUPRIADI, S.Kom","MUHAMMAD NUR ARBI, S.Pd., M.Pd","NADYAH NURHIDAYAH N, S.Pd., M.Pd","NURHIKMAH UTAMI, S.Pd","OKTAVIANTO, S.Kom","PADLI SEPTIAN, S.Pd","RAHMAT DANI S., S.Kom","RISDAYANTI, S.Pd","ROSALINA, S.Ag, M.Si","SAMRIANI, S.Pd., M.Pd","SITTI DARMAWATI, S.Pd., M.Pd","SUKMAWATI, S.Pd., M.Pd","TIRSA WULANDARI, S.Pd","TRY SUHARTO, S.Pd","UMMI SUNAIR, S.Pd., M.Pd","WAHYU ILAHI SYAM, S.Pd","YHUGI PRATAMA SAPUTRA A., S.Pd"],
        ];

        // Hapus data yang ada sebelumnya (opsional)
        GuruTelegramId::truncate();

        // Masukkan data baru
        foreach ($guruData as $unit => $namaList) {
            foreach ($namaList as $nama) {
                GuruTelegramId::create([
                    'nama' => $nama,
                    'telegram_id' => 'default_' . strtolower(str_replace(' ', '_', substr($nama, 0, 10))), // Buat telegram_id default
                    'unit' => $unit
                ]);
            }
        }
    }
}
