const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv').config();
const { gql, GraphQLClient } = require('graphql-request');


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
let votes = null;
let contestantId = null;
let run = 0;

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

  votes = req.body.votes;
  contestantId = req.body.contestantId;

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
    run = 0;

  } catch (error) {
    console.error('Error making request to Yoco API:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/webhook', async (req, res) => {
    const webhookEvent = req.body;
    if (webhookEvent.type === 'payment.succeeded' && run === 0) {
      run = run + 1;

      try {
        if (votes !== null && contestantId !== null) {
          const graphqlClient = new GraphQLClient(GRAPH_ENDPOINT);

          const fetchquery = gql`
            query FetchContestantsCurrentVotes($id: ID!) {
              contestant(where: { id: $id }) {
                votes
              }
            }
          `;

          const variables = {
            id: contestantId
          }

          const fetch_await = await graphqlClient.request(fetchquery, variables);
          const fetch_res = await fetch_await;
          console.log(fetch_res);

          if (fetch_res.contestant.votes) {
            try {
              const query = gql`
                mutation UpdateContestantsVotes($id: ID!, $votes: Int!) {
                  updateContestant(data: {votes: $votes}, where: {id: $id}) {
                    votes
                  }
                }
                `;
              const newVotes = Number(fetch_res.contestant.votes) + Number(votes);

              console.log(newVotes)
              const variables_update = {
                id: contestantId,
                votes: newVotes
              }

              const await_fetch = await graphqlClient.request(query, variables_update);
              const response = await await_fetch;


              const mutation = gql`
              mutation UpdateVotes($id: ID!) {
                  publishContestant(where: {id: $id }) {
                    votes
                  }
                }
              `;

              const idvariable = {
                id: contestantId
              }

              const response_votes_updated = await graphqlClient.request(mutation, idvariable)
              const result_votes_updated = await response_votes_updated

              console.log("Votes were updated: ", response_votes_updated)
              
              console.log("Updated: ", response);
            } catch (error) {
              console.log("Error with second function: ", error);
            }
            
          }
          
        } else {
          console.log("votes and id: ", votes, contestantId);
        }
      } catch (error) {
        console.log("Something went wrong: ", error)
      }
      console.log("Complete: Ran!")
    } else {
      orderStatus = 'error';
      res.status(200).json({ orderStatus });
    }
  });



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
