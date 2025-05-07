"use client";
import { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";
  
type ChartDataType = {
  name: string;
  value: number;
};

interface FormSubmission {
  id: number;
  nama_tamu: string;
  instansi: string;
  tujuan: string;
  unit?: string;
  created_at: string;
}

const COLORS = [
  "#0B4F9E",
  "#7857B8",
  "#52B3E6",
  "#FF726E",
  "#FFD24C",
  "#820000",
  "#526983",
  "#4BB543",
];

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const years = ["2022", "2023", "2024", "2025", "2026"];

export default function PieChartComponent() {
  const [chartData, setChartData] = useState<ChartDataType[]>([]);
  const [rawData, setRawData] = useState<FormSubmission[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [units, setUnits] = useState<string[]>([]);

  const initialRender = useRef(true);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch form submissions and available units data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch form submissions
        const submissionsResponse = await axios.get("http://127.0.0.1:8000/api/form-submissions");
        if (submissionsResponse.data) {
          setRawData(submissionsResponse.data);
        }
        
        // Fetch available units
        // First try from localStorage (if another component already fetched it)
        const savedUnits = localStorage.getItem('unitOptions');
        if (savedUnits) {
          setUnits(JSON.parse(savedUnits));
        } else {
          // Otherwise fetch from API
          const unitsResponse = await axios.get("http://127.0.0.1:8000/api/guru-telegram-ids");
          if (unitsResponse.data && Array.isArray(unitsResponse.data)) {
            const uniqueUnits = [...new Set(unitsResponse.data.map((item: any) => item.unit || ''))].filter(Boolean);
            setUnits(uniqueUnits);
            // Save for future use
            localStorage.setItem('unitOptions', JSON.stringify(uniqueUnits));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          title: "Error",
          text: "Gagal mengambil data. Silakan coba lagi nanti.",
          icon: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data whenever raw data changes or filters are updated
  useEffect(() => {
    if (rawData.length > 0) {
      processChartData();
    }
  }, [rawData, selectedWeek, selectedMonth, selectedYear]);

  const getWeekNumber = (date: Date): number => {
    // Get the first day of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    
    // Calculate the week number within month (1-indexed)
    return Math.ceil((date.getDate() + firstDay.getDay() - 1) / 7);
  };

  const processChartData = () => {
    setIsLoading(true);
    
    try {
      // Filter data based on selected filters
      const filteredData = rawData.filter(item => {
        const itemDate = new Date(item.created_at);
        
        // Filter by year if selected
        if (selectedYear && itemDate.getFullYear() !== parseInt(selectedYear)) {
          return false;
        }
        
        // Filter by month if selected
        if (selectedMonth) {
          const monthIndex = months.indexOf(selectedMonth);
          if (monthIndex !== -1 && itemDate.getMonth() !== monthIndex) {
            return false;
          }
        }
        
        // Filter by week if selected
        if (selectedWeek) {
          const weekNum = getWeekNumber(itemDate);
          const selectedWeekNum = parseInt(selectedWeek.replace("Minggu ", ""));
          if (weekNum !== selectedWeekNum) {
            return false;
          }
        }
        
        return true;
      });
      
      // Count submissions by unit/tujuan
      const unitCounts: Record<string, number> = {};
      
      filteredData.forEach(submission => {
        const unit = submission.unit || submission.tujuan || "Tidak Diketahui";
        unitCounts[unit] = (unitCounts[unit] || 0) + 1;
      });
      
      // Convert to chart data format
      const newChartData: ChartDataType[] = Object.entries(unitCounts).map(([name, value]) => ({
        name,
        value
      }));
      
      // Sort by value (descending)
      newChartData.sort((a, b) => b.value - a.value);
      
      setChartData(newChartData);
    } catch (error) {
      console.error("Error processing chart data:", error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllDataClick = () => {
    setSelectedWeek("");
    setSelectedMonth("");
    setSelectedYear("");
    // processChartData will be triggered by useEffect
  };

  const handleDownloadImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imgData;
    link.download = `piechart_${Date.now()}.png`;
    link.click();
  };

  const handleDownloadExcel = () => {
    if (!chartData || chartData.length === 0) return;

    const excelData = chartData.map((item: ChartDataType) => ({
      Tahun: selectedYear || "Semua Tahun",
      Bulan: selectedMonth || "Semua Bulan",
      Minggu: selectedWeek || "Semua Minggu",
      Unit: item.name,
      Jumlah: item.value,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `statistik_kunjungan_${Date.now()}.xlsx`);
  };

  return (
    <div className="mt-[50px]">
      <div className="flex justify-center gap-6 mt-6 flex-wrap">
        <select
          className="bg-[#E4262C] text-white px-6 py-2 border-4 border-red-700 rounded-full font-medium text-[15px] hover:bg-red-800 cursor-pointer"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
        >
          <option value="">Semua Minggu</option>
          <option>Minggu 1</option>
          <option>Minggu 2</option>
          <option>Minggu 3</option>
          <option>Minggu 4</option>
        </select>

        <select
          className="bg-[#E4262C] text-white px-6 py-2 border-4 border-red-700 rounded-full font-medium text-[15px] hover:bg-red-800 cursor-pointer"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Semua Bulan</option>
          {months.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <select
          className="bg-[#E4262C] text-white px-6 py-2 border-4 border-red-700 rounded-full font-medium text-[15px] hover:bg-red-800 cursor-pointer"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Semua Tahun</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button
          className="bg-[#E4262C] text-white px-6 py-2 border-4 border-red-700 rounded-full font-medium text-[15px] hover:bg-red-800 cursor-pointer"
          onClick={handleAllDataClick}
        >
          Semua Data
        </button>
      </div>

      <div className="flex mt-9 justify-center items-start min-h-[400px]">
        {isLoading ? (
          <p className="text-xl font-semibold">Memuat data...</p>
        ) : chartData.length === 0 ? (
          <p className="text-xl font-semibold">Tidak ada data pada rentang ini.</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-10" ref={chartRef}>
              <ResponsiveContainer width={400} height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ value }) => {
                      const total = chartData.reduce((acc, item) => acc + item.value, 0);
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${percentage}%`;
                    }}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} kunjungan`, '']} />
                </PieChart>
              </ResponsiveContainer>

              <div className="bg-[#dcdce1] border rounded-xl py-8 px-10 shadow-xl">
                <h3 className="font-bold text-lg mb-4 text-center">Statistik Kunjungan</h3>
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <p className="font-medium">{entry.name}: {entry.value} kunjungan</p>
                  </div>
                ))}
                <div className="mt-4 pt-2 border-t border-gray-300">
                  <p className="font-bold">
                    Total: {chartData.reduce((sum, entry) => sum + entry.value, 0)} kunjungan
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-7">
              <button
                onClick={handleDownloadImage}
                className="bg-[#E4262C] text-white px-6 py-2 rounded-full font-medium text-[13px] hover:bg-red-800"
              >
                Unduh Chart sebagai Gambar
              </button>

              <button
                onClick={handleDownloadExcel}
                className="bg-[#0B4F9E] text-white px-6 py-2 rounded-full font-medium text-[13px] hover:bg-blue-800"
              >
                Unduh Data sebagai Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
