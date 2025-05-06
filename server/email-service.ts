import nodemailer from 'nodemailer';
import { SongRequest } from '@shared/schema';

// Configure nodemailer with Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify the connection configuration
transporter.verify(function (error: any, success: boolean) {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

/**
 * Send notification for a new song request to the admin
 */
export async function sendSongRequestNotification(songRequest: SongRequest): Promise<boolean> {
  try {
    // Format the email content
    const subject = 'New Song Request Received';
    const text = `
New song request details:

Song: ${songRequest.songName}
Artist: ${songRequest.artistName}
Requested by: ${songRequest.requesterName}
${songRequest.wishes ? `Wishes: ${songRequest.wishes}` : ''}
Status: ${songRequest.status}
Amount Paid: €${(songRequest.amount / 100).toFixed(2)}

Access your DJ dashboard to manage this request.
`;
    
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #333; border-bottom: 2px solid #00b4d8; padding-bottom: 10px;">New Song Request Received</h2>
  
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Song:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${songRequest.songName}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Artist:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${songRequest.artistName}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Requested by:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${songRequest.requesterName}</td>
    </tr>
    ${songRequest.wishes ? `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Wishes:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${songRequest.wishes}</td>
    </tr>` : ''}
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Status:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <span style="display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; background-color: #ffd166; color: #000;">
          ${songRequest.status.toUpperCase()}
        </span>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Amount Paid:</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">€${(songRequest.amount / 100).toFixed(2)}</td>
    </tr>
  </table>
  
  <div style="margin-top: 30px; text-align: center;">
    <a href="${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com/dashboard' : 'http://localhost:5000/dashboard'}" 
       style="display: inline-block; padding: 10px 20px; background-color: #00b4d8; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
      Go to DJ Dashboard
    </a>
  </div>
  
  <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
    This is an automated message from NoriuMuzikos. Please do not reply to this email.
  </p>
</div>
`;
    
    // Send the email to the admin (the Gmail account being used to send)
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL, // Admin's email is the same as the sender
      subject,
      text,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}
