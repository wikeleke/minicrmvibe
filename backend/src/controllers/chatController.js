import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `Eres un experto en ayudar al cliente a navegar en el CRM, asesorarlo sobre cómo adquirir clientes, etc. Eres un asistente amigable del CRM MiniCRM. Ayudas a los usuarios a navegar y usar la aplicación.
La aplicación MiniCRM tiene estas secciones:
- Contactos: listar, crear, editar y eliminar contactos. Estados: lead, contacto, cliente.
- Usuarios: gestionar usuarios del sistema con roles (admin, manager, agent, viewer).
- Dashboard: ver estadísticas (total, leads, contactos, clientes).
Responde en español de forma breve y útil. Si el usuario pregunta cómo hacer algo, explica los pasos.`;

export async function chat(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Chat no configurado. Añade OPENAI_API_KEY en .env',
      });
    }

    const { message, sessionId } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Falta el mensaje' });
    }

    const sid = sessionId || `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let conv = await Conversation.findOne({ sessionId: sid });

    if (!conv) {
      conv = await Conversation.create({ sessionId: sid, messages: [] });
    }

    conv.messages.push({ role: 'user', content: message.trim() });
    const messagesForApi = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conv.messages.map(({ role, content }) => ({ role, content })),
    ];

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesForApi,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'No pude generar una respuesta.';
    conv.messages.push({ role: 'assistant', content: reply });
    await conv.save();

    return res.json({
      reply,
      sessionId: sid,
      messages: conv.messages,
    });
  } catch (err) {
    console.error('Chat error:', err);
    if (err?.status === 401) {
      return res.status(401).json({ error: 'API key de OpenAI inválida' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ error: 'Límite de uso alcanzado. Intenta más tarde.' });
    }
    return res.status(500).json({ error: err?.message || 'Error en el chat' });
  }
}

export async function getConversation(req, res) {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: 'Falta sessionId' });

    const conv = await Conversation.findOne({ sessionId });
    return res.json({
      sessionId,
      messages: conv?.messages ?? [],
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Error al obtener conversación' });
  }
}
