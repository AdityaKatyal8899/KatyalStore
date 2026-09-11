import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isOwnerEmail } from '@/lib/authUtils';
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ isOwner: false, error: 'Email parameter required' }, { status: 400 });
  }

  const isOwner = isOwnerEmail(email);
  return NextResponse.json({ isOwner, email });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, code } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Owner email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email has owner authorization
    if (!isOwnerEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Access Denied: This email does not have owner dashboard privileges.' },
        { status: 403 }
      );
    }

    const db = await getDb();

    // Stage 1: Send Owner Verification Code (no code provided)
    if (!code) {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      await db.collection('verification_codes').insertOne({
        name: (name || 'Store Owner').trim(),
        email: normalizedEmail,
        code: generatedCode,
        isOwnerAuth: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins expiry
        used: false,
        createdAt: new Date(),
      });

      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"KatyalStore Admin" <no-reply@katyalstore.com>`,
            to: normalizedEmail,
            subject: `🔐 ${generatedCode} - KatyalStore Owner Dashboard Passcode`,
            text: `Hi Owner,\n\nYour KatyalStore Dashboard access code is: ${generatedCode}\n\nValid for 10 minutes.\n\nKatyalStore Security`,
            html: `
              <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; border: 4px solid #000000; padding: 24px; background-color: #FEF08A; box-shadow: 6px 6px 0px 0px #000000;">
                <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; border-bottom: 4px solid #000000; padding-bottom: 8px; color: #000000;">👑 KatyalStore Owner Dashboard</h1>
                <p style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: #000000; margin-top: 16px;">Owner Authentication Required</p>
                <p style="font-size: 14px; font-weight: 500; color: #000000; line-height: 1.5;">Use the one-time passcode below to unlock dashboard administration rights:</p>
                
                <div style="background-color: #FFFFFF; border: 4px solid #000000; padding: 18px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px 0px #000000;">
                  <span style="font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #000000; font-family: monospace;">${generatedCode}</span>
                </div>
                
                <p style="font-size: 11px; font-weight: bold; color: #000000; text-transform: uppercase; margin-top: 24px;">Do not share this passcode. It expires in 10 minutes.</p>
              </div>
            `,
          });
          console.log(`[KatyalStore Admin] Owner OTP sent to ${normalizedEmail}`);
        } catch (mailError) {
          console.error('[KatyalStore Admin] SMTP failed, logging owner OTP to console:', mailError);
          console.log(`[KatyalStore OWNER BYPASS] Passcode for ${normalizedEmail} is ${generatedCode}`);
        }
      } else {
        console.log(`[KatyalStore OWNER BYPASS] Passcode for ${normalizedEmail} is ${generatedCode}`);
      }

      return NextResponse.json({
        success: true,
        codeSent: true,
        message: 'Passcode dispatched to owner inbox',
      });
    }

    // Stage 2: Verify Code
    const codeDoc = await db.collection('verification_codes')
      .find({ email: normalizedEmail, used: false })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!codeDoc) {
      return NextResponse.json(
        { error: 'No verification request found for this owner email' },
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
        { error: 'Invalid verification passcode' },
        { status: 400 }
      );
    }

    // Mark code as used
    await db.collection('verification_codes').updateOne(
      { _id: codeDoc._id },
      { $set: { used: true } }
    );

    // Fetch or create owner record
    let user = await db.collection('user').findOne({ email: normalizedEmail });
    if (!user) {
      const newUser = {
        name: name?.trim() || 'Store Owner',
        email: normalizedEmail,
        isOwner: true,
        createdAt: new Date().toISOString(),
        verified: true,
      };
      await db.collection('user').insertOne(newUser);
      user = newUser as any;
    } else {
      await db.collection('user').updateOne(
        { _id: user._id },
        { $set: { isOwner: true, verified: true } }
      );
    }

    return NextResponse.json({
      success: true,
      isOwner: true,
      user: {
        name: user.name || 'Store Owner',
        email: user.email,
        isOwner: true,
      }
    });
  } catch (error) {
    console.error('[KatyalStore Admin] Auth API Error:', error);
    return NextResponse.json(
      { error: 'Owner authentication process failed' },
      { status: 500 }
    );
  }
}
