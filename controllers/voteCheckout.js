let votes = null;
let contestantId = null;

const voteCheckout = async (req, res) => {
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
      //console.error('Error making request to Yoco API:', error.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  module.exports = voteCheckout