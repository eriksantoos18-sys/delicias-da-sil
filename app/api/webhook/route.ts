import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function enviarWhatsapp(
  telefone: string,
  nome: string,
  pedidoId: number
) {
  const numero = telefone.replace(/\D/g, "");

  const response = await fetch(
    `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `55${numero}`,
        type: "template",
        template: {
          name: "pagamento_aprovado",
          language: {
            code: "pt_BR",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: nome,
                },
                {
                  type: "text",
                  text: String(pedidoId),
                },
              ],
            },
          ],
        },
      }),
    }
  );

  const data = await response.json();

  console.log("WHATSAPP STATUS:", response.status);
  console.log("WHATSAPP RESPOSTA:", data);
}



export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(body);

    const paymentId = body?.data?.id;

    if (!paymentId) {
      return Response.json({ error: "Pagamento não encontrado" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await response.json();
    if (payment.status !== "approved") {
  return Response.json({
    ok: true,
    status: payment.status,
  });
}

    console.log(payment);

    const pedidoId = payment.external_reference;

    const { data: pedido } = await supabase
  .from("pedidos")
  .select("*")
  .eq("id", pedidoId)
  .single();

   if (pedido?.status !== "pago") {

  for (const item of pedido.pedido) {

    const { data: produto, error } = await supabase
  .from("produtos")
  .select("*")
  .eq("id", item.id)
  .single();

console.log("ITEM:", item);
console.log("PRODUTO:", produto);
console.log("ERRO:", error);

    if (produto) {
      await supabase
        .from("produtos")
        .update({
          estoque: produto.estoque - item.quantity,
        })
        .eq("id", item.id);
    }
  }

  await supabase
    .from("pedidos")
    .update({
      status: "pago",
    })
    .eq("id", pedidoId);

const itens = pedido.pedido
  .map((item: any) => `• ${item.quantity}x ${item.title}`)
  .join("\n");
  await enviarWhatsapp(
  pedido.telefone,
  pedido.nome,
  pedido.id,
  );
}

    return Response.json({
      ok: true,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        error: "erro webhook",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return Response.json({
    ok: true,
  });
}