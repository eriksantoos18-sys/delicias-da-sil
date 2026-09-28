import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { cart, nome, telefone } = await req.json();
    
    for (const item of cart) {
  const { data: produto } = await supabase
    .from("produtos")
    .select("estoque")
    .eq("id", item.id)
    .single();

  if (!produto) {
    return Response.json(
      { error: "Produto não encontrado" },
      { status: 400 }
    );
  }

  if (item.quantity > produto.estoque) {
    return Response.json(
      {
        error: `${item.title} possui apenas ${produto.estoque} unidade(s) em estoque`,
      },
      { status: 400 }
    );
  }
}

    const total = cart.reduce(
      (acc: number, item: any) =>
        acc + item.price * item.quantity,
      0
    );

    const { data: pedido, error } = await supabase
      .from("pedidos")
      .insert([
        {
          nome,
          telefone,
          pedido: cart,
          total,
          status: "pendente",
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        external_reference: String(pedido.id),
        notification_url: "https://delicias-da-sil.vercel.app/api/webhook",

        items: cart.map((item: any, index: number) => ({
          id: String(index + 1),
          title: item.title,
          quantity: item.quantity,
          currency_id: "BRL",
          unit_price: item.price,
        })),
      },
    });

    return Response.json({
      id: response.id,
      init_point: response.init_point,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        error: "Erro ao criar pagamento",
      },
      {
        status: 500,
      }
    );
  }
}