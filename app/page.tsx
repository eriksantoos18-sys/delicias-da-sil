"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface CartItem {
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Product {
  descricao: string;
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  imagem: string;
  categoria: string;
}

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [openCart, setOpenCart] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

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
    <main className="bg-[#fffaf5] min-h-screen">

      <header className="w-full bg-[#4a2c2a] text-white px-6 py-4 flex items-center justify-between shadow-lg">

        <div className="text-2xl md:text-2xl font-bold">
          Delicias da Sil
        </div>

        <nav className="hidden md:flex gap-8 text-lg">

          <button className="hover:text-yellow-300 transition">
            Início
          </button>

          <button className="hover:text-yellow-300 transition">
            Promoções
          </button>

          <Link
  href="/meu-pedido"
  className="hover:text-yellow-300 transition"
>
  Pedidos
</Link>

          <button className="hover:text-yellow-300 transition">
            Entrar
          </button>

        </nav>

      </header>

      <section className="px-4 md:px-6 mt-5">

        <div className="relative rounded-[30px] overflow-hidden h-[130px] md:h-[210px] shadow-lg">

          <img
            src="/banner.jpg"
            className="w-full h-full object-cover object-center"
          />

        </div>

        <section className="relative bg-white px-5 md:px-8 py-6 shadow-md rounded-b-2xl">

          <img
            src="/logo.png"
            className="absolute -top-10 left-5 w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
          />

          <div className="ml-28 md:ml-40">

            <h1 className="text-2xl md:text-4xl font-bold text-[#4b2e2e]">
              Delicias da Sil
            </h1>

            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg">
              Doces feitos com amor 🍫
            </p>

            <div className="flex gap-3 mt-2 text-xs md:text-sm text-gray-500">
              <span>Aberto até 19h</span>
              <span>•</span>
              <span>Maceió - AL</span>
            </div>

          </div>

        </section>

      </section>

      <div className="px-4 md:px-6 mt-5">

        <div className="bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-3">

          <span className="text-gray-400 text-xl">
            🔍
          </span>

          <input
            type="text"
            placeholder="Buscar doces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-gray-700"
          />

        </div>

      </div>

      <div className="flex flex-col md:flex-row items-start">

        <section className="w-full xl:w-[calc(100%-320px)] p-4 md:p-6">

          <div className="flex gap-3 overflow-x-auto pb-2 mb-6">

            <button
  onClick={() => setCategory("Todos")}
  className={`px-5 py-2 rounded-full whitespace-nowrap ${
    category === "Todos"
      ? "bg-[#4a2c2a] text-white"
      : "bg-white shadow"
  }`}
>
  Todos
</button>

           <button
  onClick={() => setCategory("Bolos")}
  className={`px-5 py-2 rounded-full whitespace-nowrap ${
    category === "Bolos"
      ? "bg-[#4a2c2a] text-white"
      : "bg-white shadow"
  }`}
>
  Bolos
</button>

            <button
  onClick={() => setCategory("Fatias")}
  className={`px-5 py-2 rounded-full whitespace-nowrap ${
    category === "Fatias"
      ? "bg-[#4a2c2a] text-white"
      : "bg-white shadow"
  }`}
>
  Fatias
</button>

           <button
  onClick={() => setCategory("Tortas")}
  className={`px-5 py-2 rounded-full whitespace-nowrap ${
    category === "Tortas"
      ? "bg-[#4a2c2a] text-white"
      : "bg-white shadow"
  }`}
>
  Tortas
</button>

            <button
  onClick={() => setCategory("Salgados")}
  className={`px-5 py-2 rounded-full whitespace-nowrap ${
    category === "Salgados"
      ? "bg-[#4a2c2a] text-white"
      : "bg-white shadow"
  }`}
>
  Salgados
</button>

          </div>

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-[#4b2e2e]">
              Nossos Produtos
            </h2>

            <p className="text-gray-600 mt-1">
              Escolha seus doces favoritos 🍰
            </p>

          </div>

          <section className="grid grid-cols-2 gap-4">

{products
  .filter((product) => {
    const matchSearch = product.nome
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "Todos" ||
      product.categoria
        ?.toLowerCase()
        .trim() ===
        category.toLowerCase().trim();

    return matchSearch && matchCategory;
  })
  .map((product) => (

    <div
      key={product.id}
      className="group bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300"
    >

      <div className="flex items-center justify-between gap-4 p-4">

        <div className="flex-1 flex flex-col justify-between">

          <div>

            <h2 className="text-[20px] font-semibold text-[#1f1f1f] leading-tight line-clamp-2">
              {product.nome}
            </h2>

            <p className="text-[15px] text-gray-500 mt-2 leading-6 line-clamp-2">
              {product.descricao}
            </p>

          </div>

          <div className="flex items-center justify-between mt-5">

            <span className="text-[18px] font-semibold text-[#1f1f1f]">
              R$ {product.preco.toFixed(2)}
            </span>

            {cart.find((item) => item.title === product.nome) ? (

              <div className="flex items-center gap-3 bg-pink-500 text-white px-3 py-2 rounded-2xl active:scale-95 transition-all duration-150">

                <button
                  onClick={() => {
                    const item = cart.find(
                      (cartItem) =>
                        cartItem.title === product.nome
                    );

                    if (item?.quantity === 1) {
                      setCart(
                        cart.filter(
                          (cartItem) =>
                            cartItem.title !== product.nome
                        )
                      );
                    } else {
                      setCart(
                        cart.map((cartItem) =>
                          cartItem.title === product.nome
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
                  className="font-bold text-lg"
                >
                  -
                </button>

                <span className="font-bold">
                  {
                    cart.find(
                      (item) =>
                        item.title === product.nome
                    )?.quantity
                  }
                </span>

                <button
                  onClick={() =>
                    addToCart({
                      title: product.nome,
                      price: product.preco,
                      image: product.imagem,
                      quantity: 1,
                    })
                  }
                  className="font-bold text-lg"
                >
                  +
                </button>

              </div>

            ) : (

              <button
                onClick={() =>
                  addToCart({
                    title: product.nome,
                    price: product.preco,
                    image: product.imagem,
                    quantity: 1,
                  })
                }
                className="bg-[#6b2d2d] hover:bg-[#582222] text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                Adicionar
              </button>

            )}

          </div>

        </div>

        <div className="relative">

          <img
            src={product.imagem}
            className="w-24 h-24 rounded-2xl object-cover group-hover:scale-105 transition duration-500"
          />

          <div className="absolute top-2 right-2 bg-[#c48b5f] text-white text-[10px] px-2 py-1 rounded-full font-semibold">
            Destaque
          </div>

        </div>

      </div>

    </div>

  ))}

          </section>

        </section>

        <aside className="hidden md:flex md:w-[380px] h-[95vh] sticky top-4 bg-white border border-gray-200 rounded-[28px] shadow-xl p-5 flex-col m-4">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              Sacola 🛒
            </h2>

            <span className="bg-[#ede7df] text-[#6b4b3e] text-white px-3 py-1 rounded-full text-sm">
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
                className="flex items-center gap-4 bg-[#fffaf5] rounded-2xl p-3"
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
   className="w-full bg-[#f8f5f1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#c48b5f] mb-3"
  />

  <input
    type="text"
    placeholder="Seu telefone"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full bg-[#f8f5f1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#c48b5f] mb-3"
  />

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
    className="mt-6 bg-[#c48b5f] text-white w-full py-4 rounded-xl text-xl font-bold"
  >
    Finalizar Compra
  </button>

</div>

        </aside>

      </div>

      {cart.length > 0 && (

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] md:hidden">

          <button
            onClick={() => setOpenCart(true)}
            className="bg-[#4a2c2a] text-white w-full rounded-2xl px-4 py-2.5 shadow-lg backdeop-blur-md flex items-center justify-between"
          >

            <div className="flex items-center gap-3">

              <span className="bg-white text-[#4b2e2e] w-7 h-7 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>

              <div className="text-left">

                <p className="font-bold">
                  Ver sacola
                </p>

                <p className="text-xs text-gray-200">
                  Toque para finalizar
                </p>

              </div>

            </div>

            <div className="font-bold text-base">
              R$ {total.toFixed(2)}
            </div>

          </button>

        </div>

      )}

      {openCart && (

        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden">

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[30px] p-6 max-h-[85vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Sua Sacola 🛒
              </h2>

              <button
                onClick={() => setOpenCart(false)}
                className="text-2xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              {cart.map((item, index) => (

                <div
                  key={index}
                  className="flex items-center gap-4 bg-[#fffaf5] rounded-2xl p-3"
                >

                  <img
                    src={item.image}
                    className="w-20 h-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">

                    <h3 className="font-bold">
                      {item.title}
                    </h3>

                    <p className="text-gray-600">
                      R$ {item.price.toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-500">
                      Quantidade: {item.quantity}
                    </p>

                  </div>

                </div>

              ))}

            </div>

            <div className="border-t mt-6 pt-6">

              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#f8f5f1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#c48b5f] mb-3"
              />

              <input
                type="text"
                placeholder="Seu telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#f8f5f1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#c48b5f] mb-3"
              />

              <div className="flex justify-between text-2xl font-bold mb-5">

                <span>Total</span>

                <span>
                  R$ {total.toFixed(2)}
                </span>

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
                className="bg-[#c48b5f] text-white w-full py-4 rounded-xl text-xl font-bold"
              >
                Finalizar Compra
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}