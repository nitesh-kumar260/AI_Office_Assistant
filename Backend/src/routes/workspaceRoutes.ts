import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Workspace from '../models/Workspace';
import User, { UserRole } from '../models/User';

const router = Router();

const VALID_ROLES: UserRole[] = ['admin', 'legal', 'executive', 'auditor'];

// GET /api/workspaces - Get all workspaces
router.get('/', async (req: Request, res: Response) => {
  try {
    const workspaces = await Workspace.find().sort({ createdAt: -1 });
    res.status(200).json(workspaces);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workspaces/:id - Get workspace by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    const ws = await Workspace.findById(id);
    if (!ws) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.status(200).json(ws);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workspaces - Create a new workspace
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, tier, code } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const wsCode = code || `WS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newWs = await Workspace.create({
      name: name.trim(),
      tier: tier || 'Standard',
      code: wsCode,
      memberCount: 0,
    });

    res.status(201).json(newWs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workspaces/:id/members - Get all members of a workspace
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    const ws = await Workspace.findById(id);
    if (!ws) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const members = await User.find({ workspaces: ws._id });
    res.status(200).json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workspaces/:id/members - Add or assign a member to a workspace
router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'User email is required' });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role '${role}'. Role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    const ws = await Workspace.findById(id);
    if (!ws) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: role || 'legal',
        title: title || 'Legal Specialist',
        workspaces: [ws._id],
      });
    } else {
      if (!user.workspaces.includes(ws._id as any)) {
        user.workspaces.push(ws._id as any);
        if (role) {
          user.role = role;
        }
        await user.save();
      }
    }

    // Update workspace member count
    const memberCount = await User.countDocuments({ workspaces: ws._id });
    ws.memberCount = memberCount;
    await ws.save();

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/workspaces/:id/members/:userId - Update member role
router.put('/:id/members/:userId', async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid workspace or user ID' });
    }

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role '${role}'. Role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if demoting sole admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ workspaces: id, role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot demote the last remaining admin in the workspace' });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/workspaces/:id/members/:userId - Remove member from workspace
router.delete('/:id/members/:userId', async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid workspace or user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if removing sole admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ workspaces: id, role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last remaining admin in the workspace' });
      }
    }

    user.workspaces = user.workspaces.filter((w) => w.toString() !== id);
    await user.save();

    // Update workspace member count
    const ws = await Workspace.findById(id);
    if (ws) {
      const memberCount = await User.countDocuments({ workspaces: ws._id });
      ws.memberCount = memberCount;
      await ws.save();
    }

    res.status(200).json({ message: 'Member removed from workspace', userId, workspaceId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
