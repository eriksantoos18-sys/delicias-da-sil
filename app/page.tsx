"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface CartItem {
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Product {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  imagem: string;
}

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from("produtos")
      .select("*");

    if (data) {
      setProducts(data);
    }
  }

  const addToCart = (item: CartItem) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.title === item.title
    );

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.title === item.title
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
        },
      ]);
    }
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <main className="bg-[#f8f1e7] min-h-screen">

      <header className="w-full bg-[#4b2e2e] text-white px-8 py-4 flex items-center justify-between shadow-lg">

        <div className="text-3xl font-bold">
          Delicias da Sil
        </div>

        <nav className="hidden md:flex gap-8 text-lg">

          <button className="hover:text-yellow-300 transition">
            Início
          </button>

          <button className="hover:text-yellow-300 transition">
            Promoções
          </button>

          <button className="hover:text-yellow-300 transition">
            Pedidos
          </button>

          <button className="hover:text-yellow-300 transition">
            Entrar
          </button>

        </nav>

      </header>

      <section className="px-6 mt-6">

        <div className="relative rounded-[30px] overflow-hidden h-[240px] md:h-[340px] shadow-xl">

          <img
            src="/banner.jpg"
            className="w-full h-full object-cover object-center"
          />

        </div>

        <section className="relative bg-white px-8 py-6 shadow-md rounded-b-3xl">

          <img
            src="/logo.png"
            className="absolute -top-14 left-8 w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white"
          />

          <div className="ml-40">

            <h1 className="text-4xl font-bold text-[#4b2e2e]">
              Delicias da Sil
            </h1>

            <p className="text-gray-600 mt-2 text-lg">
              Doces feitos com amor 🍫
            </p>

            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>Aberto até 19h</span>
              <span>•</span>
              <span>Maceió - AL</span>
            </div>

          </div>

        </section>

      </section>

      <div className="flex flex-col md:flex-row">

        <section className="flex-1 p-6">

          <div className="mt-4 mb-6">

            <h2 className="text-3xl font-bold text-[#4b2e2e]">
              Nossos Produtos
            </h2>

            <p className="text-gray-600 mt-1">
              Escolha seus doces favoritos 🍰
            </p>

          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">

            {products.map((product) => (

              <div
                key={product.id}
                className="bg-white rounded-3xl p-4 shadow-lg"
              >

                <img
                  src={product.imagem}
                  className="rounded-2xl w-full h-56 object-cover"
                />

                <h2 className="text-2xl font-bold mt-4">
                  {product.nome}
                </h2>

                <p className="mt-2 text-gray-600">
                  Produto artesanal delicioso 🍰
                </p>

                <p className="mt-4 font-bold text-xl">
                  R$ {product.preco}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  {product.estoque} disponíveis
                </p>

                <button
                  onClick={() =>
                    addToCart({
                      title: product.nome,
                      price: product.preco,
                      image: product.imagem,
                      quantity: 1,
                    })
                  }
                  disabled={product.estoque <= 0}
                  className="mt-4 bg-[#4b2e2e] text-white px-4 py-3 rounded-2xl w-full disabled:bg-gray-400"
                >
                  {product.estoque > 0
                    ? "Adicionar ao carrinho"
                    : "Esgotado"}
                </button>

              </div>

            ))}

          </section>

        </section>

        <aside className="w-full md:w-[420px] bg-white shadow-2xl p-6 flex flex-col">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-3xl font-bold">
              Sacola 🛒
            </h2>

            <span className="bg-[#4b2e2e] text-white px-3 py-1 rounded-full text-sm">
              {cart.length} itens
            </span>

          </div>

          <div className="flex-1 overflow-y-auto space-y-4">

            {cart.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                Seu carrinho está vazio
              </div>
            )}

            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-[#f8f1e7] rounded-2xl p-3"
              >

                <img
                  src={item.image}
                  className="w-20 h-20 rounded-xl object-cover"
                />

                <div className="flex-1">

                  <h3 className="font-bold text-lg">
                    {item.title}
                  </h3>

                  <p className="text-gray-600">
                    R$ {item.price.toFixed(2)}
                  </p>

                  <p className="text-sm text-gray-500">
                    Quantidade: {item.quantity}
                  </p>

                </div>

                <div className="flex flex-col gap-2">

                  <button
                    onClick={() => {
                      setCart(
                        cart.map((cartItem) =>
                          cartItem.title === item.title
                            ? {
                                ...cartItem,
                                quantity:
                                  cartItem.quantity + 1,
                              }
                            : cartItem
                        )
                      );
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded-xl"
                  >
                    +
                  </button>

                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        removeItem(index);
                      } else {
                        setCart(
                          cart.map((cartItem) =>
                            cartItem.title === item.title
                              ? {
                                  ...cartItem,
                                  quantity:
                                    cartItem.quantity - 1,
                                }
                              : cartItem
                          )
                        );
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-xl"
                  >
                    -
                  </button>

                </div>

              </div>
            ))}

          </div>

          <div className="border-t pt-6 mt-6">

            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl p-3 mb-3"
            />

            <input
              type="text"
              placeholder="Seu telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl p-3 mb-4"
            />

            <div className="flex justify-between mb-2 text-gray-600">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-2 text-gray-600">
              <span>Entrega</span>
              <span>A combinar</span>
            </div>

            <div className="flex justify-between text-2xl font-bold mt-4">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <button
              onClick={async () => {
                const response = await fetch(
                  "/api/checkout",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      cart,
                      nome: name,
                      telefone: phone,
                    }),
                  }
                );

                const data = await response.json();

                window.open(data.init_point, "_blank");
              }}
              className="mt-6 bg-green-600 text-white w-full py-4 rounded-2xl text-xl font-bold"
            >
              Finalizar Compra
            </button>

          </div>

        </aside>

      </div>

    </main>
  );
}