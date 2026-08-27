export interface EmailAgencyInfo {
  name: string;
  logoUrl?: string | null;
  brandColor?: string;
  supportEmail?: string | null;
}

export function generateInvitationEmailHtml(params: {
  clientName: string;
  agency: EmailAgencyInfo;
  onboardingUrl: string;
}): string {
  const brandColor = params.agency.brandColor || '#3B82F6';
  const logoHtml = params.agency.logoUrl 
    ? `<img src="${params.agency.logoUrl}" alt="${params.agency.name}" style="max-height: 48px; margin-bottom: 20px;" />`
    : `<h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 700;">${params.agency.name}</h2>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${params.agency.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #374151;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #E5E7EB;">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 24px 36px; text-align: center; border-bottom: 1px solid #F3F4F6;">
              ${logoHtml}
              <h1 style="margin: 0; color: #111827; font-size: 22px; font-weight: 600;">Welcome! Let's get your project ready</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #374151;">Hi <strong>${params.clientName}</strong>,</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #4B5563;">
                We are thrilled to partner with you! To ensure a smooth, high-impact kickoff and get our team working on your deliverables right away, please complete your project onboarding.
              </p>
              
              <div style="background-color: #F3F4F6; border-radius: 8px; padding: 18px 20px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; font-weight: 600;">What you'll complete (~5 mins):</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 22px;">
                  <li>Quick project goals & target audience questionnaire</li>
                  <li>Upload brand assets, logos & materials</li>
                  <li>Upload signed agreement / contract</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 24px 0;">
                    <a href="${params.onboardingUrl}" target="_blank" style="display: inline-block; background-color: ${brandColor}; color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      Start Project Onboarding &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #9CA3AF; text-align: center;">
                No login required. You can save your progress and return anytime using this link.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #F9FAFB; border-top: 1px solid #F3F4F6; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #6B7280;">
                Sent on behalf of <strong>${params.agency.name}</strong>${params.agency.supportEmail ? ` &bull; Questions? Reply to <a href="mailto:${params.agency.supportEmail}" style="color: ${brandColor};">${params.agency.supportEmail}</a>` : ''}
              </p>
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

export function generateReminderEmailHtml(params: {
  clientName: string;
  agency: EmailAgencyInfo;
  onboardingUrl: string;
  customMessage?: string | null;
}): string {
  const brandColor = params.agency.brandColor || '#3B82F6';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gentle Reminder: Onboarding with ${params.agency.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #374151;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #E5E7EB;">
          <tr>
            <td style="padding: 32px 36px; text-align: center; border-bottom: 1px solid #F3F4F6;">
              <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 20px; font-weight: 700;">${params.agency.name}</h2>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">Quick reminder regarding your project kickoff</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #374151;">Hi <strong>${params.clientName}</strong>,</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #4B5563;">
                ${params.customMessage || `We are eager to kick off your project with ${params.agency.name}! We noticed your onboarding checklist is still pending.`}
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 22px; color: #4B5563;">
                Completing your onboarding ensures our designers and developers have everything required to hit your target milestones on time without delays.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 24px 0;">
                    <a href="${params.onboardingUrl}" target="_blank" style="display: inline-block; background-color: ${brandColor}; color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      Resume Onboarding &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #F9FAFB; border-top: 1px solid #F3F4F6; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #6B7280;">
                Sent by ${params.agency.name} using OnboardFlow.
              </p>
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

export function generateCompletionNotificationHtml(params: {
  clientName: string;
  clientCompany?: string | null;
  agencyName: string;
  dashboardUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Onboarding Completed</title>
</head>
<body style="margin: 0; padding: 30px; font-family: sans-serif; background-color: #F9FAFB; color: #111827;">
  <div style="max-width: 580px; margin: 0 auto; background: #FFF; padding: 32px; border-radius: 12px; border: 1px solid #E5E7EB;">
    <h2 style="color: #10B981; margin-top: 0;">🎉 New Client Onboarding Completed!</h2>
    <p style="font-size: 16px; color: #374151;">
      <strong>${params.clientName}</strong> ${params.clientCompany ? `(${params.clientCompany})` : ''} has just finished submitting their onboarding requirements.
    </p>
    <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-weight: 600; font-size: 14px;">Next steps:</p>
      <p style="margin: 0; font-size: 14px; color: #4B5563;">
        An AI Executive Summary and structured Project Brief have been generated automatically.
      </p>
    </div>
    <a href="${params.dashboardUrl}" style="display: inline-block; background-color: #111827; color: #FFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
      View Client & AI Project Brief &rarr;
    </a>
  </div>
</body>
</html>
`;
}
