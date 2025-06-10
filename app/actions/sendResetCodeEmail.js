'use server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetCodeEmail(email, name, code) {
  try {
    await resend.emails.send({
      from: 'TheCorner <no-reply@thecornerfoodplaza.me>',
      to: email,
      subject: 'Reset your TheCorner password',
      html: `
        <p>Hi ${name || 'there'},</p>
        <p>Here is your password reset code:</p>
        <h2>${code}</h2>
        <p>If you did not request a password reset, you can ignore this message.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Reset email failed:', error);
    return { error: 'Failed to send reset email.' };
  }
}
