<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Services\GuideVerificationService;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    /**
     * Get current verification status
     */
    public function status(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        $status = GuideVerificationService::getVerificationStatus($user);

        return response()->json($status);
    }

    /**
     * Submit driver's license FRONT and BACK for verification
     * No manual license info - just images
     */
    public function submit(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        // Validate: both front and back images required
        // Using file + image_dimensions instead of just 'image' for better compatibility
        $validated = $request->validate([
            'driver_license_front_file' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png',
                'max:5120', // 5MB
            ],
            'driver_license_back_file' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png',
                'max:5120', // 5MB
            ],
        ], [
            'driver_license_front_file.required' => 'Front side of license is required',
            'driver_license_front_file.file' => 'Front side must be a valid image file',
            'driver_license_front_file.mimes' => 'Front side must be a JPEG or PNG image',
            'driver_license_front_file.max' => 'Front side image cannot exceed 5MB',
            'driver_license_back_file.required' => 'Back side of license is required',
            'driver_license_back_file.file' => 'Back side must be a valid image file',
            'driver_license_back_file.mimes' => 'Back side must be a JPEG or PNG image',
            'driver_license_back_file.max' => 'Back side image cannot exceed 5MB',
        ]);

        try {
            $frontFile = $request->file('driver_license_front_file');
            $backFile = $request->file('driver_license_back_file');

            // Double-check files exist and are valid
            if (!$frontFile || !$backFile) {
                return response()->json([
                    'message' => 'Both images are required',
                    'errors' => [
                        'driver_license_front_file' => ['Front image is missing'],
                        'driver_license_back_file' => ['Back image is missing'],
                    ],
                ], 422);
            }

            $document = GuideVerificationService::submitLicense(
                $user,
                $frontFile,
                $backFile
            );

            return response()->json([
                'message' => 'Driver\'s license submitted successfully. Admin will review your application.',
                'verification' => [
                    'id' => $document->id,
                    'status' => $document->submission_status,
                    'submitted_at' => $document->submitted_at,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('License submission error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to submit license: ' . $e->getMessage(),
                'errors' => ['upload' => [$e->getMessage()]],
            ], 422);
        }
    }

    /**
     * Get verification document details
     */
    public function show(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        $document = $user->verificationDocument;
        abort_if(!$document, 404, 'No verification document found.');

        return response()->json([
            'id' => $document->id,
            'status' => $document->submission_status,
            'license_number' => $document->license_number,
            'license_expiry_date' => $document->license_expiry_date,
            'submitted_at' => $document->submitted_at,
            'reviewed_at' => $document->reviewed_at,
            'rejection_reason' => $document->rejection_reason,
        ]);
    }

    /**
     * Download verification document (for guide to view their own)
     */
    public function downloadDocument(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        $document = $user->verificationDocument;
        abort_if(!$document, 404, 'No verification document found.');

        $filePath = $document->driver_license_file_path;
        abort_if(!file_exists(storage_path("app/private/{$filePath}")), 404, 'File not found.');

        return response()->download(
            storage_path("app/private/{$filePath}"),
            "license_{$user->id}.pdf"
        );
    }
}
