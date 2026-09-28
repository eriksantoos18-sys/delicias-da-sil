import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const URL_MERCADO_PAGO =
  "https://api.mercadopago.com/v1/payments";

const URL_WEBHOOK =
  "https://delicias-da-sil.vercel.app/api/webhook";

export async function POST(req: Request) {
  try {
    const {
      cart,
      nome,
      telefone,
      email,
      cpf,
      idempotencyKey,
    } = await req.json();

    const cpfLimpo = String(cpf || "").replace(/\D/g, "");
    const telefoneLimpo = String(telefone || "").replace(/\D/g, "");
    const nomeLimpo = String(nome || "").trim();
    const emailLimpo = String(email || "").trim();

    // VALIDA OS DADOS

    if (
  typeof idempotencyKey !== "string" ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    idempotencyKey
  )
) {
      return Response.json(
        { error: "Chave de pagamento inválida." },
        { status: 400 }
      );
    }

    if (
      !nomeLimpo ||
      !/^\d{11}$/.test(telefoneLimpo) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo) ||
      cpfLimpo.length !== 11 ||
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return Response.json(
        { error: "Confira os dados do cliente e do pedido." },
        { status: 400 }
      );
    }

    const ids = new Set<number>();

    for (const item of cart) {
      if (
        !Number.isSafeInteger(item.id) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        ids.has(item.id)
      ) {
        return Response.json(
          { error: "Carrinho inválido." },
          { status: 400 }
        );
      }

      ids.add(item.id);
    }

    const chavePagamento = idempotencyKey;

    // PROCURA UM PEDIDO JÁ CRIADO

    const { data: existente, error: erroConsulta } =
      await supabase
        .from("pedidos")
        .select(
          "id, nome, telefone, pedido, total, status, payment_id"
        )
        .eq("idempotency_key", chavePagamento)
        .maybeSingle();

    if (erroConsulta) {
      throw new Error("Erro ao consultar pedido existente.");
    }

    let pedido = existente;

    if (pedido) {
      // IMPEDE REUTILIZAR A CHAVE COM OUTRA COMPRA

      const itensAnteriores = pedido.pedido as {
        id: number;
        quantity: number;
      }[];

      const mesmoCarrinho =
        itensAnteriores.length === cart.length &&
        itensAnteriores.every((anterior) =>
          cart.some(
            (atual: { id: number; quantity: number }) =>
              atual.id === anterior.id &&
              atual.quantity === anterior.quantity
          )
        );

      if (
        !mesmoCarrinho ||
        pedido.nome !== nomeLimpo ||
        String(pedido.telefone).replace(/\D/g, "") !==
          telefoneLimpo
      ) {
        return Response.json(
          {
            error:
              "Esta chave pertence a outra compra. Volte à loja para iniciar um novo pedido.",
          },
          { status: 409 }
        );
      }

      if (pedido.status !== "pendente") {
        return Response.json(
          {
            error:
              "Este pedido já foi processado. Consulte seus pedidos.",
          },
          { status: 409 }
        );
      }
    } else {
      // CONFERE PREÇOS E ESTOQUE NO SUPABASE

      const itens: {
        id: number;
        title: string;
        price: number;
        quantity: number;
        image: string | null;
      }[] = [];

      for (const item of cart) {
        const { data: produto, error } = await supabase
          .from("produtos")
          .select("id, nome, preco, estoque, imagem")
          .eq("id", item.id)
          .single();

        if (error || !produto) {
          return Response.json(
            { error: "Produto não encontrado." },
            { status: 400 }
          );
        }

        if (item.quantity > produto.estoque) {
          return Response.json(
            {
              error: `Estoque insuficiente: ${produto.nome}`,
            },
            { status: 400 }
          );
        }

        itens.push({
          id: produto.id,
          title: produto.nome,
          price: Number(produto.preco),
          quantity: item.quantity,
          image: produto.imagem,
        });
      }

      const totalCentavos = itens.reduce(
        (soma, item) =>
          soma +
          Math.round(item.price * 100) * item.quantity,
        0
      );

      if (totalCentavos <= 0) {
        return Response.json(
          { error: "Valor do pedido inválido." },
          { status: 400 }
        );
      }

      // CRIA O PEDIDO COM CHAVE ÚNICA

      const { data: novoPedido, error: erroPedido } =
        await supabase
          .from("pedidos")
          .insert({
            nome: nomeLimpo,
            telefone: telefoneLimpo,
            pedido: itens,
            total: totalCentavos / 100,
            status: "pendente",
            idempotency_key: chavePagamento,
          })
          .select(
            "id, nome, telefone, pedido, total, status, payment_id"
          )
          .single();

      if (erroPedido) {
        // SE OUTRA REQUISIÇÃO CRIOU O MESMO PEDIDO
        if (erroPedido.code === "23505") {
          return Response.json(
            {
              error:
                "O Pix está sendo gerado. Aguarde alguns segundos e tente novamente.",
            },
            { status: 409 }
          );
        }

        console.error("Erro ao criar pedido:", erroPedido);
        throw new Error("Não foi possível registrar o pedido.");
      }

      pedido = novoPedido;
    }

    if (!pedido) {
      throw new Error("Pedido não encontrado.");
    }

    // RECUPERA O PAGAMENTO OU SOLICITA O PIX
    // A MESMA CHAVE É USADA EM TODAS AS TENTATIVAS

    let respostaMP: Response;

    if (pedido.payment_id) {
      respostaMP = await fetch(
        `${URL_MERCADO_PAGO}/${pedido.payment_id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
          cache: "no-store",
        }
      );
    } else {
      respostaMP = await fetch(URL_MERCADO_PAGO, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": chavePagamento,
        },
        body: JSON.stringify({
          transaction_amount: Number(pedido.total),
          description: `Delícias da Sil - Pedido ${pedido.id}`,
          payment_method_id: "pix",
          external_reference: String(pedido.id),
          notification_url: URL_WEBHOOK,
          payer: {
            email: emailLimpo,
            identification: {
              type: "CPF",
              number: cpfLimpo,
            },
          },
        }),
      });
    }

    const pagamento = await respostaMP.json();

    if (!respostaMP.ok) {
      console.error("Erro Mercado Pago:", pagamento);

      return Response.json(
        {
          error:
            "Não foi possível gerar ou recuperar o Pix. Tente novamente.",
        },
        { status: 502 }
      );
    }

    // CONFERE SE O PAGAMENTO É DESTE PEDIDO

    if (
      String(pagamento.external_reference) !==
        String(pedido.id) ||
      pagamento.payment_method_id !== "pix" ||
      Math.round(Number(pagamento.transaction_amount) * 100) !==
        Math.round(Number(pedido.total) * 100)
    ) {
      console.error(
        "Dados do pagamento não correspondem ao pedido:",
        pedido.id
      );

      return Response.json(
        { error: "Dados do pagamento divergentes." },
        { status: 409 }
      );
    }

    // GUARDA O ID DO PAGAMENTO

    const { error: erroAtualizacao } = await supabase
      .from("pedidos")
      .update({
        payment_id: String(pagamento.id),
      })
      .eq("id", pedido.id)
      .or(
        `payment_id.is.null,payment_id.eq.${String(pagamento.id)}`
      );

    if (erroAtualizacao) {
      console.error(
        "Erro ao salvar ID do pagamento:",
        erroAtualizacao
      );

      throw new Error("Não foi possível salvar o pagamento.");
    }

    // RETORNA O QR CODE

    const dadosPix =
      pagamento.point_of_interaction?.transaction_data;

    if (!dadosPix?.qr_code) {
      return Response.json(
        {
          error:
            "O Mercado Pago não retornou o código Pix. Verifique se o pagamento ainda está disponível.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      pedidoId: pedido.id,
      paymentId: pagamento.id,
      total: Number(pedido.total),
      qrCode: dadosPix.qr_code,
      qrCodeBase64: dadosPix.qr_code_base64,
      status: pagamento.status,
    });
  } catch (error) {
    console.error("Erro ao gerar Pix:", error);

    return Response.json(
      { error: "Erro ao gerar pagamento Pix." },
      { status: 500 }
    );
  }
}