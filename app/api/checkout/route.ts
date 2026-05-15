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

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: cart.map((item: any, index: number) => ({
          id: String(index + 1),
          title: item.title,
          quantity: item.quantity,
          currency_id: "BRL",
          unit_price: item.price,
        })),
      },
    });
await supabase.from("pedidos").insert([
  {
    nome,
    telefone,
    pedido: cart,
    total: cart.reduce(
      (acc: number, item: any) =>
        acc + item.price * item.quantity,
      0
    ),
    status: "pendente",
  },
]);
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