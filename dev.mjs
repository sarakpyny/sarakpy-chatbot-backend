import { createServer } from 'node:http';
import handler from './api/chat.js';

// Local-only adapter for the Vercel handler; no deployment or paid call on startup.
createServer(async (req, res) => {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(body)); };
  if (req.url !== '/api/chat') return res.status(404).json({error:'Not found'});
  if (req.method === 'POST') {
    try {
      const chunks=[]; let size=0;
      for await (const chunk of req) {
        size+=chunk.length;
        if(size>32768) return res.status(413).json({error:'Request too large'});
        chunks.push(chunk);
      }
      req.body=JSON.parse(Buffer.concat(chunks).toString());
    } catch { return res.status(400).json({error:'Invalid JSON'}); }
  }
  await handler(req,res);
}).listen(3001,'127.0.0.1',()=>console.log('Local chatbot: http://127.0.0.1:3001/api/chat'));
