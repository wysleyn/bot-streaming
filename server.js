app.post("/mercadopago", async (req, res) => {
  try {

    const paymentId = req.body.id;

    if (!paymentId) {
      console.log("⚠️ ID de pagamento não encontrado");
      return res.sendStatus(200);
    }

    console.log("🔎 Consultando pagamento:", paymentId);

    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    console.log("✅ Status pagamento:", payment.data.status);

    if (payment.data.status === "approved") {

      const phone = payment.data.payer?.phone?.number;
      const areaCode = payment.data.payer?.phone?.area_code;

      if (!phone || !areaCode) {
        console.log("⚠️ Telefone não encontrado no pagamento.");
        return res.sendStatus(200);
      }

      const fullPhone = `55${areaCode}${phone}`;

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: fullPhone,
            body: `✅ Pagamento confirmado!

Seu acesso à *MasterPlay* está liberado 🎬🔥

📥 Baixe o aplicativo aqui:
${APK_LINK}

Após instalar, abra o app e aproveite ✅

Se precisar de ajuda, é só responder aqui.`
          }
        }
      );

      console.log("✅ APK enviado automaticamente");
    }

  } catch (error) {
    console.error("❌ Erro Mercado Pago:", error.response?.data || error.message);
  }

  res.sendStatus(200);
});