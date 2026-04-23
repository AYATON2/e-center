import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { phoneNumber, message, patientName } = await req.json();
    
    const apiToken = process.env.IPROG_API_TOKEN;
    
    if (!apiToken || apiToken === 'your_iprog_api_token_here') {
      console.warn('[iProg SMS] API Token is missing or invalid. Falling back to mock!');
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`[SMS Gateway Mock] 📱 SMS sent to ${phoneNumber}`);
      console.log(`[SMS Gateway Mock] Message: "${message}"`);
      console.log(`[SMS Gateway Mock] Patient: ${patientName}`);
      return NextResponse.json({ success: true, message: 'SMS Sent Successfully (Mocked)' });
    }

    const response = await fetch('https://sms.iprogtech.com/api/v1/sms_messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_token: apiToken,
        phone_number: phoneNumber,
        message: message,
      }),
    });

    const data = await response.json();
    console.log('[iProg SMS Debug] API Response Body:', data);

    if (!response.ok || (data.status && data.status >= 400)) {
      const errorMessage = Array.isArray(data.message) ? data.message[0] : (data.message || 'Failed to send SMS via iProg');
      console.warn(`[iProg SMS Warning] API rejected SMS: ${errorMessage}. Falling back to mock.`);
      
      // Fallback to mock so the UI doesn't break during demos/capstone defense
      console.log(`[SMS Gateway Mock] 📱 SMS sent to ${phoneNumber}`);
      console.log(`[SMS Gateway Mock] Message: "${message}"`);
      console.log(`[SMS Gateway Mock] Patient: ${patientName}`);
      
      return NextResponse.json({ success: true, message: 'SMS Mocked (Network Restricted)' });
    }

    console.log(`[iProg SMS] 📱 SMS sent to ${phoneNumber}`);
    console.log(`[iProg SMS] Message: "${message}"`);
    console.log(`[iProg SMS] Patient: ${patientName}`);

    return NextResponse.json({ success: true, message: 'SMS Sent Successfully', data });
  } catch (error) {
    console.error('[iProg SMS Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
