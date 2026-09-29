import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { orderRef, customerName, phone, email, items, total, shipping, address } = data;

    const targetPhone = process.env.CALLMEBOT_PHONE || '16198914607';
    const apiKey = process.env.CALLMEBOT_API_KEY;

    const message = 
`🛍️ *NUEVO PEDIDO SD DEALS #${orderRef}*

👤 *Cliente:* ${customerName || 'Cliente'}
📱 *Teléfono:* ${phone || 'No especificado'}
✉️ *Email:* ${email || 'No especificado'}
📦 *Artículos:* ${items || 'Artículos de tienda'}
💵 *Total:* $${Number(total || 0).toFixed(2)}
🚚 *Método:* ${shipping || 'Shipping'}
📍 *Dirección:* ${address || 'San Diego, CA'}

_Pedido registrado automáticamente en SD Deals_`;

    if (apiKey) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(targetPhone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(url);
      const resultText = await response.text();
      console.log('CallMeBot notification response:', resultText);
      return NextResponse.json({ success: true, callmebot: resultText });
    }

    console.log('CallMeBot API key not configured yet. Payload prepared:', message);
    return NextResponse.json({ 
      success: true, 
      warning: 'CALLMEBOT_API_KEY not configured in .env.local',
      messagePreview: message 
    });
  } catch (error) {
    console.error('Order notification error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
