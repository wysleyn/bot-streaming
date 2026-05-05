const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================= SUPABASE =================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ================= CONFIG =================

const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";
const SEU_NUMERO = "5524999096129";

const BOT_ATIVO = true;

// ================= MENSAGENS =================

const mensagemMenu = `📋 *Menu ATLAS*

+ de 1.000 clientes já utilizam ✅

1️⃣ Teste grátis  
2️⃣ Ver planos  
3️⃣ Perguntas frequentes  
4️⃣ Indique e ganhe  
5️⃣ Já sou cliente  
6️⃣ Suporte  

Digite a opção 👇
Digite *menu* para voltar.`;

const mensagemFAQ = `❓ *Perguntas Frequentes*

🔹 Funciona na minha TV?
Sim, Smart TV, TV Box, Fire TV, celular e computador.

🔹 Posso testar antes?
Sim, oferecemos teste gratuito de 3 horas.

🔹 O acesso cai muito?
Sistema estável e atualizado constantemente.

Digite *menu* para voltar.`;

const mensagemIndique = `💰 *Indique e Ganhe – ATLAS*

A cada 2 amigos ativos:
🎁 Você ganha 1 mês grátis.

Após 10 ativos:
💵 Você ganha R$10 por cliente.

Digite *menu* para voltar.`;

const mensagemJaCliente = `👤 *Área do Cliente*

1️⃣ Renovar plano  
2️⃣ Problema no acesso  
3️⃣ Alterar dispositivo  
4️⃣ Falar com suporte  

Digite a opção 👇
Digite *menu* para voltar.`;

const mensagemPlanos = `🔥 *PLANOS ATLAS*

1️⃣ 1 mês – R$ 29,90  
2️⃣ 2 meses – R$ 49,90  
3️⃣ 3 meses – R$ 74,90  
4️⃣ 4 meses – R$ 99,90  
5️⃣ 6 meses – R$ 149,90  
6️⃣ 12 meses – R$ 249,90  

Digite o plano desejado 👇
Digite *menu* para voltar.`;

// ================= FUNÇÕES =================

async function criarOuBuscarUsuario(phone) {
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (existingUser) return existingUser;

  const ultimos4 = phone.slice(-4);
  const cupom = `ATLAS${ultimos4}`;

  const { data } = await supabase
    .from("users")
    .insert([{ phone, cupom, etapa: "menu" }])
    .select()
    .single();

  return data;
}

async function atualizarUsuario(phone, dados) {
  await supabase.from("users").update(dados).eq("phone", phone);
}

async function enviarMensagem(to, body) {
  await axios.get(
    `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
    { params: { token: TOKEN, to, body } }
  );
}

// ================= WEBHOOK =================

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.event_type === "message_received" && body.data) {

      const from = body.data.from.replace("@c.us", "");
      const message = body.data.body?.trim().toLowerCase();

      const user = await criarOuBuscarUsuario(from);
      if (!user) return res.sendStatus(200);
      if (!BOT_ATIVO) return res.sendStatus(200);

      // MENU UNIVERSAL
      if (message === "menu") {
        await atualizarUsuario(from, { etapa: "menu" });
        await enviarMensagem(from, mensagemMenu);
        return res.sendStatus(200);
      }

      switch (user.etapa) {

        case "menu":

          if (message === "1") {
            await atualizarUsuario(from, { etapa: "escolhendo_aparelho" });
            await enviarMensagem(from, `✅ Teste gratuito (3 horas)

Escolha o aparelho:

1️⃣ Smart TV / TV Box
2️⃣ Celular
3️⃣ Notebook

Digite *menu* para voltar.`);
          }

          else if (message === "2") {
            await atualizarUsuario(from, { etapa: "escolhendo_plano" });
            await enviarMensagem(from, mensagemPlanos);
          }

          else if (message === "3") {
            await enviarMensagem(from, mensagemFAQ);
          }

          else if (message === "4") {
            await enviarMensagem(from, mensagemIndique);
          }

          else if (message === "5") {
            await enviarMensagem(from, mensagemJaCliente);
          }

          else if (message === "6" || message === "suporte") {
            await atualizarUsuario(from, { etapa: "suporte" });
            await enviarMensagem(from, "👨‍💻 Descreva sua dúvida que vou te ajudar ✅");
            await enviarMensagem(SEU_NUMERO, `📞 Cliente chamou suporte\nNúmero: ${from}`);
          }

          else {
            await enviarMensagem(from, mensagemMenu);
          }

          break;

   case "escolhendo_aparelho":

  let instrucao = "";

  if (message === "1") {
    instrucao = `✅ Vamos configurar seu teste (3 horas).

📺 Instalação na TV:

Baixe o aplicativo:
✅ Fun Play

Passo a passo:
1️⃣ Abra a loja da sua TV  
2️⃣ Procure por: Fun Play  
3️⃣ Instale  
4️⃣ Abra o app e me avise ✅  

⚠️ Caso não encontre o aplicativo ou tenha dificuldade, digite *suporte* que eu te ajudo.

Digite *menu* para voltar.`;
  }

  else if (message === "2") {
    instrucao = `✅ Vamos configurar seu teste (3 horas).

📱 Instalação no celular:

Baixe o aplicativo:
✅ Blessed Player

Disponível na Play Store ou App Store.

1️⃣ Abra a loja  
2️⃣ Procure por: Blessed Player  
3️⃣ Instale  
4️⃣ Abra e me avise ✅  

⚠️ Se não encontrar ou tiver dificuldade, digite *suporte*.

Digite *menu* para voltar.`;
  }

  else if (message === "3") {
    instrucao = `✅ Vamos configurar seu teste (3 horas).

💻 Instalação no Notebook ou Computador:

Use o:
✅ Web Player Atlas

Acesse pelo navegador:
🔗 (COLOQUE AQUI O LINK)

Abra o site e me avise ✅  

⚠️ Se tiver dificuldade para acessar, digite *suporte*.

Digite *menu* para voltar.`;
  }

  if (instrucao) {
    await atualizarUsuario(from, { etapa: "menu" });
    await enviarMensagem(from, instrucao);
    await enviarMensagem(SEU_NUMERO, `🎁 Novo teste solicitado\nNúmero: ${from}`);
  }

  break;

        case "escolhendo_plano":

          const planos = {
            "1": { nome: "1 mês", valor: 29.90 },
            "2": { nome: "2 meses", valor: 49.90 },
            "3": { nome: "3 meses", valor: 74.90 },
            "4": { nome: "4 meses", valor: 99.90 },
            "5": { nome: "6 meses", valor: 149.90 },
            "6": { nome: "12 meses", valor: 249.90 }
          };

          if (planos[message]) {
            await atualizarUsuario(from, {
              etapa: "escolhendo_telas",
              plano_temp: planos[message].nome,
              valor_temp: planos[message].valor
            });

            await enviarMensagem(from, `📺 Quantos aparelhos deseja usar simultaneamente?

1️⃣ 1 aparelho (valor base)
2️⃣ 2 aparelhos (+ R$5)
3️⃣ 3 aparelhos (+ R$10)
4️⃣ 4 aparelhos (+ R$15)

Digite *menu* para voltar.`);
          }

          break;

        case "escolhendo_telas":

          const telas = parseInt(message);

          if (telas >= 1 && telas <= 4) {

            const adicionais = (telas - 1) * 5;
            const valorFinal = user.valor_temp + adicionais;

            await atualizarUsuario(from, {
              etapa: "confirmando_pagamento",
              telas_temp: telas,
              valor_final_temp: valorFinal
            });

            await enviarMensagem(from, `✅ Resumo:

📅 Plano: ${user.plano_temp}
📺 Aparelhos: ${telas}

💰 Valor total: R$ ${valorFinal.toFixed(2)}

1️⃣ Confirmar
2️⃣ Escolher outro plano

Digite *menu* para voltar.`);
          }

          break;
case "confirmando_pagamento":

  if (message === "1") {

    await enviarMensagem(from, "🔄 Gerando seu pagamento PIX...");

const payment = await axios.post(
  "https://api.mercadopago.com/v1/payments",
  {
    transaction_amount: user.valor_final_temp,
    description: `Plano ${user.plano_temp} - ${user.telas_temp} telas`,
    payment_method_id: "pix",
    payer: {
      email: "cliente@atlas.com",
      first_name: "Cliente",
      last_name: "Atlas"
    }
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "X-Idempotency-Key": `pix-${Date.now()}-${from}`
    }
  }
);

    const pixCode = payment.data.point_of_interaction.transaction_data.qr_code;
    const pixBase64 = payment.data.point_of_interaction.transaction_data.qr_code_base64;

    await atualizarUsuario(from, {
      etapa: "aguardando_pagamento",
      payment_id: payment.data.id
    });

    await enviarMensagem(from, `✅ PIX gerado com sucesso!

💰 Valor: R$ ${user.valor_final_temp.toFixed(2)}

📲 Copie e cole o código abaixo no seu app bancário:

${pixCode}

Assim que o pagamento for confirmado, seu acesso será liberado ✅

Digite *menu* para voltar.`);

  }

  else if (message === "2") {
    await atualizarUsuario(from, { etapa: "escolhendo_plano" });
    await enviarMensagem(from, mensagemPlanos);
  }

  break;

        default:
          await atualizarUsuario(from, { etapa: "menu" });
          await enviarMensagem(from, mensagemMenu);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error(error);
    res.sendStatus(200);
  }
});
// ================= WEBHOOK MERCADO PAGO =================

app.post("/mercadopago", async (req, res) => {

  try {

    if (req.body.type !== "payment") return res.sendStatus(200);

    const paymentId = req.body.data.id;

    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    if (payment.data.status === "approved") {

      const valor = payment.data.transaction_amount;
      const phone = payment.data.payer.email.replace("@atlas.com", "");

      await enviarMensagem(phone, `✅ Pagamento confirmado!

Seu plano foi ativado com sucesso ✅

Vou liberar seu acesso agora.

Obrigado por escolher o ATLAS! 📡`);

      await enviarMensagem(SEU_NUMERO, `💰 PAGAMENTO CONFIRMADO

Número: ${phone}
Valor: R$ ${valor}

Liberar login.`);
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Erro Mercado Pago:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});
app.listen(PORT, () => {
  console.log("ATLAS Bot rodando ✅");
});
