import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ======================================================
// ENVIA WHATSAPP - PAGAMENTO APROVADO
// ======================================================

async function enviarWhatsapp(
  telefone: string,
  nome: string,
  pedidoId: number
) {
  // Remove espaços, +, -, parênteses etc.
  let numero = telefone.replace(/\D/g, "");

  // Adiciona código do Brasil somente se ainda não existir
  if (!numero.startsWith("55")) {
    numero = `55${numero}`;
  }

  console.log("ENVIANDO WHATSAPP PARA:", numero);

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

        to: numero,

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

  if (!response.ok) {
    console.error("ERRO AO ENVIAR WHATSAPP:", data);

    throw new Error(
      `Erro WhatsApp: ${JSON.stringify(data)}`
    );
  }

  return data;
}

// ======================================================
// WEBHOOK MERCADO PAGO
// ======================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK RECEBIDO:", body);

    // ID do pagamento enviado pelo Mercado Pago
    const paymentId = body?.data?.id;

    if (!paymentId) {
      return Response.json(
        {
          error: "Pagamento não encontrado",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // CONSULTA PAGAMENTO NO MERCADO PAGO
    // ==================================================

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const erroMP = await response.text();

      console.error(
        "ERRO AO CONSULTAR MERCADO PAGO:",
        erroMP
      );

      throw new Error(
        "Não foi possível consultar o pagamento"
      );
    }

    const payment = await response.json();

    console.log("PAGAMENTO:", payment);

    // ==================================================
    // SÓ CONTINUA SE O PAGAMENTO ESTIVER APROVADO
    // ==================================================

    if (payment.status !== "approved") {
      return Response.json({
        ok: true,
        status: payment.status,
      });
    }

    // ID do pedido salvo no external_reference
    const pedidoId = payment.external_reference;

    if (!pedidoId) {
      throw new Error(
        "Pagamento sem external_reference"
      );
    }

    // ==================================================
    // BUSCA PEDIDO NO SUPABASE
    // ==================================================

    const {
      data: pedido,
      error: erroPedido,
    } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedidoId)
      .single();

    if (erroPedido || !pedido) {
      console.error(
        "PEDIDO NÃO ENCONTRADO:",
        erroPedido
      );

      throw new Error("Pedido não encontrado");
    }

    // ==================================================
    // EVITA PROCESSAR O MESMO PAGAMENTO DUAS VEZES
    // ==================================================

    if (pedido.status === "pago") {
      console.log(
        "PEDIDO JÁ ESTAVA PAGO:",
        pedido.id
      );

      return Response.json({
        ok: true,
        status: "pedido_ja_processado",
      });
    }

    // ==================================================
    // BAIXA O ESTOQUE
    // ==================================================

    for (const item of pedido.pedido) {
      const {
        data: produto,
        error: erroProduto,
      } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", item.id)
        .single();

      console.log("ITEM:", item);
      console.log("PRODUTO:", produto);
      console.log("ERRO PRODUTO:", erroProduto);

      if (produto) {
        const novoEstoque =
          produto.estoque - item.quantity;

        const { error: erroEstoque } =
          await supabase
            .from("produtos")
            .update({
              estoque: novoEstoque,
            })
            .eq("id", item.id);

        if (erroEstoque) {
          console.error(
            "ERRO AO ATUALIZAR ESTOQUE:",
            erroEstoque
          );

          throw new Error(
            "Erro ao atualizar estoque"
          );
        }
      }
    }

    // ==================================================
    // ALTERA PEDIDO PARA PAGO
    // ==================================================

    const { error: erroStatus } =
      await supabase
        .from("pedidos")
        .update({
          status: "pago",
        })
        .eq("id", pedidoId);

    if (erroStatus) {
      console.error(
        "ERRO AO ATUALIZAR PEDIDO:",
        erroStatus
      );

      throw new Error(
        "Erro ao atualizar status do pedido"
      );
    }

    // ==================================================
    // ENVIA CONFIRMAÇÃO PELO WHATSAPP
    // ==================================================

    await enviarWhatsapp(
      pedido.telefone,
      pedido.nome,
      pedido.id
    );

    console.log(
      "PAGAMENTO PROCESSADO COM SUCESSO:",
      pedido.id
    );

    return Response.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "ERRO NO WEBHOOK:",
      error
    );

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

// ======================================================
// TESTE DA ROTA
// ======================================================

export async function GET() {
  return Response.json({
    ok: true,
  });
}