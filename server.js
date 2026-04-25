const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ TOKEN CORRETO DA INSTÂNCIA
const TOKEN = "a2sgqtw8lehf0q3i";

// ✅ SOMENTE O NÚMERO DA INSTÂNCIA
const INSTANCE_ID = "171812";

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Webhook UltraMsg recebido:");
  console.log(JSON.stringify(body, null, 2));

  if (
    body.event_type === "message_received" &&
    body.data &&
    body.data.fromMe === false
  ) {
    const from = body.data.from.replace("@c.us", "");
    const message = body.data.body.trim().toLowerCase();

    let resposta = "";

    // ✅ MENU INICIAL
    if (message === "oi" || message === "menu") {
      resposta = `👋 Seja bem-vindo(a) à *MasterPlay* 🎬🔥

Hoje, para ter acesso completo aos principais conteúdos, você precisaria assinar várias plataformas como Netflix, Prime Video, Disney+, HBO, Globoplay, Crunchyroll, Rakuten Viki, Apple TV+, Paramount+ e Star+.

💰 Somando tudo isso, você gastaria facilmente mais de R$ 200 por mês 😳

Com a *MasterPlay* você paga apenas UMA única vez e tem acesso completo direto no seu celular.

✅ Pagamento único  
✅ Sem mensalidade  
✅ Acesso vitalício  
✅ Conteúdos organizados e atualizados  

Escolha uma opção abaixo:

1️⃣ Como funciona  
2️⃣ Ver conteúdos disponíveis  
3️⃣ Garantir acesso vitalício agora`;
    }

    // ✅ OPÇÃO 1
    else if (message === "1") {
      resposta = `📱 *Como funciona a MasterPlay?*

1️⃣ Você realiza o pagamento único  
2️⃣ Recebe o aplicativo imediatamente  
3️⃣ Instala no seu celular Android  
4️⃣ Pronto ✅ Acesso liberado para sempre

Sem mensalidade.
Sem renovação automática.
Sem cobranças futuras.

Digite *menu* para voltar.`;
    }

    // ✅ OPÇÃO 2
    else if (message === "2") {
      resposta = `🎬 *Tudo o que você encontra na MasterPlay:*

🍿 Filmes para assistir hoje mesmo  
📺 Séries completas para maratonar  
🎌 Animes atualizados  
🌎 Doramas e conteúdos internacionais  
📡 Novelas e programas populares  
🔥 Categorias organizadas e fáceis de navegar  

Tudo em um único aplicativo 📱✨

Digite *menu* para voltar  
ou escolha:

3️⃣ Garantir acesso vitalício agora`;
    }

    // ✅ OPÇÃO 3 (VENDA)
    else if (message === "3") {
      resposta = `🔥 *Acesso Vitalício MasterPlay*

Hoje você pode garantir acesso completo pagando apenas:

💰 R$ 49,90 (pagamento único)

Enquanto muitos pagam mais de R$ 200 todos os meses em assinaturas separadas…

Você resolve tudo com um único pagamento.

✅ Sem mensalidade  
✅ Sem renovação automática  
✅ Sem taxas escondidas  
✅ Acesso imediato após pagamento  

Clique abaixo para garantir agora:

👉 https://mpago.la/319JmBC

Assim que o pagamento for confirmado, seu acesso é liberado ✅

Digite *menu* para voltar.`;
    }

    // ✅ QUALQUER OUTRA MENSAGEM
    else {
      resposta = `❓ Não entendi sua mensagem.

Digite *menu* para ver as opções disponíveis.`;
    }

    try {
      const response = await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: from,
            body: resposta
          }
        }
      );

      console.log("✅ Resposta enviada:", response.data);

    } catch (error) {
      console.error(
        "❌ Erro ao enviar mensagem:",
        error.response?.data || error.message
      );
    }
  }

  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});