"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

type DadosCompra = {
  cart: Item[];
  nome: string;
  telefone: string;
};

type DadosPix = {
  pedidoId: number;
  paymentId: number;
  total: number;
  qrCode: string;
  qrCodeBase64?: string;
};

export default function PagamentoPix() {
  const [compra, setCompra] = useState<DadosCompra | null>(null);
  const [pix, setPix] = useState<DadosPix | null>(null);
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("pending");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    try {
    console.log(
  "DADOS DA COMPRA:",
  sessionStorage.getItem("compraPendentePix")
);
      const pixSalvo = sessionStorage.getItem("pagamentoPix");

      if (pixSalvo) {
        setPix(JSON.parse(pixSalvo));
      } else {
        const compraSalva =
          sessionStorage.getItem("compraPendentePix");

        if (compraSalva) {
          setCompra(JSON.parse(compraSalva));
        } else {
          setErro("Nenhuma compra Pix encontrada.");
        }
      }
    } catch {
      setErro("Não foi possível recuperar sua compra.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!pix?.paymentId || status === "approved") return;

    let ativo = true;

    async function verificarPagamento() {
      try {
        const resposta = await fetch(
          `/api/pix/status?paymentId=${pix!.paymentId}`,
          { cache: "no-store" }
        );

        if (!resposta.ok) return;

        const dados = await resposta.json();

        if (ativo) {
          setStatus(dados.status);
        }
      } catch (error) {
        console.error("Erro ao consultar pagamento:", error);
      }
    }

    verificarPagamento();

    const intervalo = setInterval(verificarPagamento, 5000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [pix?.paymentId, status]);

  function formatarCpf(valor: string) {
    return valor
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  async function gerarPix() {
    if (!compra || loading) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Digite um e-mail válido.");
      return;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      setErro("Digite um CPF válido.");
      return;
    }

    setLoading(true);
setErro("");

try {
  let chavePagamento =
    sessionStorage.getItem("chavePagamentoPix");

  if (!chavePagamento) {
    chavePagamento = crypto.randomUUID();

    sessionStorage.setItem(
      "chavePagamentoPix",
      chavePagamento
    );
  }

  const resposta = await fetch("/api/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: compra.cart,
          nome: compra.nome,
          telefone: compra.telefone,
          email: email.trim(),
          cpf: cpf.replace(/\D/g, ""),
          idempotencyKey: chavePagamento,
          
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.error || "Não foi possível gerar o Pix."
        );
      }

      if (!dados.qrCode || !dados.paymentId) {
        throw new Error("O código Pix não foi recebido.");
      }

      const novoPix: DadosPix = {
        pedidoId: dados.pedidoId,
        paymentId: dados.paymentId,
        total: dados.total,
        qrCode: dados.qrCode,
        qrCodeBase64: dados.qrCodeBase64,
      };

      sessionStorage.setItem(
        "pagamentoPix",
        JSON.stringify(novoPix)
      );

      sessionStorage.removeItem("compraPendentePix");

      setPix(novoPix);
      setStatus(dados.status || "pending");
      setCpf("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao gerar pagamento."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copiarPix() {
    if (!pix) return;

    try {
      await navigator.clipboard.writeText(pix.qrCode);
      alert("Código Pix copiado!");
    } catch {
      alert("Não foi possível copiar o código.");
    }
  }

  const totalPrevisto = compra?.cart.reduce(
    (soma, item) => soma + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-[#6d2f2f]">
          Delícias da Sil 🍰
        </h1>

        <h2 className="mt-6 text-center text-xl font-semibold">
          Pagamento via Pix
        </h2>

        {carregando ? (
          <p className="mt-6 text-center">Carregando...</p>
        ) : !compra && !pix ? (
          <div className="mt-6 text-center">
            <p>{erro}</p>
            <Link
              href="/"
              className="mt-5 inline-block text-[#6d2f2f] underline"
            >
              Voltar para a loja
            </Link>
          </div>
        ) : !pix && compra ? (
          <div className="mt-6">
            <p className="text-center text-gray-600">
              Olá, {compra.nome}!
            </p>

            <p className="mt-3 text-center text-3xl font-bold">
              {totalPrevisto?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            <p className="mt-6 text-sm text-gray-600">
              Informe os dados necessários para gerar seu Pix.
            </p>

            <label className="mt-5 block text-sm font-semibold">
              E-mail
            </label>

            <input
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border p-3 outline-none"
            />

            <label className="mt-4 block text-sm font-semibold">
              CPF
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              maxLength={14}
              value={cpf}
              onChange={(e) =>
                setCpf(formatarCpf(e.target.value))
              }
              className="mt-2 w-full rounded-xl border p-3 outline-none"
            />

            {erro && (
              <p className="mt-4 text-sm text-red-600">
                {erro}
              </p>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={gerarPix}
              className="mt-6 w-full rounded-2xl bg-[#6d2f2f] py-4 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Gerando Pix..." : "Gerar Pix"}
            </button>

            <Link
              href="/"
              className="mt-5 block text-center text-sm text-gray-600 underline"
            >
              Voltar para a loja
            </Link>
          </div>
        ) : pix && status === "approved" ? (
          <div className="mt-8 text-center">
            <p className="text-5xl">✅</p>

            <h3 className="mt-4 text-xl font-bold text-green-700">
              Pagamento aprovado!
            </h3>

            <p className="mt-2">
              Pedido #{pix.pedidoId}
            </p>

            <Link
              href="/meu-pedido"
              className="mt-6 inline-block rounded-xl bg-[#6d2f2f] px-6 py-3 text-white"
            >
              Acompanhar pedido
            </Link>
          </div>
        ) : pix ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Pedido #{pix.pedidoId}
            </p>

            <p className="mt-5 text-3xl font-bold">
              {pix.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            {pix.qrCodeBase64 && (
              <img
                src={`data:image/png;base64,${pix.qrCodeBase64}`}
                alt="QR Code do Pix"
                className="mx-auto mt-6 h-64 w-64"
              />
            )}

            <p className="mt-5 text-sm text-gray-600">
              Escaneie o QR Code ou copie o código abaixo.
            </p>

            <textarea
              readOnly
              value={pix.qrCode}
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border p-3 text-sm"
            />

            <button
              onClick={copiarPix}
              className="mt-4 w-full rounded-2xl bg-[#6d2f2f] py-4 font-bold text-white"
            >
              Copiar código Pix
            </button>

            <p className="mt-5 text-sm text-amber-700">
              {status === "pending"
                ? "Aguardando pagamento..."
                : status === "rejected" ||
                    status === "cancelled"
                  ? "Este pagamento não está mais disponível."
                  : `Status: ${status}`}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}