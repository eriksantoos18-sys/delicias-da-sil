"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Pedido {
  id: number;
  nome: string;
  telefone: string;
  total: number;
  status: string;
  entregue: boolean;
  pedido: any[];
  created_at: string;
}

export default function AdminPage() {

  const [orders, setOrders] =
    useState<Pedido[]>([]);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [isOpen, setIsOpen] =
    useState(true);

  const [lastOrderCount, setLastOrderCount] =
     useState(0);

useEffect(() => {

  let channel: any;

  supabase.auth.getSession().then(({ data }) => {

    if (data.session) {

      setAuthenticated(true);

      loadOrders();
      loadStoreStatus();

      channel = supabase
        .channel("pedidos-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "pedidos",
          },
          (payload) => {

            loadOrders();

            if (payload.eventType === "INSERT") {

              const audio = new Audio("/notification.mp3");

              audio.play().catch(() => {
                console.log(
                  "Som bloqueado até interação do usuário"
                );
              });

            }
          }
        )
        .subscribe();

    }

  });

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };

}, []);

  async function loadOrders() {

    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (data) {
      setOrders(data);
    }
  }

  async function loadStoreStatus() {

    const { data } = await supabase
      .from("configuracoes")
      .select("loja_aberta")
      .eq("id", 1)
      .single();

    if (data) {
      setIsOpen(data.loja_aberta);
    }
  }

  async function toggleStore() {

  const newStatus = !isOpen;

  const { error } = await supabase
    .from("configuracoes")
    .update({
      loja_aberta: newStatus,
    })
    .eq("id", 1);

  if (error) {

    console.log(error);

    alert(error.message);

    return;
  }

  setIsOpen(newStatus);
}

  async function updateStatus(
  id: number,
  status: string
) {

  console.log("ID:", id);
  console.log("STATUS:", status);

  const { data, error } = await supabase
    .from("pedidos")
    .update({ status })
    .eq("id", id)
    .select();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  loadOrders();
}

  async function marcarPronto(id: number) {

  const response = await fetch(
    "/api/pedido-pronto",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pedidoId: id,
      }),
    }
  );

  if (response.ok) {

  await supabase
    .from("pedidos")
    .update({
      status: "pronto_retirada",
    })
    .eq("id", id);

  alert("Cliente avisado com sucesso!");

  loadOrders();

} else {
    alert("Erro ao enviar WhatsApp");
  }
}

  function getStatusColor(
    status: string
  ) {

    switch (status) {

  case "pago":
    return "bg-green-500";

  case "pronto_retirada":
    return "bg-yellow-500";

  case "entregue":
    return "bg-gray-700";

  default:
    return "bg-orange-500";
}
  }

  async function login() {

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    alert("Email ou senha inválidos");
    return;
  }

  setAuthenticated(true);

  loadOrders();
  loadStoreStatus();
}
async function logout() {
  await supabase.auth.signOut();

  setAuthenticated(false);

  setEmail("");
  setPassword("");
}
  function imprimirPedido(order: Pedido) {
  const conteudo = `
    <html>
      <body style="font-family: Arial; padding: 20px;">
        <h1>Pedido #${order.id}</h1>

        <p>Cliente: ${order.nome}</p>
        <p>Telefone: ${order.telefone}</p>

        <hr>

        ${order.pedido
          .map(
            (item) => `
              <p>
                ${item.quantity}x ${item.title}
                - R$ ${(item.price * item.quantity).toFixed(2)}
              </p>
            `
          )
          .join("")}

        <hr>

        <h2>Total: R$ ${order.total.toFixed(2)}</h2>
      </body>
    </html>
  `;

  const janela = window.open("", "_blank");

  if (!janela) return;

  janela.document.write(conteudo);
  janela.document.close();

  setTimeout(() => {
    janela.print();
  }, 300);
}
const totalVendas = orders
  .filter(
    (order) => order.status === "pago"
  )
  .reduce(
    (total, order) => total + order.total,
    0
  );

const pedidosEntregues = orders.filter(
  (order) => order.status === "entregue"
).length;

const pedidosPendentes = orders.filter(
  (order) => order.status !== "entregue"
).length;
const hoje = new Date().toISOString().split("T")[0];

const pedidosHoje = orders.filter(
  (order) =>
    order.created_at &&
    order.created_at.startsWith(hoje)
);

const vendasHoje = pedidosHoje
  .filter(
    (order) => order.status === "pago"
  )
  .reduce(
    (total, order) => total + order.total,
    0
  );
  if (!authenticated) {
  return (
    <main className="min-h-screen bg-[#f8f1e7] flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-[#4b2e2e] mb-2">
          Painel Admin 🔐
        </h1>

        <p className="text-gray-500 mb-6">
          Digite a senha para acessar.
        </p> 

        <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
  className="w-full border border-gray-300 rounded-2xl px-4 py-3 mb-4 outline-none"
/>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border border-gray-300 rounded-2xl px-4 py-3 mb-4 outline-none"
        />

        <button
          onClick={login}
          className="w-full bg-[#4b2e2e] text-white py-3 rounded-2xl font-bold"
        >
          Entrar
        </button>

      </div>

    </main>
  );
}

return (
    <main className="min-h-screen bg-[#f8f1e7] p-6">

      <div className="max-w-5xl mx-auto">

        <div className="mb-8">

          <div className="flex items-center justify-between">

  <h1 className="text-4xl font-bold text-[#4b2e2e]">
    Painel Admin 🍰
  </h1>

  <button
    onClick={logout}
    className="bg-red-500 text-white px-4 py-2 rounded-2xl font-semibold"
  >
    Sair
  </button>

</div>

          <p className="text-gray-500 mt-2">
            Gerencie os pedidos da loja
          </p>
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">

        </div>
          <div className="mt-5">

  <button
    onClick={toggleStore}
    className={`px-5 py-3 rounded-2xl text-white font-semibold transition-all ${
      isOpen
        ? "bg-red-500"
        : "bg-green-600"
    }`}
  >
    {isOpen
      ? "Fechar Loja"
      : "Abrir Loja"}
  </button>

</div>

</div>
        <div className="space-y-6">

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-white rounded-3xl shadow-xl p-6"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>

                  <h2 className="text-2xl font-bold text-[#4b2e2e]">
                    Pedido #{order.id}
                  </h2>

                  <p className="text-gray-500 mt-1">
  {order.nome}
</p>

<p className="text-xs text-gray-400">
  {new Date(order.created_at).toLocaleDateString("pt-BR")} às{" "}
  {new Date(order.created_at).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}
</p>

<p className="text-gray-500">
  {order.telefone}
</p>

                </div>

                <div className="flex items-center gap-3">


{order.status === "pago" && (
  <>
    <button
      onClick={() => marcarPronto(order.id)}
      className="bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold"
    >
      📦 Pronto para retirada
    </button>

    <button
      onClick={() => imprimirPedido(order)}
      className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold"
    >
      🖨️ Imprimir
    </button>
  </>
)}

{order.status === "pronto_retirada" && (
  <>
    <div className="bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold">
      🟡 Aguardando retirada
    </div>

    <button
      onClick={() => imprimirPedido(order)}
      className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold"
    >
      🖨️ Imprimir
    </button>

    <button
      onClick={() =>
        updateStatus(order.id, "entregue")
      }
      className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold"
    >
      ✔ Confirmar retirada
    </button>
  </>
)}

{order.status === "entregue" && (
  <div className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold">
    ✅ Retirado pelo cliente
  </div>
)}

                </div>

              </div>

              <div className="space-y-3">

                {order.pedido.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#f8f1e7] rounded-2xl p-4"
                  >

                    <div className="flex items-center gap-4">

                      <img
                        src={item.image}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />

                      <div>

                        <h3 className="font-bold">
                          {item.title}
                        </h3>

                        <p className="text-gray-500 text-sm mt-1 leading-5 line-clamp-2 overflow-hidden">
                          Quantidade: {item.quantity}
                        </p>

                      </div>

                    </div>

                    <p className="font-bold text-pink-600 text-lg">
                      R$
                      {(
                        item.price * item.quantity
                      ).toFixed(2)}
                    </p>

                  </div>

                ))}

              </div>

              <div className="border-t mt-6 pt-5 flex justify-between items-center">

                <span className="text-2xl font-bold">
                  Total
                </span>

                <span className="text-3xl font-bold text-[#4b2e2e]">
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