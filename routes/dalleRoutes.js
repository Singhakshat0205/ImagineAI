import express, { response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const router= express.Router();



router.route('/').post(async (req, res)=>{

  const prompt= req.body.prompt; 
 
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
        prompt:prompt,
        aspect_ratio: '1:1'
      })
      
    }
  );

  const data= await resp.json();
   
   res.status(200).json(data);

})


export default router;