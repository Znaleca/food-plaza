import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const isTrial = process.env.TWILIO_ACCOUNT_IS_TRIAL === "true";  // Flag to check if the account is in trial mode

const client = twilio(accountSid, authToken);

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, name = "Customer" } = body;

    // Check if the phone number is provided
    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required." }, { status: 400 });
    }

    // Log the original phone number
    console.log("Original phone number:", phone);

    // Format the phone number to be in the correct format for the Philippines (+63 for local numbers)
    const formattedPhone = phone.replace(/^0/, "+63");

    // Log the formatted phone number
    console.log("Formatted phone number:", formattedPhone);

    // Simulate Trial Mode - Skip SMS sending during trial, but log it for test purposes
    if (isTrial) {
      console.log(`Trial mode enabled. Message would be sent to ${formattedPhone}`);
      return NextResponse.json({
        success: true,
        message: "Simulated SMS sent in trial mode",
        phone: formattedPhone
      });
    }

    // Send the SMS (only if not in trial mode)
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

    // Handle specific Twilio errors (e.g., 21608 - phone number unverified)
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
