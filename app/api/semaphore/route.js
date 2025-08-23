import { NextResponse } from "next/server";

const API_KEY = process.env.SEMAPHORE_API_KEY;

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, name = "Customer" } = body;

    // Check if the phone number is provided
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    // Debugging: Log the original phone number
    console.log("Original phone number:", phone);

    // Format the phone number to PH international format (+63)
    const formattedPhone = phone.replace(/^0/, "+63");

    // Debugging: Log the formatted phone number
    console.log("Formatted phone number:", formattedPhone);

    // Prepare the message
    const message = `Hi ${name}, your order has been placed! Thank you!`;

    // Send the SMS via Semaphore
    const response = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        apikey: API_KEY,
        number: formattedPhone,
        message,
        sendername: "SEMAPHORE", // Optional: replace with approved sender name
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Semaphore Error:", result);
      return NextResponse.json(
        { success: false, message: result.message || "Failed to send SMS." },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error sending SMS via Semaphore:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send SMS." },
      { status: 500 }
    );
  }
}
