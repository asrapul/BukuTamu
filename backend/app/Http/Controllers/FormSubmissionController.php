<?php

namespace App\Http\Controllers;

use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FormSubmissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return FormSubmission::orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_tamu' => 'required|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tujuan' => 'required|string|max:255',
            'nama_yang_dikunjungi' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'kartu_identitas' => 'required|string|max:50',
            'nomor_identitas' => 'required|string|max:50',
            'nomor_telepon' => 'required|string|max:20',
        ]);

        $formSubmission = FormSubmission::create($validatedData);

        return response()->json($formSubmission, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return FormSubmission::findOrFail($id);
    }

    /**
     * Get submissions by unit.
     */
    public function getByUnit(string $unit)
    {
        return FormSubmission::where('tujuan', $unit)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $formSubmission = FormSubmission::findOrFail($id);
        $formSubmission->delete();

        return response()->json(null, 204);
    }

    /**
     * Delete submissions by created_at date.
     */
    public function deleteByCreatedAt(Request $request)
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
        ]);

        $date = $validatedData['date'];

        FormSubmission::whereDate('created_at', $date)->delete();

        return response()->json(['message' => 'Data berhasil dihapus'], 200);
    }

    /**
     * Delete old data (older than 30 days).
     */
    public function deleteOldData()
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $count = FormSubmission::where('created_at', '<', $thirtyDaysAgo)->count();
        FormSubmission::where('created_at', '<', $thirtyDaysAgo)->delete();

        return response()->json([
            'message' => "$count data lama berhasil dihapus",
        ], 200);
    }

    /**
     * Update the status of a form submission.
     */
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|numeric',
            'status' => 'required|string',
        ]);

        $submission = FormSubmission::find($validated['id']);
        if (!$submission) {
            return response()->json(['message' => 'Form submission not found'], 404);
        }

        $submission->status = $validated['status'];
        $submission->save();

        return response()->json(['message' => 'Status updated successfully']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'nama_tamu' => 'required|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tujuan' => 'required|string|max:255',
            'nama_yang_dikunjungi' => 'required|string|max:255',
            'keperluan' => 'required|string',
            'kartu_identitas' => 'required|string|max:50',
            'nomor_identitas' => 'required|string|max:50',
            'nomor_telepon' => 'required|string|max:20',
            'status' => 'nullable|string',
        ]);

        $formSubmission = FormSubmission::findOrFail($id);
        $formSubmission->update($validatedData);

        return response()->json($formSubmission);
    }
}
