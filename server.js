const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================= CONFIGURAÇÕES =================

// ULTRAMSG
const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";

// MERCADO PAGO PRODUÇÃO
const MP_ACCESS_TOKEN = "APP_USR-6837348167992487-042516-9a8c1623514fc61737d98fc71f832f25-256715443";

// APK
const APK_LINK = "https://files.catbox.moe/vm1bsw";

// VÍDEO
const VIDEO_URL = "https://files.catbox.moe/hdreo7.mp4";

// SEU NÚMERO PARA SUPORTE
const SEU_NUMERO = "5524999096129";

// ================= MENSAGENS =================

const mensagemInicial = `👋 Seja bem-vindo(a) à *MasterPlay* 🎬🔥

Hoje, para ter acesso completo aos principais conteúdos, você precisaria assinar várias plataformas como:

📺 Netflix – R$ 39,90/mês  
🎬 Prime Video – R$ 19,90/mês  
🦁 Disney+ – R$ 33,90/mês  
🎥 HBO – R$ 34,90/mês  
📡 Globoplay – R$ 27,90/mês  
🎌 Crunchyroll – R$ 14,99/mês  
🌎 Rakuten Viki – R$ 25,99/mês  
🍎 Apple TV+ – R$ 21,90/mês  
🎞 Paramount+ – R$ 19,90/mês  
⭐ Star+ – R$ 40,90/mês  

💸 Somando tudo isso, você poderia gastar facilmente mais de *R$ 200 todos os meses*.

Com a *MasterPlay* você paga apenas *UMA única vez*.

✅ Pagamento único  
✅ Sem mensalidade  
✅ Acesso vitalício  
✅ Conteúdos organizados e atualizados  

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;

const mensagemComoFunciona = `📱 *Como funciona?*

1️⃣ Você realiza o pagamento único  
2️⃣ Recebe o aplicativo imediatamente  
3️⃣ Instala no seu celular  
4️⃣ Acesso liberado ✅

Sem mensalidade.
Sem renovação automática.
Sem cobranças futuras.

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;

const mensagemConteudoTexto = `🎬 *Tudo o que você encontra dentro da MasterPlay:*

Imagine abrir um único aplicativo e ter acesso a:

🍿 Filmes para assistir hoje mesmo  
📺 Séries completas para maratonar sem parar  
🎌 Animes atualizados  
🌎 Doramas e conteúdos internacionais  
📡 Novelas e programas populares  
🔥 Categorias organizadas e fáceis de navegar  

Sem precisar trocar de aplicativo.
Sem pagar várias assinaturas.
Sem limite de acesso.

É como ter várias plataformas reunidas em um só lugar, direto no seu celular 📱✨

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;

const mensagemFAQ = `❓ *Perguntas Frequentes – MasterPlay*

🔹 Funciona em qual celular?
Funciona em celulares Android.

🔹 Funciona em iPhone?
Não. O aplicativo é exclusivo para Android.

🔹 Precisa pagar todo mês?
Não. O pagamento é único e o acesso é vitalício ✅

🔹 O acesso expira?
Não. Após o pagamento, o acesso é permanente.

🔹 Como recebo o aplicativo?
Após o pagamento aprovado, você recebe automaticamente aqui no WhatsApp.

🔹 É seguro o pagamento?
Sim. O pagamento é processado pelo Mercado Pago 🔒

🔹 O conteúdo é atualizado?
Sim. Novos conteúdos são adicionados frequentemente.

🔹 Tem canais ao vivo?
Não. A MasterPlay não possui canais ao vivo.
O foco é conteúdo sob demanda.

🔹 Funciona na televisão?
O aplicativo não é instalado diretamente na TV.
Mas você pode espelhar o conteúdo 📺✨

🔹 Se eu trocar de celular, perco acesso?
Não. Você pode instalar novamente no novo aparelho.

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte`;

// ================= STATUS =================

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

// ================= WEBHOOK WHATSAPP =================

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (
      body.event_type === "message_received" &&
      body.data &&
      body.data.fromMe === false
    ) {
      const from = body.data.from.replace("@c.us", "");
      const message = body.data.body.trim().toLowerCase();

      let resposta = "";

      // MENU INTELIGENTE
      if (
        message === "oi" ||
        message === "menu" ||
        message.includes("quero conhecer") ||
        message.includes("quero saber")
      ) {
        resposta = mensagemInicial;
      }

      else if (message === "1" || message.includes("como funciona")) {
        resposta = mensagemComoFunciona;
      }

      else if (message === "2" || message.includes("conteúdo")) {

        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/video`,
          new URLSearchParams({
            token: TOKEN,
            to: from,
            video: VIDEO_URL,
            caption:
              "🎬 Esse é o aplicativo funcionando na prática.\n\nTudo organizado, rápido e fácil de usar 📱✨"
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        resposta = mensagemConteudoTexto;
      }

      else if (
        message === "3" ||
        message.includes("preço") ||
        message.includes("valor")
      ) {

        const preference = await axios.post(
          "https://api.mercadopago.com/checkout/preferences",
          {
            items: [
              {
                title: "MasterPlay",
                quantity: 1,
                unit_price: 1.00
              }
            ],
            metadata: { phone: from },
            notification_url:
              "https://bot-streaming-41zm.onrender.com/mercadopago"
          },
          {
            headers: {
              Authorization: `Bearer ${MP_ACCESS_TOKEN}`
            }
          }
        );

        resposta = `🔥 *Acesso Vitalício MasterPlay*

Valor único:

💰 R$ 49,90

✅ Sem mensalidade  
✅ Liberação automática  

━━━━━━━━━━━━━━━

👉 ${preference.data.init_point}

Após o pagamento, seu acesso será liberado automaticamente ✅

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;
      }

      else if (message === "4") {

        resposta = `👨‍💻 Você escolheu falar com o suporte.

Aguarde que entraremos em contato ✅`;

        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
          new URLSearchParams({
            token: TOKEN,
            to: SEU_NUMERO,
            body: `📞 NOVO PEDIDO DE SUPORTE\n\nNúmero do cliente: ${from}`
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
      }

      else if (message === "5") {
        resposta = mensagemFAQ;
      }

      else {
        resposta = "Digite *menu* para ver as opções.";
      }

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: { token: TOKEN, to: from, body: resposta }
        }
      );
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Erro WhatsApp:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});

// ================= WEBHOOK MERCADO PAGO =================

app.post("/mercadopago", async (req, res) => {
  try {
    if (req.body.type !== "payment") return res.sendStatus(200);

    const paymentId = req.body.data?.id;

    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    if (payment.data.status === "approved") {

      const phone = payment.data.metadata?.phone;

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: phone,
            body: `✅ Pagamento confirmado!

📥 Baixe o aplicativo:
${APK_LINK}

Aproveite ✅`
          }
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro Mercado Pago:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});