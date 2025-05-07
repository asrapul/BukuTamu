<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class PenggunaController extends Controller
{
    public function index()
    {
        $data = DB::table('profile_users')
            ->join('users', 'profile_users.user_id', '=', 'users.id')
            ->select(
                'profile_users.*',
                'users.username',
                'users.plain_password as password'
            )
            ->get();
        return response()->json($data);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $pengguna = Pengguna::findOrFail($id);

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nip' => 'nullable|string|max:50',
            'unit_kerja' => 'nullable|string|max:100',
            'username' => 'required|string|max:50',
            'password' => 'required|string|max:255',
        ]);

        $pengguna->update($validated);

        return response()->json($pengguna, 200);
    }

    // Update method untuk endpoint /api/pengguna/update/{id}
    public function updateAlternative(Request $request, $id)
    {
        try {
            $pengguna = Pengguna::findOrFail($id);

            // Update kolom yang ada di tabel profile_users
            $pengguna->update([
                'nama_lengkap' => $request->nama_lengkap,
                'nip' => $request->nip,
                'unit_kerja' => $request->unit_kerja,
            ]);

            // Jika user_id ada, update username dan password di tabel users
            if ($pengguna->user_id) {
                $user = User::find($pengguna->user_id);
                if ($user) {
                    $updateData = [];

                    if ($request->username) {
                        $updateData['username'] = $request->username;
                    }

                    if ($request->password) {
                        $updateData['password'] = bcrypt($request->password);
                    }

                    if (!empty($updateData)) {
                        $user->update($updateData);
                    }
                }
            }

            // Ambil data yang diperbarui
            $pengguna = Pengguna::with('user')->findOrFail($id);

            return response()->json($pengguna);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $pengguna = Pengguna::findOrFail($id);

            // Hapus data user jika ada relasi
            if ($pengguna->user_id) {
                // Hapus data user terkait jika diperlukan
                // \App\Models\User::where('id', $pengguna->user_id)->delete();
            }

            $pengguna->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pengguna: ' . $e->getMessage()
            ], 500);
        }
    }
}
