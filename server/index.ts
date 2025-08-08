// server/index.ts - النسخة النهائية مع إصلاح مشكلة Codespaces HTML

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sandbox } from '@e2b/code-interpreter';
import type { Request, Response } from 'express';

const app = express();

// --- هذا هو الإصلاح الحاسم لمشكلة Codespaces ---
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(cors({ origin: true }));
// -----------------------------------------

app.use(express.json());

const PORT = 3001;

let activeSandbox: Sandbox | null = null;

app.post('/create-sandbox', async (req: Request, res: Response) => {
  console.log('[Server] Received request to create sandbox...');
  if (activeSandbox) {
    console.log('[Server] Sandbox already exists.');
    return res.status(200).json({ sandboxId: activeSandbox.sandboxId, message: 'Sandbox already active' });
  }
  try {
    activeSandbox = await Sandbox.create('base'); 
    console.log(`[Server] Sandbox created successfully: ${activeSandbox.sandboxId}`);
    res.status(200).json({ sandboxId: activeSandbox.sandboxId, message: 'Sandbox created successfully' });
  } catch (error) {
    console.error('[Server] Error creating sandbox:', error);
    res.status(500).json({ error: 'Failed to create sandbox' });
  }
});

app.post('/execute-command', async (req: Request, res: Response) => {
  const { command } = req.body;
  console.log(`[Server] Received command: ${command}`);
  if (!activeSandbox) {
    return res.status(400).json({ error: 'No active sandbox. Please create one first.' });
  }
  if (!command) {
    return res.status(400).json({ error: 'Command is required.' });
  }
  try {
    const execution = await activeSandbox.runCode(command);
    console.log('[Server] Execution successful. Logs:', execution.logs);
    res.status(200).json({ logs: execution.logs, results: execution.results });
  } catch (error) {
    console.error('[Server] Error executing command:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

app.post('/destroy-sandbox', async (req: Request, res: Response) => {
    if (!activeSandbox) {
        return res.status(400).json({ error: 'No active sandbox to destroy.' });
    }
    try {
        console.log(`[Server] Destroying sandbox: ${activeSandbox.sandboxId}`);
        // @ts-ignore
        await activeSandbox.close(); 
        activeSandbox = null;
        console.log('[Server] Sandbox destroyed.');
        res.status(200).json({ message: 'Sandbox destroyed successfully' });
    } catch (error) {
        console.error('[Server] Error destroying sandbox:', error);
        res.status(500).json({ error: 'Failed to destroy sandbox' });
    }
});

app.listen(PORT, () => {
  console.log(`✅ E2B Sandbox server is running on http://localhost:${PORT}` );
});
