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
const mensagemBoasVindas = `🚀 *BEM-VINDO À EXPERIÊNCIA ATLAS!* 🚀

Prepare-se para o melhor do entretenimento digital. Chega de pagar caro por planos limitados e sofrer com travamentos na hora do seu lazer! 📺✨

✅ *O QUE VOCÊ TERÁ ACESSO:*

⚽ *ESPORTES AO VIVO:* Todos os jogos do seu time! Premiere, ESPN, Combate, DAZN e muito mais. Não perca nenhum lance!
📺 *CANAIS AO VIVO:* Grade completa de canais abertos e fechados, todos em Full HD e 4K.
🍿 *CINEMA EM CASA:* Filmes que acabaram de sair do cinema e as séries mais comentadas do momento (Netflix, Disney+, HBO).
🌟 + de 1.000 clientes satisfeitos e estabilidade 99.9%.

🎁 *QUE TAL UM TESTE GRÁTIS?*
Liberei **3 horas de acesso total** para você sentir a qualidade agora mesmo!

👇 *Escolha uma opção abaixo:*`;

const mensagemMenu = `📋 *Menu Principal ATLAS*

1️⃣ Teste grátis (3 horas) 🎁
2️⃣ Ver planos e preços 🔥
3️⃣ Perguntas frequentes ❓
4️⃣ Indique e ganhe 💰
5️⃣ Já sou cliente 👤
6️⃣ Falar com suporte 👨‍💻

Digite o número da opção desejada 👇
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
    .insert([{ phone, cupom, etapa: "inicio" }]) // ✅ Novo cliente começa em "inicio"
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

    // Verifica se o evento é uma mensagem recebida
    if (body.event_type === "message_received" && body.data) {
      
      // ✅ 1. DETECÇÃO DE INTERVENÇÃO HUMANA (Resposta manual)
      if (body.data.from_me === true) {
        const clientePhone = body.data.to.replace("@c.us", "");
        
        // Se você mandar mensagem e não for o comando "menu", o bot entra em suporte
        if (body.data.body?.toLowerCase() !== "menu") {
          await atualizarUsuario(clientePhone, { etapa: "suporte" });
          console.log(`[SUPORTE] Bot pausado para ${clientePhone} devido a resposta manual.`);
          return res.sendStatus(200);
        }
      }

      // ✅ 2. DADOS DA MENSAGEM DO CLIENTE
      const from = body.data.from.replace("@c.us", "");
      const message = body.data.body?.trim().toLowerCase();

      // ✅ 3. GARANTE QUE O USUÁRIO EXISTA NO BANCO
      await criarOuBuscarUsuario(from);

      // ✅ 4. PEGA OS DADOS ATUALIZADOS DO USUÁRIO
      let { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("phone", from)
        .single();

      if (!user) return res.sendStatus(200);
      if (!BOT_ATIVO) return res.sendStatus(200);

      // ✅ 5. MENU UNIVERSAL (Se o cliente digitar menu, o bot acorda)
      if (message === "menu") {
        await atualizarUsuario(from, { etapa: "menu" });
        await enviarMensagem(from, mensagemMenu);
        return res.sendStatus(200);
      }

      // ✅ 6. BUSCAR ETAPA ATUAL ANTES DO SWITCH
      const { data: usuarioAtual } = await supabase
        .from("users")
        .select("*")
        .eq("phone", from)
        .single();

      switch (usuarioAtual.etapa) {
        // ... aqui continua o seu switch case normalmente
case "inicio":
  await enviarMensagem(from, mensagemBoasVindas);
  setTimeout(async () => {
    await enviarMensagem(from, mensagemMenu);
  }, 1000); // 1 segundo de intervalo entre as mensagens
  await atualizarUsuario(from, { etapa: "menu" });
  return res.sendStatus(200);
case "menu":

  if (message === "1") {
    await atualizarUsuario(from, { etapa: "escolhendo_aparelho" });
    await enviarMensagem(from, `✅ Teste gratuito (3 horas)

Escolha o aparelho:

1️⃣ Smart TV / TV Box
2️⃣ Celular
3️⃣ Notebook

Digite *menu* para voltar.`);
    return res.sendStatus(200);
  }

  else if (message === "2") {
    await atualizarUsuario(from, { etapa: "escolhendo_plano" });
    await enviarMensagem(from, mensagemPlanos);
    return res.sendStatus(200);
  }

  else if (message === "3") {
    await enviarMensagem(from, mensagemFAQ);
    return res.sendStatus(200);
  }

  else if (message === "4") {
    await atualizarUsuario(from, { etapa: "indique_confirmar" });
    await enviarMensagem(from, `💰 *Indique e Ganhe – ATLAS*

A cada 2 amigos ativos:
🎁 Você ganha 1 mês grátis.

Após 10 ativos:
💵 Você ganha R$10 por cliente.

Deseja participar?

1️⃣ Sim, quero meu código
2️⃣ Voltar

Digite a opção 👇
Digite *menu* para voltar.`);
    return res.sendStatus(200);
  }

  else if (message === "5") {
    await atualizarUsuario(from, { etapa: "area_cliente" });
    await enviarMensagem(from, mensagemJaCliente);
    return res.sendStatus(200);
  }

  else if (message === "6" || message === "suporte") {
    await atualizarUsuario(from, { etapa: "suporte" });
    await enviarMensagem(from, "👨‍💻 Descreva sua dúvida que vou te ajudar ✅");
    await enviarMensagem(SEU_NUMERO, `📞 Cliente chamou suporte\nNúmero: ${from}`);
    return res.sendStatus(200);
  }

  else {
    await enviarMensagem(from, mensagemMenu);
    return res.sendStatus(200);
  }

          break;

   case "escolhendo_aparelho":
if (usuarioAtual.ja_testou) {
  await enviarMensagem(from, `⚠️ Você já utilizou seu teste gratuito.

Escolha um plano para continuar:

1️⃣ Ver planos
2️⃣ Falar com suporte

Digite *menu* para voltar.`);
  break;
}
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

  const agora = new Date();
  const fim = new Date(agora.getTime() + 3 * 60 * 60 * 1000); // 3 horas

await atualizarUsuario(from, {
  etapa: "teste_ativo",
  teste_inicio: agora,
  teste_fim: fim,
  ja_testou: true
});

  await enviarMensagem(from, instrucao);
  await enviarMensagem(SEU_NUMERO, `🎁 Novo teste iniciado\nNúmero: ${from}`);

  // ✅ AGENDAR FIM DO TESTE
  setTimeout(async () => {

    await enviarMensagem(from, `⏰ Seu teste do ATLAS foi encerrado.

Agora que você já viu a qualidade e estabilidade ✅

Escolha um plano para continuar:

1️⃣ Ver planos  
2️⃣ Falar com suporte  

Digite a opção desejada 👇
Digite *menu* para voltar.`);

    await atualizarUsuario(from, { etapa: "menu" });

  }, 3 * 60 * 60 * 1000); // 3 horas
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
// ... dentro do switch (usuarioAtual.etapa)

    case "escolhendo_telas":
      const opcoesTelas = {
        "1": { qtd: 1, extra: 0 },
        "2": { qtd: 2, extra: 5 },
        "3": { qtd: 3, extra: 10 },
        "4": { qtd: 4, extra: 15 }
      };

      if (opcoesTelas[message]) {
        const extra = opcoesTelas[message].extra;
        const valorBase = parseFloat(usuarioAtual.valor_temp) || 0;
        const valorFinal = valorBase + extra;

        await atualizarUsuario(from, {
          etapa: "validando_cupom",
          telas_temp: opcoesTelas[message].qtd, 
          valor_final_temp: valorFinal
        });

        await enviarMensagem(from, `✅ Ótima escolha!

Você tem algum cupom de desconto? 
Digite o código do cupom ou digite *0* para continuar sem cupom.`);
      } else {
        await enviarMensagem(from, "⚠️ Opção inválida. Escolha de 1 a 4 ou digite menu.");
      }
      break;

// ... aqui continua o case "validando_cupom"
    case "validando_cupom":
      // Pegar dados do usuário que está comprando
      const { data: usuarioComprando, error: erroUser } = await supabase
        .from("users")
        .select("*")
        .eq("phone", from)
        .single();

      if (message === "0") {
        await atualizarUsuario(from, { etapa: "confirmando_pagamento" });
        await enviarMensagem(from, `✅ Resumo:
📅 Plano: ${usuarioComprando.plano_temp}
📺 Aparelhos: ${usuarioComprando.telas_temp}

💰 Valor total: R$ ${usuarioComprando.valor_final_temp.toFixed(2)}

1️⃣ Confirmar
2️⃣ Escolher outro plano

Digite menu para voltar.`);
        break;
      }

      const cupomDigitado = message.trim().toUpperCase();
      console.log(`[DEBUG] Tentando cupom: ${cupomDigitado} para o usuário: ${from}`);

      // BUSCA O DONO DO CUPOM
      const { data: donoDoCupom, error: erroBusca } = await supabase
        .from("users")
        .select("*")
        .eq("cupom", cupomDigitado)
        .maybeSingle();

      if (erroBusca) {
        console.error("[ERRO SUPABASE]:", erroBusca.message);
        await enviarMensagem(from, "⚠️ Erro técnico ao validar cupom. Tente novamente ou digite 0.");
        break;
      }

      if (!donoDoCupom) {
        await enviarMensagem(from, `❌ Cupom *${cupomDigitado}* inválido.
        
Verifique se digitou corretamente ou envie *0* para continuar sem desconto.`);
        break;
      }

      if (donoDoCupom.phone === from) {
        await enviarMensagem(from, "⚠️ Você não pode usar seu próprio cupom.");
        break;
      }

      // Cálculo do desconto (usando o nome correto da variável)
      let novoValor = usuarioComprando.valor_final_temp;
      if (usuarioComprando.plano_temp === "1 mês") {
        novoValor = usuarioComprando.valor_final_temp - 5;
      }

      await atualizarUsuario(from, {
        indicador_id: donoDoCupom.id,
        valor_final_temp: novoValor,
        etapa: "confirmando_pagamento"
      });

      console.log(`[SUCESSO] Cupom ${cupomDigitado} aplicado. Novo valor: ${novoValor}`);

      // MENSAGEM FINAL FORMATADA
      await enviarMensagem(from, `✅ Cupom aplicado com sucesso!

📅 Plano: ${usuarioComprando.plano_temp}
📺 Aparelhos: ${usuarioComprando.telas_temp}

💰 Novo valor: R$ ${novoValor.toFixed(2)}

1️⃣ Confirmar
2️⃣ Escolher outro plano

Digite *menu* para voltar.`);
      break;   
case "confirmando_pagamento":
const { data: usuarioPagamento } = await supabase
  .from("users")
  .select("*")
  .eq("phone", from)
  .single();
  if (message === "1") {

    await enviarMensagem(from, "🔄 Gerando seu pagamento PIX...");

    const payment = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
    transaction_amount: usuarioPagamento.valor_final_temp,
description: `Plano ${usuarioPagamento.plano_temp} - ${usuarioPagamento.telas_temp} telas`,
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

    await atualizarUsuario(from, {
      payment_id: payment.data.id
    });

    const pixCode = payment.data.point_of_interaction.transaction_data.qr_code.trim();
    const pixBase64 = payment.data.point_of_interaction.transaction_data.qr_code_base64;

    await enviarMensagem(from, `✅ PIX gerado com sucesso!

💰 Valor: R$ ${usuarioPagamento.valor_final_temp.toFixed(2)}

Você pode pagar de duas formas:

1️⃣ Escaneando o QR Code abaixo  
2️⃣ Copiando o código da próxima mensagem 👇`);

    await enviarMensagem(from, pixCode);

    await axios.post(
      `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/image`,
      new URLSearchParams({
        token: TOKEN,
        to: from,
        image: `data:image/png;base64,${pixBase64}`,
        caption: "✅ Escaneie o QR Code para pagar"
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  }

 else if (message === "2") {
  await atualizarUsuario(from, { etapa: "escolhendo_plano" });
  await enviarMensagem(from, mensagemPlanos);
  return res.sendStatus(200);
}

  break;



case "area_cliente":

  if (message === "1") {

    if (!user.plano_fim || !user.plano_temp || !user.telas_temp) {

      await enviarMensagem(from, `⚠️ Não encontramos um plano ativo.

Digite *menu* para voltar.`);
      break;
    }

    const vencimento = new Date(user.plano_fim).toLocaleDateString("pt-BR");

    await atualizarUsuario(from, { etapa: "renovando_plano" });

    await enviarMensagem(from, `📅 Seu plano atual vence em: ${vencimento}

Deseja renovar agora mantendo:

📅 ${user.plano_temp}
📺 ${user.telas_temp} aparelhos

1️⃣ Sim, renovar agora
2️⃣ Voltar

Digite *menu* para voltar.`);
  }

  else if (message === "2" || message === "3" || message === "4") {
    await enviarMensagem(from, "👨‍💻 Descreva sua dúvida que vou te ajudar ✅");
    await enviarMensagem(SEU_NUMERO, `📞 Cliente solicitou suporte\nNúmero: ${from}`);
  }

  break;



case "renovando_plano":
const { data: usuarioRenovacao } = await supabase
  .from("users")
  .select("*")
  .eq("phone", from)
  .single();
  if (message === "1") {

    await enviarMensagem(from, "🔄 Gerando PIX para renovação...");

    const payment = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
transaction_amount: usuarioRenovacao.valor_final_temp,
description: `Renovação ${usuarioRenovacao.plano_temp} - ${usuarioRenovacao.telas_temp} telas`,
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
          "X-Idempotency-Key": `renovacao-${Date.now()}-${from}`
        }
      }
    );

    await atualizarUsuario(from, {
      payment_id: payment.data.id,
      etapa: "menu"
    });

    const pixCode = payment.data.point_of_interaction.transaction_data.qr_code.trim();
    const pixBase64 = payment.data.point_of_interaction.transaction_data.qr_code_base64;

    await enviarMensagem(from, `✅ PIX de renovação gerado!

💰 Valor: R$ ${usuarioRenovacao.valor_final_temp.toFixed(2)}

Copie o código da próxima mensagem ou escaneie o QR abaixo 👇`);

    await enviarMensagem(from, pixCode);

    await axios.post(
      `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/image`,
      new URLSearchParams({
        token: TOKEN,
        to: from,
        image: `data:image/png;base64,${pixBase64}`,
        caption: "✅ Escaneie o QR Code para renovar"
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

  }

  else if (message === "2") {
    await atualizarUsuario(from, { etapa: "menu" });
    await enviarMensagem(from, mensagemMenu);
  }

  break; 
case "indique_confirmar":

  if (message === "1") {

    const codigo = user.cupom;

    await atualizarUsuario(from, { etapa: "menu" });

    await enviarMensagem(from, `✅ Você agora participa do Indique e Ganhe!

Seu código exclusivo é:

${codigo}

Compartilhe com seus amigos.
Eles ganham desconto no primeiro mês ✅

Digite *menu* para voltar.`);
  }

  else if (message === "2") {
    await atualizarUsuario(from, { etapa: "menu" });
    await enviarMensagem(from, mensagemMenu);
  }

  break;
case "suporte":
  // Bot fica totalmente silencioso
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
if (!req.body.data || !req.body.data.id) return res.sendStatus(200);

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

      // ✅ Buscar comprador
      const { data: comprador } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      // ✅ Calcular duração do plano
      let meses = 1;

      switch (comprador.plano_temp) {
        case "1 mês": meses = 1; break;
        case "2 meses": meses = 2; break;
        case "3 meses": meses = 3; break;
        case "4 meses": meses = 4; break;
        case "6 meses": meses = 6; break;
        case "12 meses": meses = 12; break;
        default: meses = 1;
      }

      const fimPlano = new Date();
      fimPlano.setMonth(fimPlano.getMonth() + meses);

      await atualizarUsuario(phone, {
        plano_fim: fimPlano,
        etapa: "menu"
      });

      // ✅ SISTEMA DE INDICAÇÃO
   if (comprador.indicador_id) {

  const { data: jaExiste } = await supabase
    .from("indicacoes")
    .select("*")
    .eq("indicado_id", comprador.id)
    .maybeSingle();

  if (!jaExiste) {

    await supabase
      .from("indicacoes")
      .insert([
        {
          indicador_id: comprador.indicador_id,
          indicado_id: comprador.id,
          status: "ativo"
        }
      ]);
        const { data: indicador } = await supabase
          .from("users")
          .select("*")
          .eq("id", comprador.indicador_id)
          .single();

        const novasAtivas = (indicador.indicacoes_ativas || 0) + 1;

        await supabase
          .from("users")
          .update({ indicacoes_ativas: novasAtivas })
          .eq("id", indicador.id);

        if (novasAtivas <= 10 && novasAtivas % 2 === 0) {

          await enviarMensagem(SEU_NUMERO, `🎁 META ATINGIDA

Indicador: ${indicador.phone}
Total ativos: ${novasAtivas}

Liberar 1 mês bônus manual.`);
        }

              if (novasAtivas > 10) {

          await enviarMensagem(SEU_NUMERO, `💰 Nova indicação ativa

Indicador: ${indicador.phone}
Total ativos: ${novasAtivas}

Adicionar R$10 comissão.`);
        }
      }  // ✅ fecha if (!jaExiste)
    }    // ✅ ADICIONE ESTA LINHA - fecha if (comprador.indicador_id)

      await enviarMensagem(phone, `✅ Pagamento confirmado!

Seu plano está sendo ativado agora 🚀

Em instantes avisaremos quando seu plano estiver ativo.`);

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
// ✅ VERIFICADOR DE VENCIMENTO (3 DIAS ANTES)

setInterval(async () => {

  const agora = new Date();
  const tresDiasAntes = new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000);

  const { data: usuarios } = await supabase
    .from("users")
    .select("*")
    .not("plano_fim", "is", null);

  if (!usuarios) return;

    for (let user of usuarios) {
    if (!user.plano_fim) continue; // Use 'user' em vez de 'usuarioAtual'
    const fimPlano = new Date(user.plano_fim);
    const diferenca = fimPlano - tresDiasAntes;

    if (diferenca > 0 && diferenca < 24 * 60 * 60 * 1000) {

      await enviarMensagem(user.phone, `📅 Seu plano ATLAS vence em 3 dias.

Evite interrupções e renove antecipadamente ✅

Digite *menu* para renovar.`);
    }
  }

}, 12 * 60 * 60 * 1000); // verifica a cada 12h
app.listen(PORT, () => {
  console.log("ATLAS Bot rodando ✅");
});
