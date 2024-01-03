const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Your Yoco API key
const yocoApiKey = process.env.YOCO_API_KEY; 
const yocoWebhookURL = process.env.YOCO_WEBHOOK_URL;

//order updating
let orderStatus = 'pending';

async function createYocoWebhook() {
    try {
      const response = await axios.post(
        'https://payments.yoco.com/api/webhooks',
        {
          name: 'yoco-webhook',
          url: yocoWebhookURL
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + yocoApiKey
          }
        }
      );
  
      console.log('Yoco Webhook created successfully:', response.data);
    } catch (error) {
      console.error('Error creating Yoco Webhook:', error.response ? error.response.data : error.message);
    }
  }

  createYocoWebhook();

// Your API route
app.post('/api/checkouts', async (req, res) => {
  const amount = req.body.cost;
  const currency = 'ZAR'

  try {
    const yocoResponse = await axios.post(
      'https://payments.yoco.com/api/checkouts',
      {
        amount,
        currency
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + yocoApiKey
        }
      }
    );
    const yocoData = yocoResponse.data;
    res.json({ success: true, redirectUrl: yocoData.redirectUrl });

  } catch (error) {
    console.error('Error making request to Yoco API:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/webhook', (req, res) => {
    const webhookEvent = req.body;
    if (webhookEvent.type === 'payment.succeeded') {
      orderStatus = 'success';
        
      res.status(200).json({ orderStatus });
    } else {
      orderStatus = 'error';
      res.status(200).json({ orderStatus });
    }
  });



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
