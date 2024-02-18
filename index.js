const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv').config();
const { gql, GraphQLClient } = require('graphql-request');

//controller functions
const voteCheckout = require('./controllers/voteCheckout');
const webhooks = require('./controllers/webhook');


const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Your Yoco API key
const yocoApiKey = process.env.YOCO_API_KEY; 
const yocoWebhookURL = process.env.YOCO_WEBHOOK_URL;
const GRAPH_ENDPOINT = process.env.GRAPH_CMS_ENDPOINT;

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
  
      //console.log('Yoco Webhook created successfully:', response.data);
    } catch (error) {
      //console.error('Error creating Yoco Webhook:', error.response ? error.response.data : error.message);
    }
  }

createYocoWebhook();

// API routes
app.post('/api/checkouts', voteCheckout);
app.post('/webhook', webhooks);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  //console.log(`Server is running on port ${PORT}`);
});
