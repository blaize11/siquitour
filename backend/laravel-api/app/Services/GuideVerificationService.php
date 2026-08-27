<?php

namespace App\Services;

use App\Models\GuideVerificationDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class GuideVerificationService
{
    /**
     * Maximum file size per image: 5MB
     */
    public const MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * Allowed MIME types for driver's license images
     */
    public const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/octet-stream', // Sometimes sent as octet-stream
    ];

    /**
     * Submit driver's license FRONT and BACK images for verification
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public static function submitLicense(
        User $guide,
        UploadedFile $frontFile,
        UploadedFile $backFile
    ): GuideVerificationDocument {
        // Validate both files
        self::validateLicenseFile($frontFile, 'front');
        self::validateLicenseFile($backFile, 'back');

        // Store files in private storage
        $frontPath = self::storeLicenseFile($guide, $frontFile, 'front');
        $backPath = self::storeLicenseFile($guide, $backFile, 'back');

        // If guide already has a verification document, update it (resubmission)
        if ($guide->verificationDocument) {
            // Delete old files
            Storage::disk('private')->delete($guide->verificationDocument->driver_license_front_file_path);
            Storage::disk('private')->delete($guide->verificationDocument->driver_license_back_file_path);

            $guide->verificationDocument->update([
                'driver_license_front_file_path' => $frontPath,
                'driver_license_back_file_path' => $backPath,
                'submission_status' => 'pending',
                'submitted_at' => now(),
                'reviewed_at' => null,
                'reviewed_by' => null,
                'rejection_reason' => null,
                'rejection_date' => null,
            ]);

            // Update guide profile status
            $guide->tourGuideProfile()->update([
                'verification_status' => 'pending_review',
            ]);

            return $guide->verificationDocument;
        }

        // Create new verification document
        $document = GuideVerificationDocument::create([
            'user_id' => $guide->id,
            'driver_license_front_file_path' => $frontPath,
            'driver_license_back_file_path' => $backPath,
            'submission_status' => 'pending',
            'submitted_at' => now(),
        ]);

        // Update guide profile status
        $guide->tourGuideProfile()->update([
            'verification_status' => 'pending_review',
        ]);

        return $document;
    }

    /**
     * Validate license file
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public static function validateLicenseFile(UploadedFile $file, string $side = 'file'): void
    {
        // Check file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \Illuminate\Validation\ValidationException(
                \Illuminate\Validation\Validator::make([], [])->errors()
                    ->add("driver_license_{$side}_file", 'File size must not exceed 5MB.')
            );
        }

        // Check MIME type (only JPEG/PNG for images)
        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES)) {
            throw new \Illuminate\Validation\ValidationException(
                \Illuminate\Validation\Validator::make([], [])->errors()
                    ->add("driver_license_{$side}_file", 'File must be a JPEG or PNG image.')
            );
        }
    }

    /**
     * Store license file securely in private storage
     */
    public static function storeLicenseFile(User $guide, UploadedFile $file, string $side): string
    {
        // Store in private disk under guide-licenses/{user_id}/{side}/
        $directory = "guide-licenses/{$guide->id}";
        $filename = "license_{$side}_" . now()->timestamp . '.' . $file->extension();

        $path = Storage::disk('private')->putFileAs(
            $directory,
            $file,
            $filename
        );

        return $path;
    }

    /**
     * Delete license files
     */
    public static function deleteLicenseFiles(GuideVerificationDocument $document): void
    {
        Storage::disk('private')->delete($document->driver_license_front_file_path);
        Storage::disk('private')->delete($document->driver_license_back_file_path);
    }

    /**
     * Get verification status for guide
     */
    public static function getVerificationStatus(User $guide): array
    {
        $document = $guide->verificationDocument;

        if (!$document) {
            return [
                'status' => 'not_submitted',
                'message' => 'Please submit your driver\'s license to activate your guide account.',
            ];
        }

        return [
            'status' => $document->submission_status,
            'submitted_at' => $document->submitted_at,
            'reviewed_at' => $document->reviewed_at,
            'rejection_reason' => $document->rejection_reason,
        ];
    }
}
