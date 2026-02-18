import {
  getContacts, createContact, updateContact, deleteContact,
  getUsers, createUser, updateUser, deleteUser,
  sendChatMessage as apiSendChat,
} from './api.js';

let contacts = [];
let editingId = null;
let formOpen = false;
let dashboardOpen = false;
let usersOpen = false;
let users = [];
let editingUserId = null;
let usersError = '';
let errorMsg = '';
let chatOpen = false;
let chatMessages = [];
let chatSessionId = null;
let chatLoading = false;
let chatError = '';

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')) e.value = v ?? '';
    else if (k === 'selected') e.selected = !!v;
    else if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v);
  });
  e.append(...children.filter(Boolean).flat().map(c => (typeof c === 'string' ? document.createTextNode(c) : c)));
  return e;
}

function statusBadge(status) {
  const colors = { lead: 'bg-amber-500/20 text-amber-400', contacto: 'bg-blue-500/20 text-blue-400', cliente: 'bg-emerald-500/20 text-emerald-400' };
  return el('span', { class: `px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? 'bg-slate-500/20'}` }, status);
}

function contactRow(c) {
  return el('tr', { class: 'border-b border-slate-700/50 hover:bg-slate-800/50' },
    el('td', { class: 'p-3 font-medium' }, c.name),
    el('td', { class: 'p-3 text-slate-400' }, c.email),
    el('td', { class: 'p-3 text-slate-400' }, c.rfc ?? '—'),
    el('td', { class: 'p-3 text-slate-400' }, c.company ?? '—'),
    el('td', { class: 'p-3' }, statusBadge(c.status)),
    el('td', { class: 'p-3 flex gap-2' },
      el('button', { class: 'text-sm text-sky-400 hover:underline', onclick: () => setEditing(c) }, 'Editar'),
      el('button', { class: 'text-sm text-red-400 hover:underline', onclick: () => remove(c._id) }, 'Eliminar')
    )
  );
}

function setEditing(c) {
  editingId = c?._id ?? null;
  formOpen = true;
  render();
}

async function submitForm(e) {
  e.preventDefault();
  errorMsg = '';
  const data = {
    name: document.getElementById('form-name').value.trim(),
    email: document.getElementById('form-email').value.trim(),
    rfc: document.getElementById('form-rfc').value.trim() || undefined,
    phone: document.getElementById('form-phone').value.trim() || undefined,
    company: document.getElementById('form-company').value.trim() || undefined,
    status: document.getElementById('form-status').value,
    notes: document.getElementById('form-notes').value.trim() || undefined,
  };
  try {
    if (editingId) await updateContact(editingId, data);
    else await createContact(data);
    editingId = null;
    formOpen = false;
    await load();
  } catch (err) {
    errorMsg = err.message;
    render();
  }
}

async function remove(id) {
  if (!confirm('¿Eliminar este contacto?')) return;
  try {
    await deleteContact(id);
    await load();
  } catch (err) {
    errorMsg = err.message;
    render();
  }
}

function setUsersOpen() {
  usersOpen = true;
  render();
  loadUsers();
}

function setChatOpen() {
  chatOpen = true;
  render();
}

async function submitChat(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text || chatLoading) return;

  chatError = '';
  chatLoading = true;
  chatMessages.push({ role: 'user', content: text });
  input.value = '';
  render();

  try {
    const res = await apiSendChat(text, chatSessionId);
    chatSessionId = res.sessionId;
    chatMessages = res.messages || [];
    chatError = '';
  } catch (err) {
    chatError = err.message;
    chatMessages.pop();
  } finally {
    chatLoading = false;
    render();
  }
}

function setUserEditing(u) {
  editingUserId = u?._id ?? null;
  usersOpen = true;
  render();
}

async function submitUserForm(e) {
  e.preventDefault();
  usersError = '';
  const privRaw = document.getElementById('user-privileges').value.trim();
  const data = {
    name: document.getElementById('user-name').value.trim(),
    email: document.getElementById('user-email').value.trim(),
    role: document.getElementById('user-role').value,
    privileges: privRaw ? privRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    active: document.getElementById('user-active').checked,
  };
  try {
    if (editingUserId) await updateUser(editingUserId, data);
    else await createUser(data);
    editingUserId = null;
    await loadUsers();
  } catch (err) {
    usersError = err.message;
    render();
  }
}

async function removeUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  try {
    await deleteUser(id);
    await loadUsers();
  } catch (err) {
    usersError = err.message;
    render();
  }
}

async function loadUsers() {
  try {
    users = await getUsers();
    usersError = '';
  } catch (err) {
    usersError = err.message;
    users = [];
  }
  render();
}

function userBadge(role) {
  const colors = { admin: 'bg-purple-500/20 text-purple-400', manager: 'bg-sky-500/20 text-sky-400', agent: 'bg-amber-500/20 text-amber-400', viewer: 'bg-slate-500/20 text-slate-300' };
  return el('span', { class: `px-2 py-0.5 rounded text-xs font-medium ${colors[role] ?? 'bg-slate-500/20'}` }, role);
}

async function load() {
  try {
    contacts = await getContacts();
    errorMsg = '';
  } catch (err) {
    errorMsg = err.message;
    contacts = [];
  }
  render();
}

function render() {
  const root = document.getElementById('app');
  const total = contacts.length;
  const leads = contacts.filter(c => c.status === 'lead').length;
  const contactos = contacts.filter(c => c.status === 'contacto').length;
  const clientes = contacts.filter(c => c.status === 'cliente').length;
  root.replaceChildren(
    el('div', { class: 'fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2' },
      chatOpen ? el('div', { class: 'w-80 h-96 flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden' },
        el('div', { class: 'flex items-center justify-between p-3 border-b border-slate-800' },
          el('h3', { class: 'text-sm font-semibold flex items-center gap-2' },
            el('span', { class: 'w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' }),
            'Asistente'
          ),
          el('button', {
            class: 'p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800',
            onclick: () => { chatOpen = false; render(); },
          }, '✕')
        ),
        el('div', { class: 'flex-1 overflow-y-auto p-3 space-y-3' },
          chatMessages.length === 0
            ? el('p', { class: 'text-slate-500 text-xs text-center py-6' },
                'Pregunta cómo usar MiniCRM. Ej: "¿Cómo agrego un contacto?"'
              )
            : chatMessages.map((m) =>
                m.role === 'user'
                  ? el('div', { class: 'flex justify-end' },
                      el('div', { class: 'max-w-[90%] rounded-xl rounded-br-sm bg-sky-600/80 text-white px-3 py-2 text-xs' }, m.content)
                    )
                  : el('div', { class: 'flex justify-start' },
                      el('div', { class: 'max-w-[90%] rounded-xl rounded-bl-sm bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 text-xs leading-relaxed' }, m.content)
                    )
              )
        ),
        chatError ? el('div', { class: 'mx-3 mb-1 p-2 rounded bg-red-500/10 text-red-400 text-xs' }, chatError) : null,
        el('form', { onsubmit: submitChat, class: 'p-3 border-t border-slate-800 flex gap-2' },
          el('input', {
            id: 'chat-input',
            type: 'text',
            placeholder: chatLoading ? 'Esperando…' : 'Escribe aquí…',
            disabled: chatLoading,
            class: 'flex-1 rounded-lg bg-slate-800 border border-slate-600 px-2.5 py-2 text-xs focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50',
          }),
          el('button', {
            type: 'submit',
            disabled: chatLoading,
            class: 'px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium',
          }, chatLoading ? '…' : 'Enviar')
        )
      ) : null,
      el('button', {
        class: 'w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-xl',
        onclick: () => { chatOpen = !chatOpen; render(); },
        title: chatOpen ? 'Cerrar asistente' : 'Abrir asistente',
      }, '💬')
    ),
    el('header', { class: 'border-b border-slate-800 bg-slate-900/50 px-6 py-4' },
      el('div', { class: 'flex items-center justify-between' },
        el('div', {},
          el('h1', { class: 'text-xl font-semibold text-slate-100' }, 'MiniCRM'),
          el('p', { class: 'text-sm text-slate-400 mt-1' }, 'Contactos y leads')
        ),
        el('div', { class: 'flex items-center gap-2' },
          el('button', {
            class: 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium border border-slate-700',
            onclick: () => setUsersOpen(),
          }, 'Usuarios'),
          el('button', {
            class: 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium border border-slate-700',
            onclick: () => { dashboardOpen = true; render(); },
          }, 'Dashboard')
        )
      )
    ),
    el('main', { class: 'p-6 max-w-5xl mx-auto' },
      errorMsg ? el('div', { class: 'mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm' }, errorMsg) : null,
      el('div', { class: 'flex justify-between items-center mb-4' },
        el('h2', { class: 'text-lg font-medium' }, 'Contactos'),
        el('button', {
          class: 'px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium',
          onclick: () => setEditing(null),
        }, '+ Nuevo contacto')
      ),
      el('div', { id: 'form', class: formOpen ? 'mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700' : 'mb-6 p-4 hidden' },
        el('h3', { id: 'form-title', class: 'text-md font-medium mb-3' }, editingId ? 'Editar contacto' : 'Nuevo contacto'),
        el('form', { onsubmit: submitForm, class: 'grid gap-3 sm:grid-cols-2' },
          (() => {
            const ec = editingId ? contacts.find(c => c._id === editingId) : null;
            return [
              el('input', { id: 'form-name', type: 'text', placeholder: 'Nombre', required: true, value: ec?.name ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none' }),
              el('input', { id: 'form-email', type: 'email', placeholder: 'Email', required: true, value: ec?.email ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none' }),
              el('input', { id: 'form-rfc', type: 'text', placeholder: 'RFC', required: true, value: ec?.rfc ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm uppercase tracking-wide focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none' }),
              el('input', { id: 'form-phone', type: 'tel', placeholder: 'Teléfono', value: ec?.phone ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none' }),
              el('input', { id: 'form-company', type: 'text', placeholder: 'Empresa', value: ec?.company ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none' }),
              el('select', { id: 'form-status', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none' },
                el('option', { value: 'lead', selected: ec?.status === 'lead' }, 'Lead'),
                el('option', { value: 'contacto', selected: ec?.status === 'contacto' }, 'Contacto'),
                el('option', { value: 'cliente', selected: ec?.status === 'cliente' }, 'Cliente')
              ),
              el('textarea', { id: 'form-notes', placeholder: 'Notas', rows: 2, class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none sm:col-span-2' }, ec?.notes ?? ''),
            ];
          })(),
          el('div', { class: 'flex gap-2 sm:col-span-2' },
            el('button', { type: 'submit', class: 'px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium' }, 'Guardar'),
            el('button', { type: 'button', class: 'px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm', onclick: () => { editingId = null; formOpen = false; render(); } }, 'Cancelar')
          )
        )
      ),
      el('div', { class: 'rounded-xl border border-slate-700 overflow-hidden' },
        contacts.length === 0
          ? el('p', { class: 'p-8 text-center text-slate-500' }, 'No hay contactos. Añade uno con «Nuevo contacto».')
          : el('table', { class: 'w-full' },
              el('thead', { class: 'bg-slate-800/80' },
                el('tr', {},
                  el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Nombre'),
                  el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Email'),
                  el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'RFC'),
                  el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Empresa'),
                  el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Estado'),
                  el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm w-32' }, '')
                )
              ),
              el('tbody', {}, ...contacts.map(contactRow))
            )
      ),
      dashboardOpen ? el('div', { class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm' },
        el('div', { class: 'w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-xl' },
          el('div', { class: 'flex items-center justify-between p-4 border-b border-slate-800' },
            el('h3', { class: 'text-lg font-semibold' }, 'Dashboard'),
            el('button', {
              class: 'px-2 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800',
              onclick: () => { dashboardOpen = false; render(); },
            }, 'Cerrar')
          ),
          el('div', { class: 'p-4 grid gap-4 sm:grid-cols-2' },
            el('div', { class: 'rounded-xl border border-slate-800 bg-slate-950/40 p-4' },
              el('div', { class: 'text-slate-400 text-sm' }, 'Total'),
              el('div', { class: 'text-2xl font-semibold mt-1' }, String(total))
            ),
            el('div', { class: 'rounded-xl border border-slate-800 bg-slate-950/40 p-4' },
              el('div', { class: 'text-slate-400 text-sm' }, 'Leads'),
              el('div', { class: 'text-2xl font-semibold mt-1 text-amber-400' }, String(leads))
            ),
            el('div', { class: 'rounded-xl border border-slate-800 bg-slate-950/40 p-4' },
              el('div', { class: 'text-slate-400 text-sm' }, 'Contactos'),
              el('div', { class: 'text-2xl font-semibold mt-1 text-blue-400' }, String(contactos))
            ),
            el('div', { class: 'rounded-xl border border-slate-800 bg-slate-950/40 p-4' },
              el('div', { class: 'text-slate-400 text-sm' }, 'Clientes'),
              el('div', { class: 'text-2xl font-semibold mt-1 text-emerald-400' }, String(clientes))
            )
          )
        )
      ) : null,
      usersOpen ? (() => {
        const eu = editingUserId ? users.find(u => u._id === editingUserId) : null;
        return el('div', { class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm' },
          el('div', { class: 'w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-xl' },
            el('div', { class: 'flex items-center justify-between p-4 border-b border-slate-800' },
              el('h3', { class: 'text-lg font-semibold' }, 'Usuarios'),
              el('button', {
                class: 'px-2 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800',
                onclick: () => { usersOpen = false; editingUserId = null; render(); },
              }, 'Cerrar')
            ),
            el('div', { class: 'p-4' },
              usersError ? el('div', { class: 'mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm' }, usersError) : null,
              el('div', { class: 'mb-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700' },
                el('h4', { class: 'text-md font-medium mb-3' }, editingUserId ? 'Editar usuario' : 'Nuevo usuario'),
                el('form', { onsubmit: submitUserForm, class: 'grid gap-3 sm:grid-cols-2' },
                  el('input', { id: 'user-name', type: 'text', placeholder: 'Nombre', required: true, value: eu?.name ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none' }),
                  el('input', { id: 'user-email', type: 'email', placeholder: 'Email', required: true, value: eu?.email ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none' }),
                  el('select', { id: 'user-role', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none' },
                    el('option', { value: 'admin', selected: eu?.role === 'admin' }, 'Admin'),
                    el('option', { value: 'manager', selected: eu?.role === 'manager' }, 'Manager'),
                    el('option', { value: 'agent', selected: eu?.role === 'agent' }, 'Agent'),
                    el('option', { value: 'viewer', selected: eu?.role === 'viewer' }, 'Viewer')
                  ),
                  el('input', { id: 'user-privileges', type: 'text', placeholder: 'Privilegios (opcional, coma-separado)', value: eu?.privileges?.join(', ') ?? '', class: 'rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none' }),
                  el('label', { class: 'flex items-center gap-2 text-sm text-slate-300' },
                    el('input', { id: 'user-active', type: 'checkbox', checked: eu?.active ?? true, class: 'accent-sky-500' }),
                    'Activo'
                  ),
                  el('div', { class: 'flex gap-2 sm:col-span-2' },
                    el('button', { type: 'submit', class: 'px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium' }, 'Guardar'),
                    el('button', { type: 'button', class: 'px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm', onclick: () => { editingUserId = null; render(); } }, 'Cancelar')
                  )
                )
              ),
              el('div', { class: 'rounded-xl border border-slate-700 overflow-hidden' },
                users.length === 0
                  ? el('p', { class: 'p-8 text-center text-slate-500' }, 'No hay usuarios. Añade uno con el formulario.')
                  : el('table', { class: 'w-full' },
                      el('thead', { class: 'bg-slate-800/80' },
                        el('tr', {},
                          el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Nombre'),
                          el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Email'),
                          el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Rol'),
                          el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm' }, 'Privilegios'),
                          el('th', { class: 'text-left p-3 text-slate-400 font-medium text-sm w-32' }, '')
                        )
                      ),
                      el('tbody', {},
                        ...users.map(u => el('tr', { class: 'border-b border-slate-700/50 hover:bg-slate-800/50' },
                          el('td', { class: 'p-3 font-medium' }, u.name),
                          el('td', { class: 'p-3 text-slate-400' }, u.email),
                          el('td', { class: 'p-3' }, userBadge(u.role)),
                          el('td', { class: 'p-3 text-slate-400 text-sm' }, (u.privileges?.length ? u.privileges.join(', ') : '—')),
                          el('td', { class: 'p-3 flex gap-2' },
                            el('button', { class: 'text-sm text-sky-400 hover:underline', onclick: () => setUserEditing(u) }, 'Editar'),
                            el('button', { class: 'text-sm text-red-400 hover:underline', onclick: () => removeUser(u._id) }, 'Eliminar')
                          )
                        ))
                      )
                    )
              )
            )
          )
        );
      })() : null
    )
  );
}

export function renderApp() {
  load();
  return document.getElementById('app');
}
