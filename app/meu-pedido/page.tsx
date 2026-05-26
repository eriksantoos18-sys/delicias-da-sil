"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

interface Pedido {
  id: number;
  nome: string;
  telefone: string;
  total: number;
  status: string;
  entregue: boolean;
  pedido: any[];
}

export default function MeuPedidoPage() {
  const [pedidoId, setPedidoId] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchOrders() {

  if (!phone.trim()) {
    alert("Digite seu telefone");
    return;
  }

  if (phone.length < 15) {
    alert("Digite o telefone completo.");
    return;
  }

  setLoading(true);

  const { data } = await supabase
    .from("pedidos")
    .select("*")
    .eq("id", Number(pedidoId))
    .eq("telefone", phone)
    .order("id", { ascending: false });

  console.log(data);

  if (data) {
    setOrders(data);
  }

  setLoading(false);
}

  function getStatusColor(status: string) {
    switch (status) {
      case "pago":
        return "bg-green-500";

      case "preparando":
        return "bg-yellow-500";

      case "saiu_entrega":
        return "bg-blue-500";

      case "entregue":
        return "bg-gray-700";

      default:
        return "bg-orange-500";
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f1e7] p-6">

      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl p-6">

          <h1 className="text-3xl font-bold text-[#4b2e2e] mb-2">
            Acompanhar Pedido 🍰
          </h1>

          <p className="text-gray-500 mb-6">
            Digite seu telefone para visualizar seus pedidos.
          </p>

          <div className="flex gap-3">


            <input
  type="number"
  placeholder="Número do pedido"
  value={pedidoId}
  onChange={(e) => setPedidoId(e.target.value)}
  className="w-full"
/>

            <input
  type="tel"
  placeholder="(82) 91234-5678"
  required
  value={phone}
  maxLength={15}
  onChange={(e) => {

    let value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 11);

    value = value.replace(
      /^(\d{2})(\d)/g,
      "($1) $2"
    );

    value = value.replace(
      /(\d{5})(\d)/,
      "$1-$2"
    );

    setPhone(value);
  }}
  className="w-full"
/>

            <button
              onClick={searchOrders}
              className="bg-[#4b2e2e] text-white px-6 rounded-2xl font-semibold"
            >
              Buscar
            </button>

          </div>

        </div>

        <div className="mt-6 space-y-5">

          {loading && (
            <div className="text-center text-gray-500">
              Carregando pedidos...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              Nenhum pedido encontrado.
            </div>
          )}

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-white rounded-3xl shadow-lg p-6"
            >

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-xl font-bold text-[#4b2e2e]">
                    Pedido #{order.id}
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    Cliente: {order.nome}
                  </p>

                </div>

                <span
  className={`${getStatusColor(
    order.entregue
      ? "entregue"
      : order.status
  )} text-white px-4 py-2 rounded-full font-semibold capitalize`}
>
  {order.entregue
    ? "Entregue"
    : order.status}
</span>

              </div>

              <div className="space-y-3 mb-5">

                {order.pedido.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#f8f1e7] rounded-2xl px-4 py-3"
                  >

                    <div>

                      <p className="font-semibold">
                        {item.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        Quantidade: {item.quantity}
                      </p>

                    </div>

                    <p className="font-bold text-pink-600">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>

                  </div>

                ))}

              </div>

              <div className="border-t pt-4 flex justify-between text-xl font-bold">

                <span>Total</span>

                <span className="text-[#4b2e2e]">
                  R$ {order.total.toFixed(2)}
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}