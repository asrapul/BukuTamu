<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\ProfileUser;
use Tymon\JWTAuth\Facades\JWTAuth; // Import JWTAuth

class UserController extends Controller
{
    // Fungsi untuk register user
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'username' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:6',
            'nama_lengkap' => 'required|string|max:255',
            'nip' => 'required|string|max:50',
            'unit_kerja' => 'required|string|max:255',
        ]);

        try {
            // Buat user baru
            $user = new User();
            $user->username = $request->username;
            $user->email = $request->username . '@gmail.com'; // atau kosongkan jika tidak digunakan
            $user->password = Hash::make($request->password);
            $user->plain_password = $request->password;
            $user->code = Str::random(10); // kode unik jika diperlukan
            $user->role = 'staf'; // Ganti sesuai kebutuhan: 'staf' atau 'superadmin'
            $user->remember_token = null;
            $user->save();

            // Buat entri pada tabel profile_users
            ProfileUser::create([
                'user_id' => $user->id,
                'nama_lengkap' => $request->nama_lengkap,
                'nip' => $request->nip,
                'unit_kerja' => $request->unit_kerja,
            ]);

            return response()->json([
                'message' => 'Pengguna berhasil ditambahkan',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            // Menangkap error dan mengembalikan pesan error
            return response()->json([
                'message' => 'Gagal menambahkan pengguna',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Fungsi untuk login dan menghasilkan token JWT
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Mencari user berdasarkan username
        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Generate JWT token
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'user' => $user
        ]);
    }

    // Fungsi untuk logout (Hapus token)
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate($request->token);
            return response()->json(['message' => 'Logout berhasil']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Logout gagal'], 500);
        }
    }

    // Fungsi untuk mendapatkan data pengguna berdasarkan token
    public function getUser(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate(); // Mengambil pengguna dari token
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['message' => 'User not found'], 404);
        }
    }
}