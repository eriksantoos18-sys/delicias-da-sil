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
          name: "pedido_pronto_v2",
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
  const { pedidoId } = await req.json();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (!pedido) {
    return Response.json(
      { error: "Pedido não encontrado" },
      { status: 404 }
    );
  }

  await supabase
    .from("pedidos")
    .update({
      status: "pronto_retirada",
    })
    .eq("id", pedidoId);

  await enviarWhatsapp(
    pedido.telefone,
    pedido.nome,
    pedido.id
    );

  return Response.json({
    ok: true,
  });
}