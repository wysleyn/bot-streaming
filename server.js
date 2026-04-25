const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";

const VIDEO_URL = "https://files.catbox.moe/hdreo7.mp4";

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (
    body.event_type === "message_received" &&
    body.data &&
    body.data.fromMe === false
  ) {
    const from = body.data.from.replace("@c.us", "");
    const message = body.data.body.trim().toLowerCase();

    let resposta = "";

    // ✅ MENSAGEM INICIAL (EXATAMENTE COMO VOCÊ DEFINIU)
    if (message === "oi" || message === "menu") {
      resposta = `👋 Seja bem-vindo(a) à *MasterPlay* 🎬🔥

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

Com a *MasterPlay* você paga apenas *UMA única vez* e tem acesso direto no seu celular.

✅ Pagamento único  
✅ Sem mensalidade  
✅ Acesso vitalício  
✅ Conteúdos organizados e atualizados  

━━━━━━━━━━━━━━━

Escolha uma opção:

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte`;
    }

    // ✅ OPÇÃO 2 – ENVIA VÍDEO + TEXTO
    else if (message === "2") {

      try {
        // ✅ Enviar vídeo via POST
        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/video`,
          new URLSearchParams({
            token: TOKEN,
            to: from,
            video: VIDEO_URL,
            caption:
              "🎬 Esse é o aplicativo funcionando na prática.\n\nTudo organizado, rápido e fácil de usar 📱✨"
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        );

        console.log("✅ Vídeo enviado com sucesso");

      } catch (error) {
        console.error("❌ Erro ao enviar vídeo:", error.response?.data || error.message);
      }

      // ✅ Texto complementar
      resposta = `🎬 *Tudo o que você encontra dentro da MasterPlay:*

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

Escolha a próxima opção:

1️⃣ Como funciona  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte`;
    }

    // ✅ OPÇÃO 1
    else if (message === "1") {
      resposta = `📱 *Como funciona?*

1️⃣ Você realiza o pagamento único  
2️⃣ Recebe o aplicativo imediatamente  
3️⃣ Instala no seu celular  
4️⃣ Acesso liberado ✅

━━━━━━━━━━━━━━━

Escolha:

2️⃣ Ver conteúdos  
3️⃣ Garantir acesso  
4️⃣ Falar com suporte`;
    }

    // ✅ OPÇÃO 3
    else if (message === "3") {
      resposta = `🔥 *Acesso Vitalício MasterPlay*

Valor único:

💰 R$ 49,90

Você paga uma vez e usa para sempre.

✅ Sem mensalidade  
✅ Liberação rápida após pagamento  
✅ Acesso imediato  

━━━━━━━━━━━━━━━

👉 https://mpago.la/319JmBC

━━━━━━━━━━━━━━━

Escolha:

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
4️⃣ Falar com suporte`;
    }

    // ✅ SUPORTE
    else if (message === "4") {
      resposta = `👨‍💻 Você escolheu falar com o suporte.

Envie sua dúvida que iremos responder o mais rápido possível ✅`;
    }

    // ✅ PADRÃO
    else {
      resposta = `Digite *menu* para ver as opções disponíveis.`;
    }

    if (resposta) {
      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: from,
            body: resposta
          }
        }
      );
    }
  }

  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});