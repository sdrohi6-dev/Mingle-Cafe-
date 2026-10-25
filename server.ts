import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client utility
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Gemini Taste Discovery API
app.post('/api/discovery/recommend', async (req, res) => {
  try {
    const { preferences, freeText, availableItems } = req.body;

    if (!Array.isArray(availableItems) || availableItems.length === 0) {
      return res.status(400).json({ error: 'availableItems array is required' });
    }

    if (!ai) {
      return res.status(503).json({
        fallback: true,
        message: 'Gemini API not configured, defaulting to rule-based discovery',
      });
    }

    const prompt = `
You are the master culinary sommelier and head chef at CafeFlow, an upscale modern all-day bistro and specialty café.
A customer is asking for personalized dish recommendations based on their mood and taste preferences.

Customer Preferences:
${JSON.stringify(preferences || {}, null, 2)}

Customer Free-text query / craving:
"${freeText || 'Surprise me with the best tasting options!'}"

Available Menu Items (ALL OF THESE ARE IN STOCK - PICK STRICTLY FROM THIS LIST):
${JSON.stringify(
  availableItems.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.categoryName || item.categoryId,
    description: item.description,
    price: item.price,
    dietaryFlags: item.dietaryFlags,
    prepTimeMinutes: item.prepTimeMinutes,
    rating: item.rating,
  })),
  null,
  2
)}

Select the TOP 3 best matching menu items for this customer.
Adhere strictly to any dietary restrictions (if vegetarian/vegan/gluten-free).
For each selected item:
1. Provide the exact item "id".
2. "matchPercent" (integer between 82 and 99).
3. "reason": A charming, appetizing 1-2 sentence culinary explanation of why this dish satisfies their specific craving or mood.
4. "pairing": A recommended drink or side from the menu that elevates this item (e.g. "Iced Oat Cortado", "Truffle Fries", "Cold-Pressed Citrus").

Respond ONLY in valid JSON matching this schema:
[
  {
    "id": "item_id_here",
    "matchPercent": 95,
    "reason": "...",
    "pairing": "..."
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '[]';
    const parsed = JSON.parse(rawText);

    return res.json({
      recommendations: parsed,
      source: 'gemini-2.5-flash',
    });
  } catch (err: any) {
    console.error('Gemini discovery error:', err);
    return res.status(500).json({
      fallback: true,
      error: err.message || 'Error executing AI discovery',
    });
  }
});

// Gemini Menu Auto-Translate API (English to Tamil, Telugu, Hindi, Malayalam)
app.post('/api/translate', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    if (!ai) {
      return res.status(503).json({
        fallback: true,
        message: 'Gemini API not configured',
      });
    }

    const prompt = `
You are a professional culinary translator specialized in Indian restaurant menus.
Translate the following food dish title and description from English into Tamil (ta), Telugu (te), Hindi (hi), and Malayalam (ml).
Keep the translations natural, culturally resonant, and mouth-watering.
For coffee and western bistro terms (like Cortado, Croissant, Risotto, Tiramisu), use standard phonetic transliterations in the respective scripts that diners recognise.

English Dish Title: "${title}"
English Dish Description: "${description || ''}"

Return ONLY valid JSON matching this structure:
{
  "title": {
    "en": "${title.replace(/"/g, '\\"')}",
    "ta": "Tamil title",
    "te": "Telugu title",
    "hi": "Hindi title",
    "ml": "Malayalam title"
  },
  "description": {
    "en": "${(description || '').replace(/"/g, '\\"')}",
    "ta": "Tamil description",
    "te": "Telugu description",
    "hi": "Hindi description",
    "ml": "Malayalam description"
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Gemini translate error:', err);
    return res.status(500).json({
      error: err.message || 'Translation failed',
    });
  }
});

// Gemini Barista Bot AI Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en', menuItems = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message string is required' });
    }

    if (!ai) {
      return res.status(503).json({
        fallback: true,
        reply: "Welcome to CafeFlow! I'm your Barista Bot. Our specialty coffee is brewed from single-origin Chikmagalur beans, and our brunch plates are served fresh until 11 PM. What can I get started for you today?",
        suggestedItemIds: ['item_cappuccino', 'item_avocado_toast'],
        quickReplies: ['Show Coffee Menu', 'Vegan Options', 'Wi-Fi Password'],
      });
    }

    // Prepare compact menu summary for grounding
    const compactMenu = Array.isArray(menuItems) && menuItems.length > 0
      ? menuItems.slice(0, 35).map((m: any) => ({
          id: m.id,
          title: m.title,
          category: m.categoryName || m.categoryId,
          price: m.price,
          diet: m.dietaryFlags || [],
          prepMins: m.prepTimeMinutes || 10,
          desc: m.description,
        }))
      : [];

    const prompt = `
You are "Barista Bot", the resident head barista and hospitable concierge at "CafeFlow", a cozy modern Indian bistro and artisan specialty coffee roastery.
You are warm, knowledgeable, food-passionate, and speak with polite enthusiasm.

BISTRO ESSENTIALS:
- Opening Hours: 8:00 AM to 11:00 PM every day.
- Specialty Coffee: 100% single-origin Chikmagalur Arabica, medium roasted in-house. Oat, almond, and whole milk options.
- Wi-Fi: "CafeFlow_Guest" / Password: "brewgreat2025".
- Reservations: Tables 1-20 can be booked online via the Book tab with zero reservation fee.
- Taxes & Fees: 5% GST (2.5% CGST + 2.5% SGST), 5% dine-in service charge, ₹20 packaging fee for takeaway/delivery.
- Digital Ordering: Diners can order for their table or takeaway with UPI/GPay, Card, or Cash at the counter, or order via WhatsApp.

ACTIVE MENU HIGHLIGHTS:
${JSON.stringify(compactMenu, null, 1)}

USER CONVERSATION CONTEXT:
Language code: "${language}" (If the user speaks or selected 'ta' (Tamil), 'te' (Telugu), 'hi' (Hindi), or 'ml' (Malayalam), reply naturally in that language's script, retaining coffee terminology as appropriate).
Recent conversation history:
${JSON.stringify(conversationHistory.slice(-6))}

User's Latest Message:
"${message}"

INSTRUCTIONS:
1. Provide a warm, conversational, appetizing answer (2-4 sentences). Answer questions about ingredients, calories, allergens, pairings, hours, or Wi-Fi accurately.
2. If the user is looking for food or drinks, select 1 to 3 relevant item IDs from the menu list above to populate "suggestedItemIds".
3. Provide 2-3 short, clickable "quickReplies" for the diner to continue the chat.
4. Output STRICTLY in JSON format with this exact structure:
{
  "reply": "Your friendly reply here...",
  "suggestedItemIds": ["item_id_1", "item_id_2"],
  "quickReplies": ["Follow-up 1", "Follow-up 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    return res.json({
      reply: parsed.reply || "I'd love to help! Would you like a hot coffee or something from our kitchen?",
      suggestedItemIds: parsed.suggestedItemIds || [],
      quickReplies: parsed.quickReplies || ['View Menu', 'Today Specials', 'Table Booking'],
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    return res.json({
      fallback: true,
      reply: "I'm right here at the brew bar! Our Chikmagalur pour-overs, croissants, and brunch dishes are freshly prepared today. Feel free to browse our digital menu or ask about any dish!",
      suggestedItemIds: ['item_cappuccino', 'item_croissant'],
      quickReplies: ['Browse Menu', 'Chef Specials', 'Book a Table'],
    });
  }
});

// Setup dev server Vite middleware or serve static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`CafeFlow full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer();
