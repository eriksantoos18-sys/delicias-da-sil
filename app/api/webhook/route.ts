import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(body);

    const pedidoId = body?.data?.id;

    await supabase
      .from("pedidos")
      .update({
        status: "pago",
      })
      .eq("id", pedidoId);

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