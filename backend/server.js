import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import File from './model/fileSchema.model.js';
import Submission from './model/submissionSchema.model.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Middleware
// Allow requests from the frontend during development. Use FRONTEND_URL env var if provided.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
// Enable preflight for all routes
app.options('*', cors({ origin: FRONTEND_URL }));
app.use(express.json());

connectDB()

// POST: store file metadata
app.post('/api/files', async (req, res) => {
  try {
    const {
      userId,
      email,
      username,
      title,
      description,
      filename,
      fileSize,
      type,
      reward,
      deadline,
    } = req.body || {};

    // Minimal validation; schema enforces required fields as well
    const created = await File.create({
      userId,
      email,
      username,
      title,
      description,
      filename,
      fileSize,
      type,
      reward,
      deadline,
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Failed to store file data' });
  }
});

// POST: store submission data
app.post('/api/submissions', async (req, res) => {
  try {
    const {
      workerId,
      workerUsername,
      datasetId,
      clientId,
      status,
      submissionLink,
      notes,
      rewardClaimed,
      approvedAt,
    } = req.body || {};

    const created = await Submission.create({
      workerId,
      workerUsername,
      datasetId,
      clientId,
      status,
      submissionLink,
      notes,
      rewardClaimed,
      approvedAt,
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Failed to store submission data' });
  }
});

// PATCH: update only the status by submission _id
app.patch('/api/submissions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'status is required' });

    const updated = await Submission.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Submission not found' });
    return res.json(updated);
  } catch (err) {
    const msg = /Cast to .* failed/i.test(err?.message || '') ? 'Invalid submission id' : (err?.message || 'Failed to update status');
    return res.status(400).json({ error: msg });
  }
});

// PATCH: submit work -> set submissionLink, notes, and status='submitted'
app.patch('/api/submissions/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionLink, notes } = req.body || {};
    if (!submissionLink) return res.status(400).json({ error: 'submissionLink is required' });

    const payload = { submissionLink, status: 'submitted' };
    if (typeof notes === 'string') payload.notes = notes;

    const updated = await Submission.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Submission not found' });
    return res.json(updated);
  } catch (err) {
    const msg = /Cast to .* failed/i.test(err?.message || '') ? 'Invalid submission id' : (err?.message || 'Failed to submit work');
    return res.status(400).json({ error: msg });
  }
});

// PATCH: set rewardClaimed=true by submission _id
app.patch('/api/submissions/:id/reward-claimed', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Submission.findByIdAndUpdate(
      id,
      { $set: { rewardClaimed: true } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Submission not found' });
    return res.json(updated);
  } catch (err) {
    const msg = /Cast to .* failed/i.test(err?.message || '') ? 'Invalid submission id' : (err?.message || 'Failed to update rewardClaimed');
    return res.status(400).json({ error: msg });
  }
});

// GET: submissions by workerId
app.get('/api/submissions/worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!workerId) {
      return res.status(400).json({ error: 'workerId is required' });
    }
    const docs = await Submission.find({ workerId }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to fetch submissions for worker' });
  }
});

// GET: submissions by clientId
app.get('/api/submissions/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }
    const docs = await Submission.find({ clientId }).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to fetch submissions for client' });
  }
});

// GET: return N most recent file documents (N from URL)
app.get('/api/files/:limit', async (req, res) => {
  try {
    const n = parseInt(req.params.limit, 10);
    const limit = Number.isNaN(n) ? 10 : n;
    const docs = await File.find().sort({ createdAt: -1 }).limit(limit);
    return res.json(docs);
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Failed to fetch file data' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Base route
app.get('/', (req, res) => {
  res.send('Byte Rush backend is running');
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
