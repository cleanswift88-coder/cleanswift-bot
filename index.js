const https = require('https');
const http = require('http');

// ============================================================
// CLEANSWIFT BOT — Messenger + Instagram + WhatsApp
// Gratuit — Hébergé sur Vercel
// ============================================================

// Prix CleanSwift
const PRICES = {
  standard: { '1bd1ba': 135, '2bd1ba': 160, '2bd2ba': 190, '3bd2ba': 225, '3bd3ba': 250, '4bd2ba': 270, '4bd3ba': 295 },
  deep:      { '1bd1ba': 189, '2bd1ba': 224, '2bd2ba': 266, '3bd2ba': 315, '3bd3ba': 350, '4bd2ba': 378, '4bd3ba': 413 },
  moveinout: { '1bd1ba': 202, '2bd1ba': 240, '2bd2ba': 285, '3bd2ba': 338, '3bd3ba': 375, '4bd2ba': 405, '4bd3ba': 443 },
  carpet:    { min: 129, perRoom: 85 },
  airbnb:    { studio: 95, '2bd1ba': 135, '2bd2ba': 155, '3bd2ba': 185, '3bd3ba': 215, '4bd': 249 },
};

// Sessions utilisateurs en mémoire
const sessions = {};

// ============================================================
// FLOW DU BOT
// ============================================================
function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = { step: 'welcome', data: {} };
  }
  return sessions[userId];
}

function resetSession(userId) {
  sessions[userId] = { step: 'welcome', data: {} };
}

function processMessage(userId, text) {
  const session = getSession(userId);
  const msg = text.toLowerCase().trim();
  let response = '';
  let quickReplies = [];

  switch (session.step) {

    case 'welcome':
      response = `Hi! 👋 Welcome to CleanSwift Edmonton!\n\nWe offer professional cleaning services with flat-rate pricing — no surprises.\n\n🏠 What service do you need?`;
      quickReplies = [
        { title: '🏠 House Cleaning', payload: 'RESIDENTIAL' },
        { title: '🛋️ Carpet Cleaning', payload: 'CARPET' },
        { title: '📦 Move In/Out', payload: 'MOVEINOUT' },
        { title: '🏡 Airbnb/STR', payload: 'AIRBNB' },
        { title: '🏢 Commercial', payload: 'COMMERCIAL' },
        { title: '🏗️ Garage Org.', payload: 'GARAGE' },
      ];
      session.step = 'choose_service';
      break;

    case 'choose_service':
      if (msg.includes('house') || msg.includes('residential') || msg === 'residential') {
        session.data.service = 'residential';
        response = `Great choice! 🏠\n\nWhat type of cleaning do you need?`;
        quickReplies = [
          { title: '✨ Standard Clean', payload: 'STANDARD' },
          { title: '🧽 Deep Clean', payload: 'DEEP' },
          { title: '📦 Move In/Out', payload: 'MOVEINOUT' },
        ];
        session.step = 'choose_type';
      } else if (msg.includes('carpet') || msg === 'carpet') {
        session.data.service = 'carpet';
        response = `🛋️ Carpet Cleaning!\n\nHow many rooms need cleaning?`;
        quickReplies = [
          { title: '1 room', payload: 'CARPET_1' },
          { title: '2 rooms', payload: 'CARPET_2' },
          { title: '3 rooms', payload: 'CARPET_3' },
          { title: '4+ rooms', payload: 'CARPET_4' },
        ];
        session.step = 'carpet_rooms';
      } else if (msg.includes('move') || msg === 'moveinout') {
        session.data.service = 'residential';
        session.data.type = 'moveinout';
        response = `📦 Move In/Out cleaning!\n\nHow many bedrooms?`;
        quickReplies = [
          { title: '1 bedroom', payload: 'BD_1' },
          { title: '2 bedrooms', payload: 'BD_2' },
          { title: '3 bedrooms', payload: 'BD_3' },
          { title: '4 bedrooms', payload: 'BD_4' },
        ];
        session.step = 'choose_bedrooms';
      } else if (msg.includes('airbnb') || msg === 'airbnb') {
        session.data.service = 'airbnb';
        response = `🏡 Airbnb/Short-Term Rental Cleaning!\n\nWhat size is the unit?`;
        quickReplies = [
          { title: 'Studio/1bd — $95', payload: 'AIRBNB_STUDIO' },
          { title: '2bd/1ba — $135', payload: 'AIRBNB_2BD1BA' },
          { title: '2bd/2ba — $155', payload: 'AIRBNB_2BD2BA' },
          { title: '3bd/2ba — $185', payload: 'AIRBNB_3BD2BA' },
          { title: '3bd/3ba — $215', payload: 'AIRBNB_3BD3BA' },
          { title: '4bd+ — $249', payload: 'AIRBNB_4BD' },
        ];
        session.step = 'airbnb_size';
      } else if (msg.includes('commercial') || msg === 'commercial') {
        session.data.service = 'commercial';
        response = `🏢 Commercial Cleaning!\n\nOur commercial pricing is custom-quoted based on your space.\n\nPlease WhatsApp us directly for a fast quote:\n👉 wa.me/13688855157\n\nTell us:\n📐 Size of space (sq ft)\n🏢 Type of business\n📍 Location in Edmonton`;
        quickReplies = [{ title: '🔄 Start over', payload: 'RESTART' }];
        session.step = 'welcome';
      } else if (msg.includes('garage') || msg === 'garage') {
        session.data.service = 'garage';
        response = `🏗️ Garage Organization!\n\nOur garage service includes a FREE 30-minute assessment — we visit your garage and give you an exact quote on the spot.\n\nWhatsApp us to book your free assessment:\n👉 wa.me/13688855157\n\nNo commitment required! 😊`;
        quickReplies = [{ title: '🔄 Start over', payload: 'RESTART' }];
        session.step = 'welcome';
      } else {
        response = `I didn't quite get that. Please choose a service:`;
        quickReplies = [
          { title: '🏠 House Cleaning', payload: 'RESIDENTIAL' },
          { title: '🛋️ Carpet Cleaning', payload: 'CARPET' },
          { title: '📦 Move In/Out', payload: 'MOVEINOUT' },
          { title: '🏡 Airbnb/STR', payload: 'AIRBNB' },
          { title: '🏢 Commercial', payload: 'COMMERCIAL' },
        ];
      }
      break;

    case 'choose_type':
      if (msg.includes('standard') || msg === 'standard') {
        session.data.type = 'standard';
      } else if (msg.includes('deep') || msg === 'deep') {
        session.data.type = 'deep';
      } else if (msg.includes('move') || msg === 'moveinout') {
        session.data.type = 'moveinout';
      } else {
        session.data.type = 'standard';
      }
      response = `Got it! 🏠\n\nHow many bedrooms?`;
      quickReplies = [
        { title: '1 bedroom', payload: 'BD_1' },
        { title: '2 bedrooms', payload: 'BD_2' },
        { title: '3 bedrooms', payload: 'BD_3' },
        { title: '4 bedrooms', payload: 'BD_4' },
      ];
      session.step = 'choose_bedrooms';
      break;

    case 'choose_bedrooms':
      const bdMatch = msg.match(/(\d+)/);
      session.data.bedrooms = bdMatch ? parseInt(bdMatch[1]) : 2;
      response = `And how many bathrooms?`;
      quickReplies = [
        { title: '1 bathroom', payload: 'BA_1' },
        { title: '2 bathrooms', payload: 'BA_2' },
        { title: '3 bathrooms', payload: 'BA_3' },
      ];
      session.step = 'choose_bathrooms';
      break;

    case 'choose_bathrooms':
      const baMatch = msg.match(/(\d+)/);
      session.data.bathrooms = baMatch ? parseInt(baMatch[1]) : 1;
      // Calculate price
      const bd = session.data.bedrooms;
      const ba = session.data.bathrooms;
      const type = session.data.type || 'standard';
      let key = `${Math.min(bd,4)}bd${Math.min(ba,3)}ba`;
      if (bd >= 4 && ba >= 3) key = '4bd3ba';
      else if (bd >= 4) key = '4bd2ba';
      else if (bd >= 3 && ba >= 3) key = '3bd3ba';
      else if (bd >= 3) key = '3bd2ba';
      else if (bd >= 2 && ba >= 2) key = '2bd2ba';
      else if (bd >= 2) key = '2bd1ba';
      else key = '1bd1ba';
      const price = PRICES[type]?.[key] || 135;
      const typeLabel = { standard: 'Standard Clean ✨', deep: 'Deep Clean 🧽', moveinout: 'Move In/Out 📦' };
      session.data.price = price;
      response = `Perfect! Here's your quote:\n\n━━━━━━━━━━━━━━━━\n🏠 ${typeLabel[type]}\n🛏️ ${bd} bed / ${ba} bath\n💰 $${price}\n━━━━━━━━━━━━━━━━\n\nAll services include:\n✅ Flat-rate pricing\n✅ Professional products\n✅ Before & after photos\n✅ On-time guarantee\n✅ Satisfaction guaranteed\n\nReady to book? 📅`;
      quickReplies = [
        { title: '✅ Book now!', payload: 'BOOK' },
        { title: '➕ Add extras', payload: 'ADDONS' },
        { title: '🔄 Start over', payload: 'RESTART' },
      ];
      session.step = 'show_price';
      break;

    case 'carpet_rooms':
      const roomMatch = msg.match(/(\d+)/);
      const rooms = roomMatch ? parseInt(roomMatch[1]) : 1;
      session.data.rooms = rooms;
      const carpetPrice = Math.max(PRICES.carpet.min, rooms * PRICES.carpet.perRoom);
      session.data.price = carpetPrice;
      response = `🛋️ Carpet Cleaning Quote:\n\n━━━━━━━━━━━━━━━━\n🛋️ ${rooms} room${rooms > 1 ? 's' : ''} × $85\n💰 $${carpetPrice}${carpetPrice === 129 ? ' (minimum charge)' : ''}\n━━━━━━━━━━━━━━━━\n\nIncludes:\n✅ Hot water extraction (210°F)\n✅ Dry in 30-45 minutes\n✅ Professional products\n✅ Before & after photos\n\nReady to book? 📅`;
      quickReplies = [
        { title: '✅ Book now!', payload: 'BOOK' },
        { title: '🐾 Add pet treatment', payload: 'PET_TREATMENT' },
        { title: '🔄 Start over', payload: 'RESTART' },
      ];
      session.step = 'show_price';
      break;

    case 'airbnb_size':
      let airbnbPrice = 95;
      let airbnbLabel = 'Studio/1 bedroom';
      if (msg.includes('studio') || msg.includes('1bd')) { airbnbPrice = 95; airbnbLabel = 'Studio/1bd'; }
      else if (msg.includes('2bd') && msg.includes('1ba')) { airbnbPrice = 135; airbnbLabel = '2bd/1ba'; }
      else if (msg.includes('2bd') && msg.includes('2ba')) { airbnbPrice = 155; airbnbLabel = '2bd/2ba'; }
      else if (msg.includes('3bd') && msg.includes('2ba')) { airbnbPrice = 185; airbnbLabel = '3bd/2ba'; }
      else if (msg.includes('3bd') && msg.includes('3ba')) { airbnbPrice = 215; airbnbLabel = '3bd/3ba'; }
      else if (msg.includes('4bd') || msg.includes('4+')) { airbnbPrice = 249; airbnbLabel = '4bd+'; }
      session.data.price = airbnbPrice;
      response = `🏡 Airbnb Turnover Quote:\n\n━━━━━━━━━━━━━━━━\n🏡 ${airbnbLabel}\n💰 $${airbnbPrice} per turnover\n━━━━━━━━━━━━━━━━\n\nIncludes:\n✅ Full reset between guests\n✅ All rooms + bathrooms\n✅ Condition report photos sent to host\n✅ On-time guarantee\n\nReady to book? 📅`;
      quickReplies = [
        { title: '✅ Book now!', payload: 'BOOK' },
        { title: '🛏️ Add linen change', payload: 'LINEN' },
        { title: '🔄 Start over', payload: 'RESTART' },
      ];
      session.step = 'show_price';
      break;

    case 'show_price':
      if (msg.includes('book') || msg === 'book') {
        response = `Excellent! 🎉\n\nTo confirm your booking, please WhatsApp us directly:\n👉 wa.me/13688855157\n\nJust send:\n📍 Your address in Edmonton\n📅 Preferred date & time\n\nWe'll confirm within 5 minutes! ⚡\n\nThank you for choosing CleanSwift! 💚`;
        quickReplies = [{ title: '🔄 New quote', payload: 'RESTART' }];
        session.step = 'booked';
      } else if (msg.includes('addon') || msg.includes('extra')) {
        response = `Great! Here are our add-ons:\n\n🔥 Inside Oven → +$35\n❄️ Inside Fridge → +$30\n🪟 Windows (per window) → +$5\n🗄️ Inside Cabinets → +$40\n🏠 Basement → +$40\n🧺 Laundry (per load) → +$35\n🛋️ Carpet Cleaning (per room) → +$85\n\nWhatsApp us to add these to your quote:\n👉 wa.me/13688855157`;
        quickReplies = [
          { title: '✅ Book now!', payload: 'BOOK' },
          { title: '🔄 Start over', payload: 'RESTART' },
        ];
      } else if (msg.includes('pet') || msg.includes('linen')) {
        const addon = msg.includes('pet') ? '+$30 per room' : '+$20 per bed';
        const addonLabel = msg.includes('pet') ? '🐾 Pet odour treatment' : '🛏️ Linen change';
        response = `${addonLabel}: ${addon}\n\nUpdated total: $${session.data.price + (msg.includes('pet') ? 30 : 20)}\n\nReady to book?`;
        quickReplies = [
          { title: '✅ Book now!', payload: 'BOOK' },
          { title: '🔄 Start over', payload: 'RESTART' },
        ];
      } else if (msg.includes('restart') || msg.includes('start over') || msg.includes('new')) {
        resetSession(userId);
        return processMessage(userId, 'hello');
      } else {
        response = `Would you like to book this service?`;
        quickReplies = [
          { title: '✅ Book now!', payload: 'BOOK' },
          { title: '🔄 Start over', payload: 'RESTART' },
        ];
      }
      break;

    default:
      if (msg.includes('restart') || msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('start')) {
        resetSession(userId);
        return processMessage(userId, 'hello');
      }
      response = `Hi! 👋 Type "hi" to start getting your CleanSwift quote!`;
      quickReplies = [{ title: '👋 Get a quote', payload: 'RESTART' }];
      resetSession(userId);
      break;
  }

  // Handle restart from anywhere
  if (msg === 'restart' || msg.includes('start over')) {
    resetSession(userId);
    return processMessage(userId, 'hello');
  }

  return { response, quickReplies };
}

// ============================================================
// WEBHOOK SERVER
// ============================================================
const VERIFY_TOKEN = 'cleanswift_bot_2026';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || '';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';

function sendMessengerMessage(recipientId, text, quickReplies = []) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      text: text,
      ...(quickReplies.length > 0 && {
        quick_replies: quickReplies.slice(0, 13).map(qr => ({
          content_type: 'text',
          title: qr.title.substring(0, 20),
          payload: qr.payload
        }))
      })
    }
  };

  const postData = JSON.stringify(messageData);
  const options = {
    hostname: 'graph.facebook.com',
    path: `/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Messenger response:', data));
  });
  req.on('error', e => console.error('Messenger error:', e));
  req.write(postData);
  req.end();
}

function sendWhatsAppMessage(to, text) {
  const messageData = JSON.stringify({
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: text }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/v18.0/${PHONE_NUMBER_ID}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(messageData)
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('WhatsApp response:', data));
  });
  req.on('error', e => console.error('WhatsApp error:', e));
  req.write(messageData);
  req.end();
}

// ============================================================
// HTTP SERVER
// ============================================================
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'CleanSwift Bot is running! 🚀', version: '1.0' }));
    return;
  }

  // Webhook verification
  if (req.method === 'GET' && url.pathname === '/webhook') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified!');
      res.writeHead(200);
      res.end(challenge);
    } else {
      res.writeHead(403);
      res.end('Forbidden');
    }
    return;
  }

  // Webhook events
  if (req.method === 'POST' && url.pathname === '/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (data.object === 'page') {
          // Messenger + Instagram
          data.entry?.forEach(entry => {
            entry.messaging?.forEach(event => {
              const senderId = event.sender?.id;
              if (!senderId) return;
              
              let userText = '';
              if (event.message?.text) {
                userText = event.message.text;
              } else if (event.postback?.payload) {
                userText = event.postback.payload.toLowerCase();
              }
              
              if (userText) {
                const { response, quickReplies } = processMessage(senderId, userText);
                sendMessengerMessage(senderId, response, quickReplies);
              }
            });
          });
        } else if (data.object === 'whatsapp_business_account') {
          // WhatsApp
          data.entry?.forEach(entry => {
            entry.changes?.forEach(change => {
              change.value?.messages?.forEach(message => {
                const from = message.from;
                const text = message.text?.body || message.interactive?.button_reply?.title || '';
                if (text) {
                  const { response } = processMessage(from, text);
                  sendWhatsAppMessage(from, response);
                }
              });
            });
          });
        }

        res.writeHead(200);
        res.end('EVENT_RECEIVED');
      } catch (e) {
        console.error('Parse error:', e);
        res.writeHead(200);
        res.end('EVENT_RECEIVED');
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CleanSwift Bot running on port ${PORT}`));

module.exports = server;
