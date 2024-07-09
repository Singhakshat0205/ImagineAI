// import express, { response } from 'express';
// import * as dotenv from 'dotenv';

// dotenv.config();

// const router= express.Router();



// router.route('/').post(async (req, res)=>{

//   const prompt= req.body.prompt; 

//   console.log(prompt);
 
//   const resp = await fetch(
//     `https://api.limewire.com/api/image/generation`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Api-Version': 'v1',
//         Accept: 'application/json',
//         Authorization: `Bearer ${process.env.LMWR_API_KEY}`
//       },
      
//       body: JSON.stringify({
//         prompt:prompt,
//         aspect_ratio: '1:1'
//       })
      
//     }
//   );
   
//   console.log(resp);
//   const data= await resp.json();
//    console.log(data);
//    res.status(200).json(resp);

// })


// export default router;


import express from 'express';
import * as dotenv from 'dotenv';
import { createClient } from 'redis';
import fetch from 'node-fetch'; // Ensure you have installed node-fetch

dotenv.config();

const router = express.Router();

// Create a Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
await redisClient.connect();

router.route('/').post(async (req, res) => {
  const prompt = req.body.prompt;

  try {
    // Check if the prompt result is already cached in Redis
    const cachedResponse = await redisClient.get(prompt);
    
    if (cachedResponse) {
      console.log('Returning cached response');
      return res.status(200).json(JSON.parse(cachedResponse));
    }

    // If not cached, make the API call
    console.log(prompt);

    const resp = await fetch(
      `https://api.limewire.com/api/image/generation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Version': 'v1',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.LMWR_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          aspect_ratio: '1:1'
        })
      }
    );

    const data = await resp.json();
    console.log(data);

    // Cache the response in Redis with an expiry time (e.g., 1 hour)
    await redisClient.set(prompt, JSON.stringify(data), {
      EX: 3600
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
