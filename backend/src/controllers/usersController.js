import User from '../models/User.js';
import { rolePrivileges } from '../middleware/rbac.js';

function normalizePrivileges(input, role) {
  if (Array.isArray(input) && input.length > 0) return input;
  return rolePrivileges[role] ?? [];
}

export async function listUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function createUser(req, res) {
  try {
    const data = { ...req.body };
    data.privileges = normalizePrivileges(data.privileges, data.role);
    const user = await User.create(data);
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'No encontrado' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateUser(req, res) {
  try {
    const data = { ...req.body };
    if (data.role || data.privileges) {
      data.privileges = normalizePrivileges(data.privileges, data.role ?? (await User.findById(req.params.id))?.role);
    }
    const user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!user) return res.status(404).json({ error: 'No encontrado' });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
