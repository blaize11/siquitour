<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GuideVerificationDocument;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuideVerificationController extends Controller
{
    /**
     * List pending/all guide verification applications
     */
    public function index(Request $request)
    {
        $query = GuideVerificationDocument::query()
            ->with(['guide:id,name,email,phone,avatar_url', 'guide.tourGuideProfile:id,user_id,bio,years_experience']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('submission_status', $request->input('status'));
        }

        $documents = $query
            ->latest('submitted_at')
            ->get();

        // Format response for mobile app
        $formattedData = $documents->map(function ($doc) {
            $profile = $doc->guide->tourGuideProfile;
            return [
                'id' => $doc->id,
                'user_id' => $doc->user_id,
                'user_name' => $doc->guide->name,
                'user_email' => $doc->guide->email,
                'user_phone' => $doc->guide->phone,
                'user_avatar' => $doc->guide->avatar_url,
                'bio' => $profile?->bio ?? 'No bio provided',
                'years_experience' => $profile?->years_experience ?? 0,
                'license_number' => $doc->license_number,
                'license_expiry_date' => $doc->license_expiry_date,
                'submission_status' => $doc->submission_status,
                'submitted_at' => $doc->submitted_at,
                'rejection_reason' => $doc->rejection_reason,
            ];
        });

        return response()->json(['data' => $formattedData]);
    }

    /**
     * Get details of a specific verification application
     */
    public function show(Request $request, GuideVerificationDocument $document)
    {
        $document->load(['guide', 'reviewer']);

        $tourGuideProfile = $document->guide->tourGuideProfile;

        return response()->json([
            'id' => $document->id,
            'user_id' => $document->guide->id,
            'name' => $document->guide->name,
            'email' => $document->guide->email,
            'phone' => $document->guide->phone,
            'license_number' => $document->license_number,
            'license_expiry_date' => $document->license_expiry_date,
            'submission_status' => $document->submission_status,
            'submitted_at' => $document->submitted_at,
            'reviewed_at' => $document->reviewed_at,
            'reviewed_by' => $document->reviewer?->name,
            'rejection_reason' => $document->rejection_reason,
            'tour_guide_profile' => [
                'bio' => $tourGuideProfile->bio,
                'years_experience' => $tourGuideProfile->years_experience,
            ],
        ]);
    }

    /**
     * Download/view verification document (license image)
     * Only accessible to admins - FOR BACKWARD COMPATIBILITY
     */
    public function downloadDocument(Request $request, GuideVerificationDocument $document)
    {
        // Try front image first for backward compatibility
        $filePath = $document->driver_license_front_file_path ?? $document->driver_license_file_path;
        abort_if(!$filePath, 404, 'License image not found.');

        $fullPath = storage_path("app/private/{$filePath}");
        abort_if(!file_exists($fullPath), 404, 'File not found.');

        // Log this action
        AuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'viewed_license',
            'resource_type' => 'guide_verification_document',
            'resource_id' => $document->id,
        ]);

        return response()->file($fullPath, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => "inline; filename=license_front_{$document->user_id}.jpg"
        ]);
    }

    /**
     * Download front license image
     */
    public function downloadFrontImage(Request $request, GuideVerificationDocument $document)
    {
        $filePath = $document->driver_license_front_file_path;
        abort_if(!$filePath, 404, 'Front license image not found.');

        $fullPath = storage_path("app/private/{$filePath}");
        abort_if(!file_exists($fullPath), 404, 'File not found.');

        // Log this action
        AuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'viewed_license_front',
            'resource_type' => 'guide_verification_document',
            'resource_id' => $document->id,
        ]);

        return response()->file($fullPath, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => "inline; filename=license_front_{$document->user_id}.jpg"
        ]);
    }

    /**
     * Download back license image
     */
    public function downloadBackImage(Request $request, GuideVerificationDocument $document)
    {
        $filePath = $document->driver_license_back_file_path;
        abort_if(!$filePath, 404, 'Back license image not found.');

        $fullPath = storage_path("app/private/{$filePath}");
        abort_if(!file_exists($fullPath), 404, 'File not found.');

        // Log this action
        AuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'viewed_license_back',
            'resource_type' => 'guide_verification_document',
            'resource_id' => $document->id,
        ]);

        return response()->file($fullPath, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => "inline; filename=license_back_{$document->user_id}.jpg"
        ]);
    }

    /**
     * Approve a guide's verification
     */
    public function approve(Request $request, GuideVerificationDocument $document)
    {
        abort_if($document->submission_status !== 'pending', 422, 'Only pending applications can be approved.');

        $admin = $request->user();
        abort_unless($admin->role === 'admin', 403);

        // Approve the document
        $document->approve($admin);

        // Log audit
        AuditLog::create([
            'admin_id' => $admin->id,
            'action' => 'approved_guide_verification',
            'resource_type' => 'guide_verification_document',
            'resource_id' => $document->id,
        ]);

        return response()->json([
            'message' => 'Guide verification approved.',
            'submission_status' => $document->submission_status,
            'reviewed_at' => $document->reviewed_at,
        ]);
    }

    /**
     * Reject a guide's verification
     */
    public function reject(Request $request, GuideVerificationDocument $document)
    {
        abort_if($document->submission_status !== 'pending', 422, 'Only pending applications can be rejected.');

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $admin = $request->user();
        abort_unless($admin->role === 'admin', 403);

        // Reject the document
        $document->reject($admin, $validated['rejection_reason']);

        // Log audit
        AuditLog::create([
            'admin_id' => $admin->id,
            'action' => 'rejected_guide_verification',
            'resource_type' => 'guide_verification_document',
            'resource_id' => $document->id,
            'new_values' => ['rejection_reason' => $validated['rejection_reason']],
        ]);

        return response()->json([
            'message' => 'Guide verification rejected.',
            'submission_status' => $document->submission_status,
            'rejection_reason' => $document->rejection_reason,
            'reviewed_at' => $document->reviewed_at,
        ]);
    }
}
