import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(req: NextRequest) {
  console.log('API route hit');

  try {
    const { to, subject, text } = await req.json();

    // Eliminar direcciones de correo duplicadas
    const uniqueEmails = [...new Set(to)];

    const msg = {
      to: uniqueEmails, // Usamos el array de correos filtrado
      from: process.env.NEXT_PUBLIC_SHOP_OWNER_EMAIL, // Dirección desde la que envías el correo
      subject,
      text,
    };

    // Enviar el correo usando SendGrid
    await sgMail.send(msg);
    return NextResponse.json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error.response?.body || error.message);
    return NextResponse.json({ error: 'Error al enviar el correo', details: error.message }, { status: 500 });
  }
}
