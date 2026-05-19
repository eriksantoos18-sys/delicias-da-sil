"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Pedido {
  id: number;
  nome: string;
  telefone: string;
  total: number;
  status: string;
  pedido: any[];
}

export default function AdminPage() {

  const [orders, setOrders] =
    useState<Pedido[]>([]);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const [isOpen, setIsOpen] =
    useState(true);

  useEffect(() => {

    const auth =
      localStorage.getItem("admin-auth");

    if (auth === "true") {

      setAuthenticated(true);

      loadOrders();

      loadStoreStatus();
    }

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

    await supabase
      .from("pedidos")
      .update({ status })
      .eq("id", id);

    loadOrders();
  }

  function getStatusColor(
    status: string
  ) {

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

  function login() {

    if (password === "admin123") {

      localStorage.setItem(
        "admin-auth",
        "true"
      );

      setAuthenticated(true);

      loadOrders();

      loadStoreStatus();

    } else {

      alert("Senha incorreta");
    }
  }
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

          <h1 className="text-4xl font-bold text-[#4b2e2e]">
            Painel Admin 🍰
          </h1>

          <p className="text-gray-500 mt-2">
            Gerencie os pedidos da loja
          </p>
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

                  <p className="text-gray-500">
                    {order.telefone}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <span
                    className={`${getStatusColor(order.status)} text-white px-4 py-2 rounded-full font-semibold capitalize`}
                  >
                    {order.status.replace("_", " ")}
                  </span>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    className="border border-gray-300 rounded-2xl px-4 py-2 outline-none"
                  >

                    <option value="pendente">
                      Pendente
                    </option>

                    <option value="pago">
                      Pago
                    </option>

                    <option value="preparando">
                      Preparando
                    </option>

                    <option value="saiu_entrega">
                      Saiu para entrega
                    </option>

                    <option value="entregue">
                      Entregue
                    </option>

                  </select>

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

                        <p className="text-gray-500 text-sm">
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