import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      appointmentRef, 
      customerName, 
      phone, 
      email, 
      service, 
      date, 
      time, 
      partsMethod, 
      budget, 
      delivery, 
      notes 
    } = data;

    const targetPhone = process.env.CALLMEBOT_PHONE || '16198914607';
    const apiKey = process.env.CALLMEBOT_API_KEY;

    const message = 
`🛠️ *NUEVA CITA PC - SD DEALS #${appointmentRef}*

👤 *Cliente:* ${customerName || 'Cliente'}
📱 *Teléfono:* ${phone || 'No especificado'}
✉️ *Email:* ${email || 'No especificado'}
🔧 *Servicio:* ${service || 'PC Service'}
📅 *Fecha:* ${date || 'Por acordar'} - ${time || ''}
⚙️ *Piezas:* ${partsMethod || 'No especificado'}
💵 *Presupuesto:* ${budget || 'Sin especificar'}
🚚 *Entrega:* ${delivery || 'Drop-off'}
📝 *Notas:* ${notes || 'Ninguna'}

_Solicitud de cita recibida en SD Deals_`;

    if (apiKey) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(targetPhone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(url);
      const resultText = await response.text();
      console.log('CallMeBot appointment response:', resultText);
      return NextResponse.json({ success: true, callmebot: resultText });
    }

    console.log('CallMeBot API key not configured yet. Prepared message:', message);
    return NextResponse.json({ 
      success: true, 
      warning: 'CALLMEBOT_API_KEY not configured in .env.local',
      messagePreview: message 
    });
  } catch (error) {
    console.error('Appointment notification error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
