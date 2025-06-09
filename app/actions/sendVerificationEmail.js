'use server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email, name, code) {
  try {
    await resend.emails.send({
      from: 'TheCorner <no-reply@thecornerfoodplaza.me>', // ✅ your domain here
      to: email,
      subject: 'Verify your TheCorner account',
      html: `
        <p>Hi ${name},</p>
        <p>Here is your verification code:</p>
        <h2>${code}</h2>
        <p>If you did not request this, please ignore.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    return { error: 'Failed to send verification email.' };
  }
}
