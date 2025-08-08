import express from 'express';
import cors from 'cors';
import { Sandbox } from '@e2b/code-interpreter';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.post('/create-sandbox', async (req, res) => {
  try {
    // TODO: Replace with your actual E2B API key or use environment variables
    const apiKey = process.env.E2B_API_KEY || 'YOUR_E2B_API_KEY';

    if (apiKey === 'YOUR_E2B_API_KEY') {
      console.warn('Using placeholder E2B API key. Please set the E2B_API_KEY environment variable.');
    }

    const sandbox = await Sandbox.create({ apiKey });
    const info = await sandbox.getInfo();
    const sandboxId = info.sandboxId;

    console.log(`Sandbox created with ID: ${sandboxId}`);

    // We are not closing the sandbox here because the client will need to connect to it.
    // In a real application, you would need a mechanism to manage the lifecycle of the sandbox.
    // For example, you could close it after a certain period of inactivity.

    res.status(200).json({ sandboxId });
  } catch (error) {
    console.error('Failed to create sandbox:', error);
    res.status(500).json({ error: 'Failed to create sandbox' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
