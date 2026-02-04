import Contact from '../models/Contact.js';

export async function listContacts(req, res) {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function createContact(req, res) {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getContact(req, res) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'No encontrado' });
    res.json(contact);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateContact(req, res) {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ error: 'No encontrado' });
    res.json(contact);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function deleteContact(req, res) {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
