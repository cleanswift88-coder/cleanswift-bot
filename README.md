# CleanSwift Bot 🤖

Bot de qualification automatique pour CleanSwift Edmonton.
Fonctionne sur Messenger + Instagram + WhatsApp.

## Setup

### 1. Déployer sur Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. Configurer les variables d'environnement sur Vercel
```
PAGE_ACCESS_TOKEN = [depuis Facebook Developer]
WHATSAPP_TOKEN = [depuis Facebook Developer]
PHONE_NUMBER_ID = [depuis Facebook Developer]
```

### 3. Configurer le Webhook dans Facebook Developer
- URL : https://ton-projet.vercel.app/webhook
- Verify Token : cleanswift_bot_2026
- Événements à souscrire : messages, messaging_postbacks

## Flow du bot
1. Client envoie "hi" → Bot demande le service
2. Client choisit → Bot demande les détails (bedrooms, etc.)
3. Bot calcule le prix automatiquement
4. Client clique "Book" → Bot redirige vers WhatsApp
5. Toi tu confirmes le booking sur WhatsApp

## Prix intégrés
- Standard : $135 → $295 selon taille
- Deep : $189 → $413 selon taille  
- Move In/Out : $202 → $443 selon taille
- Carpet : $85/pièce (min $129)
- Airbnb : $95 → $249 selon taille
