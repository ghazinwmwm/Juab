const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "1234"; // رمز التحقق الخاص بالويب هوك
const PAGE_ACCESS_TOKEN = "your_page_access_token"; // التوكن الخاص بـ Instagram API
const OPENAI_API_KEY = "your_openai_api_key"; // مفتاح OpenAI API

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
