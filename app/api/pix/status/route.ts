export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId");

    if (!paymentId || !/^\d+$/.test(paymentId)) {
      return Response.json(
        { error: "Identificador de pagamento inválido." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Erro ao consultar pagamento:",
        response.status
      );

      return Response.json(
        { error: "Não foi possível consultar o pagamento." },
        { status: 502 }
      );
    }

    const payment = await response.json();

    if (
      payment.payment_method_id !== "pix" ||
      !payment.external_reference
    ) {
      return Response.json(
        { error: "Pagamento inválido." },
        { status: 400 }
      );
    }

    return Response.json(
      { status: payment.status },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao verificar Pix:", error);

    return Response.json(
      { error: "Erro ao verificar pagamento." },
      { status: 500 }
    );
  }
}