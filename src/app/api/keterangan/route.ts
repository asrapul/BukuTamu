import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path ke file data kehadiran guru
const dataPath = path.join(process.cwd(), 'data', 'keterangan.json');

export async function GET() {
  try {
    if (!fs.existsSync(dataPath)) {
      // Jika file belum ada, kembalikan array kosong
      return NextResponse.json([], { status: 200 });
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    const attendances = JSON.parse(data);
    
    return NextResponse.json(attendances, { status: 200 });
  } catch (error) {
    console.error('Error reading attendance data:', error);
    return NextResponse.json([], { status: 500 });
  }
}