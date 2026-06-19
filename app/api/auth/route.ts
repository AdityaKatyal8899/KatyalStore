import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const isSmtpConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, code } = body;

    // Validate request parameters
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Stage 1: Send Verification Code (no code parameter supplied)
    if (!code) {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store verification code in DB
      await db.collection('verification_codes').insertOne({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        code: generatedCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
        used: false,
        createdAt: new Date(),
      });

      // Send mail if configured
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"KatyalStore" <no-reply@katyalstore.com>`,
            to: email.trim().toLowerCase(),
            subject: `🔑 ${generatedCode} is your KatyalStore verification code`,
            text: `Hi ${name},\n\nYour KatyalStore verification code is: ${generatedCode}\n\nThis code will expire in 10 minutes.\n\nCheers,\nKatyalStore Team`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 4px solid #000000; padding: 24px; background-color: #FDFBF7; box-shadow: 6px 6px 0px 0px #000000;">
                <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; border-bottom: 4px solid #000000; padding-bottom: 8px; color: #000000; letter-spacing: -0.5px;">KatyalStore</h1>
                <p style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: #000000; margin-top: 16px;">Hey ${name},</p>
                <p style="font-size: 14px; font-weight: 500; color: #000000; line-height: 1.5;">Here is your verification code to enter the store. Please use this within the next 10 minutes:</p>
                
                <div style="background-color: #FEF08A; border: 4px solid #000000; padding: 16px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px 0px #000000;">
                  <span style="font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #000000; font-family: monospace;">${generatedCode}</span>
                </div>
                
                <p style="font-size: 11px; font-weight: bold; color: #4B5563; text-transform: uppercase; margin-top: 24px;">This code is private. Do not share it with anyone.</p>
              </div>
            `,
          });
          console.log(`[KatyalStore] Verification email successfully sent to ${email}`);
        } catch (mailError) {
          console.error('[KatyalStore] SMTP sendMail failed, logging to console:', mailError);
          console.log(`[KatyalStore LOCAL BYPASS] Verification code for ${email} is ${generatedCode}`);
        }
      } else {
        // Console print bypass for local development
        console.log(`[KatyalStore LOCAL BYPASS] Verification code for ${email} is ${generatedCode}`);
      }

      return NextResponse.json({
        success: true,
        codeSent: true,
      });
    }

    // Stage 2: Verify Code
    const codeDoc = await db.collection('verification_codes')
      .find({ email: email.trim().toLowerCase(), used: false })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!codeDoc) {
      return NextResponse.json(
        { error: 'No verification request found for this email' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(codeDoc.expiresAt)) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    if (codeDoc.code !== code.trim()) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark code as used
    await db.collection('verification_codes').updateOne(
      { _id: codeDoc._id },
      { $set: { used: true } }
    );

    // Fetch or create user record
    let user = await db.collection('user').findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        reviewsCount: 0,
        createdAt: new Date().toISOString(),
        verified: true,
      };
      await db.collection('user').insertOne(newUser);
      user = newUser as any;
      console.log('[KatyalStore] MongoDB New Verified User registered:', newUser);
    } else {
      await db.collection('user').updateOne(
        { _id: user._id },
        { $set: { verified: true } }
      );
      console.log('[KatyalStore] MongoDB Existing User logged in and verified:', user);
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('[KatyalStore] Auth API Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
