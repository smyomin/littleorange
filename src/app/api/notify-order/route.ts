import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { order, storeEmail } = await req.json()

    if (!storeEmail || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: 'Missing config' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const items = order.items
      .map((i: { name: string; quantity: number; price: number }) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #F0E0CC;">${i.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #F0E0CC;text-align:center;">x${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #F0E0CC;text-align:right;font-weight:700;">NZ$${(i.price * i.quantity).toFixed(2)}</td>
        </tr>`
      )
      .join('')

    await resend.emails.send({
      from: 'Little Orange <onboarding@resend.dev>',
      to: storeEmail,
      subject: `🍊 New Order ${order.order_number} — NZ$${order.total.toFixed(2)}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#FFFBF5;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:48px;">🍊</span>
            <h1 style="font-size:24px;font-weight:900;color:#1C1917;margin:8px 0 4px;">New Order Received!</h1>
            <p style="color:#78716C;font-size:14px;">Order <strong style="color:#F97316;">${order.order_number}</strong></p>
          </div>
          <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1.5px solid #F0E0CC;">
            <h2 style="font-size:14px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Customer</h2>
            <p style="margin:4px 0;font-size:14px;color:#1C1917;"><strong>${order.customer_name}</strong></p>
            <p style="margin:4px 0;font-size:13px;color:#78716C;">${order.customer_email}</p>
            <p style="margin:4px 0;font-size:13px;color:#78716C;">${order.customer_phone || 'No phone'}</p>
            <p style="margin:4px 0;font-size:13px;color:#78716C;">${order.delivery_address}</p>
          </div>
          <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1.5px solid #F0E0CC;">
            <h2 style="font-size:14px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Items</h2>
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1C1917;">
              ${items}
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#78716C;" colspan="2">Delivery fee</td>
                <td style="padding:10px 0;text-align:right;color:#78716C;">NZ$${order.delivery_fee.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-weight:900;font-size:15px;" colspan="2">Total</td>
                <td style="padding:10px 0;text-align:right;font-weight:900;font-size:15px;color:#F97316;">NZ$${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <div style="background:white;border-radius:12px;padding:20px;border:1.5px solid #F0E0CC;">
            <h2 style="font-size:14px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Payment</h2>
            <p style="font-size:14px;color:#1C1917;">${order.payment_method === 'cash' ? '💵 Cash on delivery' : '🏦 Bank transfer on delivery'}</p>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" style="background:#F97316;color:white;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
              View in Admin Dashboard
            </a>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}