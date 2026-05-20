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
  const [isOpen, setIsOpen] = useState(true);
  const [showStickyHeader, setShowStickyHeader] =
  useState(false);

 useEffect(() => {

  loadProducts();
  loadStoreStatus();

  const handleScroll = () => {

    if (window.scrollY > 180) {
      setShowStickyHeader(true);
    } else {
      setShowStickyHeader(false);
    }
  };

  window.addEventListener(
    "scroll",
    handleScroll
  );

  return () =>
    window.removeEventListener(
      "scroll",
      handleScroll
    );

}, []);

  async function loadProducts() {
    const { data } = await supabase
      .from("produtos")
      .select("*");

    if (data) {
      setProducts(data);
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
  <>

    {showStickyHeader && (

      <div className="fixed top-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-md border-b border-[#ece7e2] px-4 py-3 flex items-center justify-between shadow-sm">

        <div className="flex items-center gap-3">

          <img
            src="/logo.png"
            className="w-10 h-10 rounded-xl object-cover"
          />

          <div>

            <h2 className="text-[15px] font-semibold text-[#2d1f1f] leading-4">
              Delicias da Sil
            </h2>

            <p className="text-[12px] text-gray-500">
              Doces feitos com amor 🍫
            </p>

          </div>

        </div>

        <Link
          href="/meu-pedido"
          className="text-[14px] font-medium text-[#4a2c2a]"
        >
          Pedidos
        </Link>

      </div>

    )}
    
    <main className="bg-[#fffaf5] min-h-screen">

      <header className="w-full bg-[#4a2c2a] text-white px-6 py-4 flex items-center justify-between shadow-lg">

        <div className="text-2xl md:text-2xl font-bold">
          Delicias da Sil
        </div>

        <nav className="hidden md:flex gap-8 text-lg">

  <Link
    href="/meu-pedido"
    className="hover:text-yellow-300 transition"
  >
    Meus Pedidos
  </Link>

</nav>

      </header>

      <section className="px-4 md:px-6 mt-5">

        <div className="relative rounded-[30px] overflow-hidden h-[160px] md:h-[260px] shadow-lg">

  <img
    src="/banner.jpg"
    className="w-full h-full object-cover object-center"
  />

</div>

        <section className="relative px-4 md:px-6 py-5">

          <img
            src="/logo.png"
            className="absolute -top-10 left-5 w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white shadow-xl"
          />

          <div className="ml-24 md:ml-32 flex-1">

            <h1 className="text-xl md:text-4xl font-bold text-[#4b2e2e]">
              Delicias da Sil
            </h1>

            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg">
              Doces feitos com amor 🍫
            </p>

            <div className="flex gap-3 mt-2 text-xs md:text-sm text-gray-500">
              <span
  className={`font-medium ${
    isOpen
      ? "text-green-600"
      : "text-red-500"
  }`}
>
  {isOpen
    ? "🟢 Aberto agora"
    : "🔴 Fechado"}
</span>
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



          {["Fatias", "Bolos", "Salgados", "Tortas"].map((section) => {

  const filteredProducts = products.filter((product) => {

    const matchSearch = product.nome
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      product.categoria?.toLowerCase().trim() ===
      section.toLowerCase().trim();

    return matchSearch && matchCategory;
  });

  if (filteredProducts.length === 0) {
    return null;
  }

  return (

    <div key={section} className="mb-10">

      <h2 className="text-3xl font-bold text-[#2d1f1f] mb-5">
        {section.toUpperCase()}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {filteredProducts.map((product) => (

          <div
            key={product.id}
            className="bg-white border border-[#ece7e2] rounded-[22px] p-3 flex gap-3 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >

            <img
              src={product.imagem}
              className="w-[88px] h-[88px] rounded-[18px] object-cover shrink-0"
            />

            <div className="flex-1 min-w-0 flex flex-col justify-between">

              <div>

                <h2 className="text-[17px] font-semibold text-[#2d1f1f] leading-5 truncate">
                  {product.nome}
                </h2>

                <p className="text-[13px] text-[#7a7a7a] mt-1 leading-4 line-clamp-2 overflow-hidden">
                  {product.descricao}
                </p>

              </div>

              <div className="flex items-center justify-between mt-3">

                <span className="text-[16px] font-semibold text-[#2d1f1f]">
                  R$ {product.preco.toFixed(2)}
                </span>

                <button
                  disabled={!isOpen}
                  onClick={() =>
                    addToCart({
                      title: product.nome,
                      price: product.preco,
                      image: product.imagem,
                      quantity: 1,
                    })
                  }
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                    isOpen
                      ? "bg-[#6d2f2f] text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isOpen ? "Adicionar" : "Fechado"}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
})}

        </section>

        <aside className="hidden md:flex md:w-[340px] h-[85vh] sticky top-24 bg-white border border-gray-200 rounded-[28px] shadow-xl p-5 flex-col m-4">

  <div className="flex justify-between items-center mb-6 border-b pb-4">

    <div className="flex items-center gap-3">

      <h2 className="text-2xl font-bold">
        Sacola 🛒
      </h2>

      <button
        onClick={() => setCart([])}
        className="text-sm font-semibold text-[#6d2f2f]"
      >
        LIMPAR
      </button>

    </div>

    <span className="bg-[#ede7df] text-[#6b4b3e] px-3 py-1 rounded-full text-sm">
      {cart.length} itens
    </span>

  </div>

  <div className="flex-1 overflow-y-auto space-y-3 pr-1">

    {cart.length === 0 && (
      <div className="text-center text-gray-500 mt-20">
        Seu carrinho está vazio
      </div>
    )}

    {cart.map((item, index) => (

      <div
        key={index}
        className="bg-[#fffaf5] rounded-2xl p-3 border border-[#ece7e2]"
      >

        <div className="flex gap-3">

          <img
            src={item.image}
            className="w-16 h-16 rounded-xl object-cover"
          />

          <div className="flex-1 min-w-0">

            <h3 className="text-[14px] font-semibold text-[#2d1f1f] leading-5">
              {item.quantity}x {item.title}
            </h3>

            <p className="text-[14px] font-semibold mt-1">
              R$ {item.price.toFixed(2)}
            </p>

           <div className="flex items-center gap-3 mt-3">

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
    className="w-7 h-7 rounded-full bg-[#f1ece7] font-bold"
  >
    -
  </button>

  <span className="text-sm font-semibold">
    {item.quantity}
  </span>

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
    className="w-7 h-7 rounded-full bg-[#6d2f2f] text-white font-bold"
  >
    +
  </button>

  <button
    onClick={() => removeItem(index)}
    className="text-sm text-gray-400 ml-2"
  >
    Remover
  </button>

</div>

          </div>

        </div>

      </div>

    ))}

  </div>

  <div className="border-t pt-6 mt-6">

    <input
      type="text"
      placeholder="Seu nome"
      required
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full bg-[#f8f5f1] rounded-xl px-4 py-3 outline-none mb-3"
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
      className="w-full bg-[#f8f5f1] rounded-xl px-4 py-3 outline-none mb-3"
    />

    <div className="flex justify-between text-2xl font-bold mt-4">
      <span>Total</span>
      <span>R$ {total.toFixed(2)}</span>
    </div>

    <button
      onClick={async () => {
        if (cart.length === 0) {
  alert("Adicione itens ao carrinho");
  return;
}
        if (!name.trim() || !phone.trim()) {
          alert("Preencha nome e telefone");
          return;
        }

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
      className="bg-[#c48b5f] text-white w-full py-3 rounded-2xl text-[18px] font-semibold shadow-md mt-4"
    >
      Finalizar Compra
    </button>

  </div>

</aside>

      </div>

      {cart.length > 0 && (

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md md:hidden">

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

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[32px] px-5 pt-2 pb-5 h-[82vh] overflow-y-auto shadow-2xl animate-slideUp">

            <div className="w-14 h-1.5 bg-gray-300 rounded-full mx-auto mb-5"></div>

              <div className="sticky top-0 z-20 bg-white pb-4 pt-2 flex items-center justify-between border-b border-[#f1ece6]">

              <h2 className="text-[24px] font-bold text-[#3d1f1f]">
                Sacola
              </h2>

              <button
                onClick={() => setOpenCart(false)}
                className="w-10 h-10 rounded-full bg-[#f7f2ec] flex items-center justify-center text-xl text-[#2d1f1f]"
              >
                ✕
              </button>

            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">

              {cart.map((item, index) => (

                <div
  key={index}
  className="flex gap-4 items-start bg-white rounded-[24px] border border-[#ece7e2] p-4"
>

                  <img
                    src={item.image}
                    className="w-[78px] h-[78px] rounded-[18px] object-cover shadow-sm"
                  />

                  <div className="flex-1 min-w-0">

                    <h3 className="text-[16px] font-semibold text-[#2d1f1f] leading-5">
                      {item.title}
                    </h3>

                    <p className="text-[15px] font-semibold text-[#2d1f1f] mt-1">
                      R$ {item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">

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
    className="w-7 h-7 rounded-full bg-[#f1ece7] font-bold"
  >
    -
  </button>

  <span className="text-sm font-semibold">
    {item.quantity}
  </span>

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
    className="w-7 h-7 rounded-full bg-[#6d2f2f] text-white font-bold"
  >
    +
  </button>

  <button
    onClick={() => removeItem(index)}
    className="text-sm text-gray-400 ml-2"
  >
    Remover
  </button>

</div>


</div>

                  </div>

              ))}

            </div>
<div className="mt-7">

  <h3 className="text-[18px] font-semibold text-[#2d1f1f] mb-4">
    Peça também
  </h3>

  <div className="flex gap-3 overflow-x-auto pb-2">

    {products.slice(0, 4).map((product) => (

      <div
        key={product.id}
        className="min-w-[140px] bg-white rounded-2xl border border-[#ebe3da] p-2 shadow-sm"
      >

        <img
          src={product.imagem}
          className="w-full h-[95px] rounded-xl object-cover"
        />

        <h4 className="text-[14px] font-semibold mt-2 line-clamp-2">
          {product.nome}
        </h4>

        <p className="text-[14px] font-bold mt-1">
          R$ {product.preco.toFixed(2)}
        </p>

        <button
  disabled={!isOpen}
  onClick={() =>
    addToCart({
              title: product.nome,
              price: product.preco,
              image: product.imagem,
              quantity: 1,
            })
          }
          className="mt-2 w-full bg-[#6d2f2f] text-white py-2 rounded-xl text-sm font-medium"
        >
          {isOpen ? "Adicionar" : "Fechado"}
        </button>

      </div>

    ))}

  </div>

</div>

            <div className="border-t mt-6 pt-6 bg-white pb-2">

              <input
                type="text"
                placeholder="Seu nome"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#ece2d7] rounded-2xl px-4 py-3 outline-none text-[16px] shadow-sm mb-3"
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
  className="w-full bg-[#f8f5f1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#c48b5f] mb-3"
/>

              <div className="flex justify-between items-center mt-6 mb-6">

  <span className="text-[24px] font-bold text-[#2d1f1f]">
    Total
  </span>

  <span className="text-[24px] font-bold text-[#2d1f1f]">
    R$ {total.toFixed(2)}
  </span>

</div>

              <button
                onClick={async () => {
                  if (cart.length === 0) {
  alert("Adicione itens ao carrinho");
  return;
}
                  if (!name.trim() || !phone.trim()) {
  alert("Preencha nome e telefone");
  return;
}
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
                className="bg-[#c07a45] active:scale-[0.98] transition-all text-white w-full py-4 rounded-2xl text-2xl font-bold shadow-lg"
              >
                Finalizar Compra
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  </>
  );
}