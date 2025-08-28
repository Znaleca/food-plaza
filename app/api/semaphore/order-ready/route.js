import { NextResponse } from "next/server";

const API_KEY = process.env.SEMAPHORE_API_KEY;

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, message } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required." },
        { status: 400 }
      );
    }

    // Send SMS via Semaphore
    const resp = await fetch("https://semaphore.co/api/v4/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        apikey: API_KEY,
        number: phone,
        message: message,
        sendername: "TheCorner", // <- customize sender name
      }),
    });

    const result = await resp.json();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Semaphore error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send SMS" },
      { status: 500 }
    );
  }
}
