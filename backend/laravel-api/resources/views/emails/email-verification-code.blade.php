<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a73e8; margin: 0;">SiquiTour</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Discover Siquijor Island</p>
    </div>

    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Verify Your Email Address</h2>

        <p>Hi {{ $userName }},</p>

        <p>Thank you for creating your SiquiTour account! To get started, please verify your email address using the code below.</p>

        <div style="background-color: #fff; border: 2px solid #1a73e8; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">Your verification code:</p>
            <h3 style="margin: 10px 0 0 0; font-size: 36px; letter-spacing: 3px; color: #1a73e8; font-family: 'Courier New', monospace;">{{ $code }}</h3>
        </div>

        <p style="color: #666; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>

        <p>Enter this code in the SiquiTour app to verify your email and complete your registration.</p>
    </div>

    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <p style="margin: 0; color: #666; font-size: 13px;">
            <strong>Didn't request this code?</strong><br>
            If you didn't create this account, please ignore this email. Your email address will not be verified.
        </p>
    </div>

    <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
            © {{ date('Y') }} SiquiTour. All rights reserved.<br>
            Siquijor Island, Philippines
        </p>
    </div>
</div>
