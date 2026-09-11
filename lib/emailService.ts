import nodemailer from 'nodemailer';
import { getOwnerEmails } from './authUtils';

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

const SENDER_EMAIL = process.env.SMTP_FROM || `"KatyalStore Alerts" <no-reply@katyalstore.com>`;
const STORE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://katyalstore.com';

/**
 * Renders a responsive, high-contrast Neo-Brutalist HTML email template
 */
function renderNeoBrutalistEmailHtml({
  badge,
  badgeBg = '#FEF08A',
  title,
  subtitle,
  details,
  buttonText,
  buttonUrl,
  footerNote,
}: {
  badge: string;
  badgeBg?: string;
  title: string;
  subtitle?: string;
  details: { label: string; value: string; highlight?: boolean }[];
  buttonText?: string;
  buttonUrl?: string;
  footerNote?: string;
}): string {
  const detailRows = details
    .map(
      (d) => `
      <tr style="border-bottom: 2px solid #000000;">
        <td style="padding: 10px 14px; font-weight: 900; text-transform: uppercase; font-size: 11px; color: #4B5563; width: 35%; border-right: 2px solid #000000; vertical-align: top; background-color: #F3F4F6;">${d.label}</td>
        <td style="padding: 10px 14px; font-weight: bold; font-size: 13px; color: #000000; ${d.highlight ? `background-color: ${badgeBg}; font-weight: 900;` : 'background-color: #FFFFFF;'}">${d.value}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 24px 12px; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #FFFFFF; border: 4px solid #000000; box-shadow: 8px 8px 0px 0px #000000; padding: 24px; text-align: left;">
                
                <!-- Top Brand Header Bar -->
                <tr>
                  <td style="border-bottom: 4px solid #000000; padding-bottom: 16px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; color: #000000;">
                          KATYAL<span style="background-color: #FEF08A; padding: 2px 6px; border: 2px solid #000000; margin-left: 4px;">STORE</span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: ${badgeBg}; border: 2px solid #000000; padding: 5px 10px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 3px 3px 0px 0px #000000;">
                            ${badge}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Headline -->
                <tr>
                  <td style="padding-top: 20px; padding-bottom: 6px;">
                    <h1 style="font-size: 22px; line-height: 1.25; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; color: #000000; margin: 0 0 6px 0;">
                      ${title}
                    </h1>
                    ${subtitle ? `<p style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #4B5563; margin: 0 0 16px 0; letter-spacing: 0.2px;">${subtitle}</p>` : ''}
                  </td>
                </tr>

                <!-- Details Table -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 3px solid #000000; box-shadow: 4px 4px 0px 0px #000000;">
                      <tbody>
                        ${detailRows}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Call To Action Button -->
                ${
                  buttonText && buttonUrl
                    ? `
                  <tr>
                    <td align="center" style="padding: 10px 0 24px 0;">
                      <a href="${buttonUrl}" style="display: inline-block; background-color: #000000; color: #FFFFFF; font-weight: 900; font-size: 13px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border: 3px solid #000000; box-shadow: 4px 4px 0px 0px ${badgeBg}; letter-spacing: 0.5px;">
                        ${buttonText} &rarr;
                      </a>
                    </td>
                  </tr>
                `
                    : ''
                }

                <!-- Footer Note -->
                <tr>
                  <td style="border-top: 3px solid #000000; padding-top: 14px; font-size: 10px; font-weight: 900; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${footerNote || 'KatyalStore Realtime Alert • Auto Generated Dispatch'}
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// -------------------------------------------------------------
// 1. APP PUBLISHED / UPDATED NOTIFICATION
// -------------------------------------------------------------
export async function sendAppPublishNotification({
  to,
  appName,
  appId,
  version,
  category,
  s3Key,
  size,
  releaseNotes,
  isUpdate = false,
}: {
  to?: string;
  appName: string;
  appId: string;
  version: string;
  category?: string;
  s3Key?: string;
  size?: string;
  releaseNotes?: string;
  isUpdate?: boolean;
}) {
  const recipients = to ? [to] : getOwnerEmails();
  const subject = isUpdate
    ? `🚀 [KatyalStore] Update Live: ${appName} (${version})`
    : `✨ [KatyalStore] App Published: ${appName} (${version})`;

  const actionText = isUpdate ? 'Application Update Deployed' : 'New Application Published';
  const badgeColor = '#FEF08A'; // Yellow

  const details = [
    { label: 'Application', value: appName, highlight: true },
    { label: 'Release Version', value: version },
    { label: 'Category', value: category || 'Developer / Utilities' },
    { label: 'Installer Size', value: size || 'N/A' },
    { label: 'S3 Target Key', value: s3Key || 'N/A' },
  ];

  if (releaseNotes) {
    details.push({ label: 'Release Notes', value: releaseNotes });
  }

  const html = renderNeoBrutalistEmailHtml({
    badge: isUpdate ? 'Version Update' : 'New App Live',
    badgeBg: badgeColor,
    title: `${appName} is Live on KatyalStore`,
    subtitle: actionText,
    details,
    buttonText: 'View on Live Store',
    buttonUrl: `${STORE_URL}/app/${appId}`,
    footerNote: 'Dispatched from KatyalStore Owner Dashboard',
  });

  const text = `${actionText}\n\nApp: ${appName}\nVersion: ${version}\nCategory: ${category}\nSize: ${size}\nS3 Key: ${s3Key}\n\nView app: ${STORE_URL}/app/${appId}`;

  await dispatchEmail({ recipients, subject, text, html });
}

// -------------------------------------------------------------
// 2. DOWNLOAD ACTIVITY NOTIFICATION
// -------------------------------------------------------------
export async function sendDownloadNotification({
  to,
  appName,
  appId,
  version,
  downloaderName,
  downloaderEmail,
  totalDownloads,
}: {
  to?: string;
  appName: string;
  appId: string;
  version?: string;
  downloaderName?: string;
  downloaderEmail?: string;
  totalDownloads?: number;
}) {
  const recipients = to ? [to] : getOwnerEmails();
  const subject = `📥 [KatyalStore] New Download: ${appName} (${downloaderName || 'Store Guest'})`;
  const badgeColor = '#86EFAC'; // Green

  const details = [
    { label: 'Application', value: appName, highlight: true },
    { label: 'Version', value: version || 'Latest' },
    { label: 'Downloaded By', value: downloaderName || 'Store Guest' },
    { label: 'User Email', value: downloaderEmail || 'N/A' },
    { label: 'Total Downloads', value: totalDownloads !== undefined ? `${totalDownloads}` : 'Incremented' },
    { label: 'Timestamp', value: new Date().toUTCString() },
  ];

  const html = renderNeoBrutalistEmailHtml({
    badge: 'Download Alert',
    badgeBg: badgeColor,
    title: `Someone downloaded ${appName}!`,
    subtitle: 'Store Catalog Activity',
    details,
    buttonText: 'Check App Analytics',
    buttonUrl: `${STORE_URL}/dashboard`,
    footerNote: 'KatyalStore Realtime Download Dispatch',
  });

  const text = `New Download on KatyalStore!\n\nApp: ${appName}\nUser: ${downloaderName} (${downloaderEmail})\nTotal Downloads: ${totalDownloads}\nTime: ${new Date().toUTCString()}`;

  await dispatchEmail({ recipients, subject, text, html });
}

// -------------------------------------------------------------
// 3. COMMUNITY REVIEW & RATING NOTIFICATION
// -------------------------------------------------------------
export async function sendReviewNotification({
  to,
  appName,
  appId,
  reviewerName,
  reviewerEmail,
  rating,
  title,
  content,
  totalReviews,
  averageRating,
  isEdit = false,
}: {
  to?: string;
  appName: string;
  appId?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  rating: number;
  title: string;
  content: string;
  totalReviews?: number;
  averageRating?: number;
  isEdit?: boolean;
}) {
  const recipients = to ? [to] : getOwnerEmails();
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(Math.max(0, 5 - Math.round(rating)));
  const subject = `💬 [KatyalStore] ${isEdit ? 'Review Updated' : 'New Review'}: ${appName} (${stars} ${rating.toFixed(1)})`;
  const badgeColor = '#93C5FD'; // Blue

  const details = [
    { label: 'Application', value: appName, highlight: true },
    { label: 'Rating Given', value: `${stars} (${rating.toFixed(1)} / 5.0)` },
    { label: 'Review Title', value: `"${title}"` },
    { label: 'Review Content', value: content },
    { label: 'Reviewer', value: `${reviewerName || 'Anonymous'} (${reviewerEmail || 'N/A'})` },
  ];

  if (averageRating !== undefined) {
    details.push({
      label: 'Store Avg Rating',
      value: `★ ${averageRating.toFixed(1)} (${totalReviews || 1} total reviews)`,
    });
  }

  const html = renderNeoBrutalistEmailHtml({
    badge: isEdit ? 'Review Updated' : 'New Review',
    badgeBg: badgeColor,
    title: `New review for ${appName}`,
    subtitle: `${stars} Rating from ${reviewerName || 'Community User'}`,
    details,
    buttonText: 'Read Reviews on Store',
    buttonUrl: appId ? `${STORE_URL}/app/${appId}` : STORE_URL,
    footerNote: 'KatyalStore Community Feedback System',
  });

  const text = `New Review on KatyalStore!\n\nApp: ${appName}\nRating: ${stars} (${rating}/5)\nTitle: "${title}"\nComment: ${content}\nBy: ${reviewerName} (${reviewerEmail})`;

  await dispatchEmail({ recipients, subject, text, html });
}

// -------------------------------------------------------------
// INTERNAL HELPER: DISPATCH VIA NODEMAILER OR LOG
// -------------------------------------------------------------
async function dispatchEmail({
  recipients,
  subject,
  text,
  html,
}: {
  recipients: string[];
  subject: string;
  text: string;
  html: string;
}) {
  if (recipients.length === 0) return;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: recipients.join(', '),
        subject,
        text,
        html,
      });
      console.log(`[KatyalStore EmailService] Dispatched email '${subject}' to ${recipients.join(', ')}`);
    } catch (err) {
      console.error('[KatyalStore EmailService] SMTP dispatch failed:', err);
    }
  } else {
    console.log(`[KatyalStore EmailService BYPASS] ${subject}\nTo: ${recipients.join(', ')}\n${text}`);
  }
}
