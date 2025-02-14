require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = 1234
const PAGE_ACCESS_TOKEN = ‏"EAAJAmcUtD8MBO7l7xbmD1gPqkq2gdTTVLRCAQFyLZCBEloBiBZAo7Hmnrszv5dSj0tzFNw5TiwvCO6gmuwpMLdToyZCCk3EZCZARGZAJhI5FBCytwL4S2PoNljDZCXXfDZCsDZBsRRgCNeZBfkVQm5HLmgPXHXXZBthIgJZB7WOQenq7nPFRQ5Lv2uAOWHQnjCdviUgl77aY0UwSnLrLfDrauQZDZD";
const OPENAI_API_KEY = "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";
// تحقق من Webhook عند الربط
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// استلام الرسائل والرد عليها
app.post("/webhook", async (req, res) => {
    let body = req.body;

    if (body.object === "instagram") {
        for (let entry of body.entry) {
            for (let messageEvent of entry.messaging) {
                if (messageEvent.message && messageEvent.message.text) {
                    let senderId = messageEvent.sender.id;
                    let userMessage = messageEvent.message.text;

                    let aiResponse = await getOpenAIResponse(userMessage);
                    sendInstagramMessage(senderId, aiResponse);
                }
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// استدعاء OpenAI API للحصول على الرد
async function getOpenAIResponse(userMessage) {
    try {
        let response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }]
        }, {
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error in OpenAI API:", error);
        return "عذرًا، حدث خطأ أثناء معالجة الرسالة.";
    }
}

// إرسال الرد إلى إنستغرام
async function sendInstagramMessage(recipientId, message) {
    try {
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: recipientId },
            message: { text: message }
        });
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
    }
}

app.listen(3000, () => console.log("Agent is running on port 3000"));
