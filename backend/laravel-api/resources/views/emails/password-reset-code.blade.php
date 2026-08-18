<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #007bff;">
        <h1 style="color: #007bff; margin: 0;">SiquiTour</h1>
        <p style="color: #666; margin: 5px 0;">Discover Siquijor Island</p>
    </div>

    <div style="padding: 30px;">
        <p>Hello {{ $userName }},</p>

        <p>We received a request to reset your SiquiTour password.</p>

        <p style="margin-top: 30px;">Your verification code is:</p>

        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #007bff; margin: 0; letter-spacing: 5px;">
                {{ $code }}
            </p>
        </div>

        <p style="color: #666; font-size: 14px;">
            This code expires in 10 minutes.
        </p>

        <p style="margin-top: 30px; color: #666;">
            If you did not request a password reset, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            Best regards,<br>
            <strong>SiquiTour Team</strong>
        </p>
    </div>
</div>
