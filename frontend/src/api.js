const BASE = '/api/contacts';
const USERS = '/api/users';
const roleHeaders = () => ({ 'x-user-role': 'admin' });

export async function getContacts() {
  const r = await fetch(BASE);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createContact(data) {
  const r = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateContact(id, data) {
  const r = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteContact(id) {
  const r = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
}

export async function getUsers() {
  const r = await fetch(USERS, { headers: roleHeaders() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createUser(data) {
  const r = await fetch(USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...roleHeaders() },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateUser(id, data) {
  const r = await fetch(`${USERS}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...roleHeaders() },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteUser(id) {
  const r = await fetch(`${USERS}/${id}`, { method: 'DELETE', headers: roleHeaders() });
  if (!r.ok) throw new Error(await r.text());
}
