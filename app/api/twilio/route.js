import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, name = "Customer" } = body;

    // Check if the phone number is provided
    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required." }, { status: 400 });
    }

    // Debugging: Log the original phone number
    console.log("Original phone number:", phone);

    // Format the phone number to be in the correct format for the Philippines (+63 for local numbers)
    const formattedPhone = phone.replace(/^0/, "+63");

    // Debugging: Log the formatted phone number
    console.log("Formatted phone number:", formattedPhone);

    // Send the SMS
    const message = await client.messages.create({
      body: `Hi ${name}, your order has been placed! Thank you!`,
      from: fromNumber,
      to: formattedPhone,
    });

    // Return success response
    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error) {
    // Log detailed error for debugging
    console.error("Twilio Error:", error);

    // Handle specific Twilio errors
    if (error.code === 21608) {
      return NextResponse.json({
        success: false,
        message: "The 'To' phone number is not in an eligible region for your Twilio phone number.",
      }, { status: 400 });
    }

    // Catch-all error handler for other failures
    return NextResponse.json({ success: false, message: "Failed to send SMS." }, { status: 500 });
  }
}
