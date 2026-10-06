import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const contactEmail = process.env.CONTACT_TO_EMAIL || "arhamforwork247@gmail.com";

// Simple in-memory rate limiter (5 req / IP / 10 min)
const rateLimit = new Map<string, { count: number, resetAt: number }>();

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    
    // Rate limit check
    let rlInfo = rateLimit.get(ip);
    if (!rlInfo || now > rlInfo.resetAt) {
      rlInfo = { count: 1, resetAt: now + windowMs };
    } else {
      rlInfo.count++;
    }
    rateLimit.set(ip, rlInfo);
    
    if (rlInfo.count > 5) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const formData = await request.formData();
    
    // Honeypot check
    if (formData.get("website")) {
      return NextResponse.json({ success: true });
    }

    const name = (formData.get('name') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const service = (formData.get('service') as string || 'General Enquiry').trim();
    const message = (formData.get('message') as string || '').trim();

    // Validation
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json({ error: 'Message must be between 10 and 2000 characters' }, { status: 400 });
    }

    // Dev mode without API key
    if (!resend) {
      console.error('RESEND_API_KEY missing');
      if (process.env.NODE_ENV !== 'production') {
        console.log('--- NEW CONTACT FORM SUBMISSION (DEV) ---');
        console.log(`Name: ${name}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`);
        console.log('-----------------------------------------');
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Service Unavailable' }, { status: 500 });
      }
    }

    if (!process.env.CONTACT_TO_EMAIL) {
      console.error('CONTACT_TO_EMAIL missing');
    }

    const pktOptions = { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'long' } as const;
    const pktTime = new Intl.DateTimeFormat('en-US', pktOptions).format(new Date());

    const textBody = `Name: ${name}\nEmail: ${email}\nService: ${service}\nMessage:\n${message}\n\nTime (PKT): ${pktTime}\n\nSent from arhamsuhail.dev contact form`;
    
    const htmlBody = `
      <h3>New Lead Details</h3>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Service:</strong> ${escapeHtml(service)}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(message)}</pre>
      <hr />
      <p><small>Time (PKT): ${escapeHtml(pktTime)}</small></p>
      <p><small>Sent from arhamsuhail.dev contact form</small></p>
    `;

    const fromAddress = process.env.CONTACT_FROM_EMAIL || "Arham Suhail <onboarding@resend.dev>";
    
    console.log(`Sending email...
RESEND_API_KEY defined: ${!!process.env.RESEND_API_KEY}
From: ${fromAddress}
To: ${contactEmail}`);

    const { error: resendError } = await resend.emails.send({
      from: fromAddress,
      to: [contactEmail],
      replyTo: email,
      subject: `New enquiry: ${service} from ${name}`,
      text: textBody,
      html: htmlBody,
    });

    if (resendError) {
      console.error(`Resend error object: name=${resendError.name}, message="${resendError.message}", statusCode=${(resendError as Error & { statusCode?: number; status?: number }).statusCode || (resendError as Error & { statusCode?: number; status?: number }).status}`);
      return NextResponse.json({ error: 'Failed to send message via Resend' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errObj = error as Error;
    console.error('Contact form error:', errObj.message || 'Unknown error');
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
