import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { phoneNumber, message, patientName } = await req.json();
    
    // Simulate SMS Provider (e.g. Twilio) delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[SMS Gateway Mock] 📱 SMS sent to ${phoneNumber}`);
    console.log(`[SMS Gateway Mock] Message: "${message}"`);
    console.log(`[SMS Gateway Mock] Patient: ${patientName}`);

    return NextResponse.json({ success: true, message: 'SMS Sent Successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
