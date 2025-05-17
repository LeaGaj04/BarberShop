import type { APIRoute } from 'astro';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const prerender = false;

const client = new MercadoPagoConfig({
  accessToken: 'TEST-5212547685703774-051620-52a2d2364ac33c29ddc1e5cf19c87b41-1576728159',
  options: { timeout: 5000 }
});

const preference = new Preference(client);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { service, email, cardToken } = await request.json();

    const abono = service.price / 2;
    const items = [
      {
        id: service.id,
        title: service.name,
        quantity: 1,
        unit_price: service.price
      }
    ];
    const body = {
      items,
      payer: { email },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: []
      },
      back_urls: {
        success: import.meta.env.SITE + '/success',
        failure: import.meta.env.SITE + '/failure',
        pending: import.meta.env.SITE + '/pending'
      },
      auto_return: 'approved'
    };

    const requestOptions = {
      idempotencyKey: `barber-${service.id}-${Date.now()}`
    };

    const response = await preference.create({ body, requestOptions });
    const { init_point } = response;

    return new Response(JSON.stringify({ init_point }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Error en create-order:', err);
    return new Response(
      JSON.stringify({ error: err.message ?? 'Error interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
