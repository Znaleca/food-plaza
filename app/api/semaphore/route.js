import { NextResponse } from "next/server";

const API_KEY = process.env.SEMAPHORE_API_KEY;

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, name = "Customer" } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    // Format phone → PH (+63)
    const formattedPhone = phone.replace(/^0/, "+63");

    const message = `Hi ${name}, your order has been placed! Thank you!`;

    const response = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        apikey: API_KEY,
        number: formattedPhone,
        message,
        sendername: "TheCorner", // must be approved sender name
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

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error sending SMS via Semaphore:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send SMS." },
      { status: 500 }
    );
  }
}
