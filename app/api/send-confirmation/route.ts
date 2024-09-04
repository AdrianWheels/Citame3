import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(req: NextRequest) {
  console.log('API route hit');

  try {
    const { to, subject, text }: { to: string[], subject: string, text: string } = await req.json();
    
    const msg: sgMail.MailDataRequired = {
      to :"tucorreo@gmail.com", // Usamos el array original sin modificar
      from: process.env.NEXT_PUBLIC_SHOP_OWNER_EMAIL || '', 
      subject,
      text,
    };

    // Enviar el correo usando SendGrid
    await sgMail.send(msg);
    return NextResponse.json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', (error as any)?.response?.body || (error as Error).message);
    return NextResponse.json({ error: 'Error al enviar el correo', details: (error as Error).message }, { status: 500 });
  }
}
