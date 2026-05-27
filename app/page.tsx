"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  estoque: number;
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
  const [isOpen, setIsOpen] = useState(true);
  const [showStickyHeader, setShowStickyHeader] =
    useState(false);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Recupera carrinho salvo
  useEffect(() => {
    const savedCart =
      localStorage.getItem("cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salva carrinho
  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // Recupera dados do cliente
  useEffect(() => {
    const savedName =
      localStorage.getItem("customerName");

    const savedPhone =
      localStorage.getItem("customerPhone");

    if (savedName) {
      setName(savedName);
    }

    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  // Salva dados do cliente
  useEffect(() => {
    localStorage.setItem(
      "customerName",
      name
    );

    localStorage.setItem(
      "customerPhone",
      phone
    );
  }, [name, phone]);

  // Carrega produtos, status da loja e sticky header
  useEffect(() => {
    loadProducts();
    loadStoreStatus();

    const handleScroll = () => {
      setShowStickyHeader(
        window.scrollY > 180
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);
async function loadProducts() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
.gt("estoque", 0);


    if (error) {
      console.error(
        "Erro ao carregar produtos:",
        error
      );
      return;
    }

    setProducts(data || []);
  }

  async function loadStoreStatus() {
    const { data, error } = await supabase
      .from("configuracoes")
      .select("loja_aberta")
      .eq("id", 1)
      .single();

    if (error) {
      console.error(
        "Erro ao carregar status da loja:",
        error
      );
      return;
    }

    setIsOpen(data?.loja_aberta ?? true);
  }

  const addToCart = (item: CartItem) => {

  console.log("ITEM:", item);

  const existingItem = cart.find(
    (cartItem) =>
      cartItem.title === item.title
  );

  if (
    existingItem &&
    existingItem.quantity >= item.estoque
  ) {
    alert("Estoque máximo atingido");
    return;
  }

    if (existingItem) {
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

      return;
    }

    setCart([
      ...cart,
      {
        ...item,
        quantity: 1,
      },
    ]);
  };

  const decreaseQuantity = (
    index: number
  ) => {
    const item = cart[index];

    if (!item) return;

    if (item.quantity === 1) {
      removeItem(index);
      return;
    }

    setCart(
      cart.map((cartItem, i) =>
        i === index
          ? {
              ...cartItem,
              quantity:
                cartItem.quantity - 1,
            }
          : cartItem
      )
    );
  };

 const increaseQuantity = (
  index: number
) => {

  const item = cart[index];

  if (!item) return;

  if (item.quantity >= item.estoque) {
    alert("Estoque máximo atingido");
    return;
  }

  setCart(
    cart.map((cartItem, i) =>
      i === index
        ? {
            ...cartItem,
            quantity:
              cartItem.quantity + 1,
          }
        : cartItem
    )
  );
};

  const removeItem = (
    index: number
  ) => {
    setCart(
      cart.filter(
        (_, i) => i !== index
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );
return (
  <>
    {showStickyHeader && (
      <div className="fixed top-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-md border-b border-[#ece7e2] px-4 py-3 shadow-sm">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">

            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover"
            />

            <div>

              <h2 className="text-[15px] font-semibold text-[#2d1f1f] leading-4">
                Delícias da Sil
              </h2>

              <p className="text-[12px] text-[#7a7a7a]">
                Doces feitos com amor 🍫
              </p>

            </div>

          </div>

          <Link
            href="/meu-pedido"
            className="bg-[#f5eee8] text-[#6d2f2f] px-3 py-2 rounded-xl text-sm font-semibold"
          >
            Pedidos
          </Link>

        </div>

      </div>
    )}

    <main className="bg-[#fffaf5] min-h-screen">

      <header className="sticky top-0 z-40 bg-[#4a2c2a] text-white px-4 md:px-6 py-4 shadow-lg">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div>

            <h1 className="text-xl md:text-2xl font-bold">
              Delícias da Sil
            </h1>

            <p className="text-xs text-white/70 mt-1">
              Doces feitos com amor 🍫
            </p>

          </div>

          <nav className="hidden md:flex items-center gap-6 text-[15px]">

            <Link
              href="/meu-pedido"
              className="hover:text-yellow-300 transition"
            >
              Meus Pedidos
            </Link>

          </nav>

        </div>

      </header>

<section className="px-4 md:px-6 mt-5">

  <div className="relative rounded-[32px] overflow-hidden h-[180px] md:h-[280px] shadow-xl">

    <img
      src="/banner.jpg"
      alt="Banner"
      className="w-full h-full object-cover object-center"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

  </div>

  <section className="relative px-2 md:px-4 py-5">

    <img
      src="/logo.png"
      alt="Logo"
      className="absolute -top-12 left-4 w-24 h-24 md:w-32 md:h-32 rounded-[28px] object-cover border-4 border-white shadow-xl bg-white"
    />

    <div className="ml-28 md:ml-40">

      <h1 className="text-[26px] md:text-[42px] font-bold text-[#2d1f1f] leading-tight">
        Delícias da Sil
      </h1>

      <p className="text-[#7a7a7a] mt-1 text-sm md:text-lg">
        Doces feitos com amor 🍫
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">

        <span
          className={`px-3 py-1 rounded-full font-medium ${
            isOpen
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isOpen ? "🟢 Aberto agora" : "🔴 Fechado"}
        </span>

        <span className="text-[#b8b8b8]">
          •
        </span>

        <span className="text-[#6f6f6f]">
          📍 Massagueira - Marechal Deodoro - AL
        </span>

      </div>

    </div>

  </section>

</section>

<div className="px-4 md:px-6 mt-3">

  <div className="bg-white rounded-[20px] border border-[#ece7e2] shadow-sm px-4 py-3 flex items-center gap-3">

    <span className="text-[#b0b0b0] text-lg">
      🔍
    </span>

    <input
      type="text"
      placeholder="Buscar doces..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full bg-transparent outline-none text-[#2d1f1f] placeholder:text-[#9d9d9d]"
    />

  </div>

</div>
<div className="flex flex-col xl:flex-row items-start">

<section className="w-full xl:w-[calc(100%-340px)] p-4 md:p-6">

  {["Fatias", "Bolos", "Salgados", "Tortas", "Copos da Felicidade"].map((section) => {

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

      <div key={section} className="mb-12">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-[28px] md:text-[32px] font-bold text-[#2d1f1f]">
            {section}
          </h2>

          <span className="text-sm text-[#8b8b8b]">
            {filteredProducts.length} itens
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {filteredProducts.map((product) => (

            <div
              key={product.id}
              className="bg-white rounded-[26px] border border-[#ece7e2] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >

              <div className="relative">

                <img
                  src={product.imagem}
                  alt={product.nome}
                  className="w-full h-[210px] object-cover"
                />

                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">

                  <span className="font-bold text-[#2d1f1f]">
                    R$ {product.preco.toFixed(2)}
                  </span>

                </div>

              </div>

              <div className="p-4">

                <h3 className="text-[18px] font-bold text-[#2d1f1f]">
                  {product.nome}
                </h3>

                <p
  className={`text-[14px] text-[#7a7a7a] mt-2 ${
    expandedProduct === product.id
      ? ""
      : "line-clamp-2"
  }`}
>
  {product.descricao}
</p>
<button
  onClick={() =>
    setExpandedProduct(
      expandedProduct === product.id
        ? null
        : product.id
    )
  }
  className="text-[#6d2f2f] text-sm font-medium mt-1"
>
  {expandedProduct === product.id
    ? "Ver menos"
    : "Ver mais"}
</button>

                <div className="mt-4">

                  <button
                    disabled={!isOpen}
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        title: product.nome,
                        price: product.preco,
                        image: product.imagem,
                        quantity: 1,
                        estoque: product.estoque,
                      })
                    }
                    className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isOpen
                        ? "bg-[#6d2f2f] hover:bg-[#572525] text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isOpen
                      ? "Adicionar à sacola"
                      : "Loja fechada"}
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

<aside className="hidden md:flex md:w-[360px] h-[88vh] sticky top-24 bg-white border border-[#ece7e2] rounded-[32px] shadow-xl p-5 flex-col m-4">

  <div className="flex justify-between items-center pb-5 border-b border-[#ece7e2]">

    <div>

      <h2 className="text-[28px] font-bold text-[#2d1f1f]">
        Sacola
      </h2>

      <p className="text-sm text-[#7a7a7a]">
        {cart.length} itens adicionados
      </p>

    </div>

    <button
      onClick={() => setCart([])}
      className="text-sm font-semibold text-[#6d2f2f]"
    >
      Limpar
    </button>

  </div>

  <div className="flex-1 overflow-y-auto space-y-4 py-5">

    {cart.length === 0 && (

      <div className="flex flex-col items-center justify-center h-full text-center">

        <div className="text-5xl mb-3">
          🛒
        </div>

        <h3 className="font-semibold text-[#2d1f1f]">
          Sua sacola está vazia
        </h3>

        <p className="text-sm text-[#7a7a7a] mt-1">
          Adicione alguns produtos
        </p>

      </div>

    )}

    {cart.map((item, index) => (

      <div
        key={index}
        className="bg-white rounded-[24px] border border-[#ece7e2] p-4"
      >

        <div className="flex justify-between gap-4">

          <div className="flex-1">

            <h3 className="font-semibold text-[#2d1f1f] leading-5">
              {item.title}
            </h3>

            <p className="font-bold text-[#2d1f1f] mt-2">
              R$ {item.price.toFixed(2)}
            </p>

          </div>

          <img
            src={item.image}
            className="w-16 h-16 rounded-2xl object-cover"
          />

        </div>

        <div className="flex items-center justify-between mt-4">

          <div className="flex items-center gap-3">

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
              className="w-8 h-8 rounded-full bg-[#f4ede8] font-bold"
            >
              −
            </button>

            <span className="font-semibold min-w-[20px] text-center">
              {item.quantity}
            </span>

            <button
  onClick={() => increaseQuantity(index)}
  className="w-8 h-8 rounded-full bg-[#6d2f2f] text-white font-bold"
>
  +
</button>

          </div>

          <button
            onClick={() => removeItem(index)}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Remover
          </button>

        </div>

      </div>

    ))}

  </div>

  <div className="border-t border-[#ece7e2] pt-5">

    <input
      type="text"
      placeholder="Seu nome"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full bg-[#f8f5f1] rounded-2xl px-4 py-3 outline-none mb-3"
    />

    <input
      type="tel"
      placeholder="(82) 91234-5678"
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
      className="w-full bg-[#f8f5f1] rounded-2xl px-4 py-3 outline-none mb-4"
    />

    <div className="bg-[#fffaf5] rounded-2xl p-4 mb-4">

      <div className="flex justify-between items-center">

        <span className="text-lg font-semibold">
          Total
        </span>

        <span className="text-2xl font-bold text-[#2d1f1f]">
          R$ {total.toFixed(2)}
        </span>

      </div>

    </div>

   <button
  disabled={loading}
  onClick={async () => {

  if (loading) return;

  setLoading(true);

  try {

    if (cart.length === 0) {
      alert("Adicione itens ao carrinho");
      return;
    }

    if (!name.trim()) {
      alert("Preencha o nome");
      return;
    }

    if (phone.replace(/\D/g, "").length < 11) {
      alert("Digite um telefone válido com DDD");
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

if (!response.ok) {
  alert(data.error);
  return;
}

setCart([]);

window.open(data.init_point, "_blank");

  } catch (error) {

    console.error(error);

    alert("Erro ao criar pagamento");

  } finally {

    setLoading(false);

  }

}}
      className="w-full bg-[#6d2f2f] hover:bg-[#572525] text-white py-4 rounded-2xl text-lg font-bold transition"
    >
      {loading ? "Processando..." : "Finalizar Compra"}
    </button>

  </div>

</aside>
</div>
{cart.length > 0 && (

  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md md:hidden">

    <button
      onClick={() => setOpenCart(true)}
      className="w-full bg-[#6d2f2f] text-white rounded-[22px] px-5 py-4 shadow-2xl flex items-center justify-between active:scale-[0.98] transition-all"
    >

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-full bg-white text-[#6d2f2f] font-bold flex items-center justify-center">
          {cart.length}
        </div>

        <div className="text-left">

          <p className="font-bold text-[15px]">
            Ver sacola
          </p>

          <p className="text-xs text-white/70">
            Toque para finalizar pedido
          </p>

        </div>

      </div>

      <div className="text-right">

        <p className="text-xs text-white/70">
          Total
        </p>

        <p className="font-bold text-lg">
          R$ {total.toFixed(2)}
        </p>

      </div>

    </button>

  </div>

)}

      {openCart && (
          
        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden">

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[32px] px-5 pt-2 pb-5 h-[82vh] overflow-y-auto shadow-2xl animate-slideUp">

            <div className="w-14 h-1.5 bg-gray-300 rounded-full mx-auto mb-5"></div>

              <div className="sticky top-0 z-20 bg-white pb-4 pt-2 flex items-center justify-between border-b border-[#f1ece6]">

              <div className="flex items-center gap-3">

  <h2 className="text-[24px] font-bold text-[#3d1f1f]">
    Sacola
  </h2>

  <span className="bg-[#f3ece7] px-2 py-1 rounded-full text-xs font-medium">
    {cart.length} itens
  </span>

</div>

              <div className="flex items-center gap-3">

  <button
    onClick={() => setCart([])}
    className="text-sm text-[#6d2f2f] font-semibold"
  >
    Limpar
  </button>

  <button
    onClick={() => setOpenCart(false)}
    className="w-10 h-10 rounded-full bg-[#f7f2ec] flex items-center justify-center text-xl text-[#2d1f1f]"
  >
    ✕
  </button>

</div>

            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">

              {cart.map((item, index) => (

                <div
  key={index}
  className="bg-white rounded-[24px] border border-[#ece7e2] p-4"
>

  <div className="flex justify-between gap-4">

    <div className="flex-1 min-w-0">

      <h3 className="text-[16px] font-semibold text-[#2d1f1f] leading-5">
        {item.title}
      </h3>

      <p className="text-[15px] font-bold text-[#2d1f1f] mt-2">
        R$ {item.price.toFixed(2)}
      </p>

    </div>

    <img
      src={item.image}
      className="w-16 h-16 rounded-2xl object-cover"
    />

  </div>

<div className="flex items-center justify-between mt-4">

  <div className="flex items-center gap-3">

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
      className="w-8 h-8 rounded-full bg-[#f4ede8] text-[#2d1f1f] font-bold flex items-center justify-center"
    >
      −
    </button>

    <span className="font-semibold min-w-[20px] text-center">
      {item.quantity}
    </span>

    <button
  onClick={() => increaseQuantity(index)}
  className="w-8 h-8 rounded-full bg-[#6d2f2f] text-white font-bold flex items-center justify-center"
>
  +
</button>

  </div>

  <button
    onClick={() => removeItem(index)}
    className="text-sm font-medium text-red-500 hover:text-red-600"
  >
    Remover
  </button>

</div>

</div>

))}
</div>

<div className="mt-8">

  <div className="flex items-center justify-between mb-4">

    <h3 className="text-[18px] font-bold text-[#2d1f1f]">
      Você também pode gostar 😋
    </h3>

  </div>

  <div className="flex gap-4 overflow-x-auto pb-2">

    {products.slice(0, 6).map((product) => (

      <div
        key={product.id}
        className="min-w-[165px] bg-white rounded-[24px] border border-[#ece7e2] shadow-sm overflow-hidden"
      >

        <img
          src={product.imagem}
          className="w-full h-[110px] object-cover"
        />

        <div className="p-3">

          <h4 className="text-[14px] font-semibold text-[#2d1f1f] line-clamp-2 min-h-[40px]">
            {product.nome}
          </h4>

          <p className="text-[15px] font-bold text-[#2d1f1f] mt-2">
            R$ {product.preco.toFixed(2)}
          </p>

          <button
            disabled={!isOpen}
            onClick={() =>
              addToCart({
                id: product.id,
                title: product.nome,
                price: product.preco,
                image: product.imagem,
                quantity: 1,
                estoque: product.estoque,
              })
            }
            className={`mt-3 w-full py-2 rounded-xl text-sm font-semibold transition-all ${
              isOpen
                ? "bg-[#6d2f2f] text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {isOpen ? "+ Adicionar" : "Fechado"}
          </button>

        </div>

      </div>

    ))}

  </div>

</div>
<div className="border-t border-[#ece7e2] mt-6 pt-6 bg-white pb-4">

  <h3 className="text-[18px] font-bold text-[#2d1f1f] mb-4">
    Seus dados
  </h3>

  <input
    type="text"
    placeholder="Digite seu nome"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full bg-[#faf7f4] border border-[#ece7e2] rounded-2xl px-4 py-3 outline-none text-[16px] mb-3"
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
    className="w-full bg-[#faf7f4] border border-[#ece7e2] rounded-2xl px-4 py-3 outline-none text-[16px]"
  />

  <div className="bg-[#faf7f4] rounded-2xl p-4 mt-4">

    <div className="flex justify-between items-center">

      <span className="text-[#7a7a7a]">
        Subtotal
      </span>

      <span className="font-semibold">
        R$ {total.toFixed(2)}
      </span>

    </div>

    <div className="flex justify-between items-center mt-3">

      <span className="text-[22px] font-bold text-[#2d1f1f]">
        Total
      </span>

      <span className="text-[22px] font-bold text-[#2d1f1f]">
        R$ {total.toFixed(2)}
      </span>

    </div>

  </div>

  <button
  disabled={loading}
  onClick={async () => {

    if (loading) return;

    setLoading(true);

    try {

      if (cart.length === 0) {
        alert("Adicione itens ao carrinho");
        return;
      }

      if (!name.trim()) {
        alert("Preencha o nome");
        return;
      }

      if (phone.replace(/\D/g, "").length < 11) {
        alert("Digite um telefone válido com DDD");
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

if (!response.ok) {
  alert(data.error);
  return;
}

setCart([]);

window.open(data.init_point, "_blank");

    } catch (error) {

      console.error(error);

      alert("Erro ao criar pagamento");

    } finally {

      setLoading(false);

    }

  }}
  className="mt-5 w-full bg-[#6d2f2f] hover:bg-[#5a2525] active:scale-[0.98] transition-all text-white py-4 rounded-2xl text-[18px] font-bold shadow-lg"
>
  {
    loading
      ? "Processando..."
      : `Finalizar pedido • R$ ${total.toFixed(2)}`
  }
</button>

</div>
</div>
</div>
)}
</main>
</>
);
}