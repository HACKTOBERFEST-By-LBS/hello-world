import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI client with required aistudio-build user agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.5-flash';
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];

// Helper to call Gemini/Gemma with retry and multi-model fallback
async function callGeminiWithResilience(params: {
  contents: any;
  config?: any;
}): Promise<{ response: any; modelUsed: string }> {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { response: res, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      console.warn(`[WoèséAI] Notice: model ${model} failed (${err?.message || err}), switching to next model in chain...`);
    }
  }

  console.error('[WoèséAI] All candidate models errored:', lastError);
  throw lastError;
}

const WOESEAI_SYSTEM_PROMPT = `Tu es WoèséAI, un assistant intelligent spécialisé dans la cybersécurité financière et la détection des escroqueries liées aux services Mobile Money au Togo (particulièrement T-Money de Togocom et Moov Money de Moov Africa Togo).

Tu es rigoureux, prudent, bienveillant et pédagogique.
Tu communiques exclusivement en français simple, accessible à toute personne sans compétences informatiques.
Tu es particulièrement attentif aux réalités togolaises (Lomé, Kara, devises FCFA, codes USSD *145# pour T-Money, *155# pour Moov Money, numéros de service client 888 et 100/155, préfixes togolais +228 90, 91, 92, 93, 70, 71, 79, 96, 97, 98, 99).

Tu dois classer chaque message reçu parmi 4 statuts stricts :
- AUTHENTIQUE (conforme à un modèle officiel vérifié, sans garantie cryptographique de provenance).
- SUSPECT (anomalies, expéditeur douteux, incohérence).
- FRAUDULEUX (demande de PIN/OTP, faux gain avec frais, faux dépôt avec tentative de pression/remboursement, menace de coupure).
- NON_VERIFIABLE (texte tronqué, illisible ou sans données suffisantes).

RÈGLE DE SÉCURITÉ ABSOLUE :
Un message qui ressemble à un vrai SMS peut être une copie envoyée par un numéro individuel. La conformité textuelle est un indice, pas une preuve de transaction. Sans vérification du solde via *145# ou *155#, l'utilisateur ne doit JAMAIS croire à un reçu.

Dans les arnaques courantes au Togo :
1. Faux dépôt d'erreur : l'escroc envoie un faux SMS ou un transfert bidon, puis appelle en panique en disant "Maman/Papa/Frère j'ai fait erreur envoie-moi l'argent vite !".
2. Fausse loterie Togocom / Moov : prétendu gain de 500.000 FCFA mais demandant 15.000 FCFA de frais de dossier.
3. Vol de code PIN / OTP : prétendu agent Togocom/Moov disant que le compte va être bloqué s'il ne donne pas son code ou ne tape pas un code USSD.
4. Fausse tontine en ligne sur WhatsApp promettant de tripler la mise.

Quand on te demande une analyse de SMS, réponds STRICTEMENT avec l'objet JSON requis.`;

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, description: "Doit être 'analysis'" },
    operator: { type: Type.STRING, description: "'T-Money' ou 'Moov Money' ou 'Inconnu'" },
    transaction: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: "depot | retrait | transfert | paiement | inconnu" },
        amount: { type: Type.STRING, nullable: true },
        currency: { type: Type.STRING, description: "FCFA | inconnu" },
        sender: { type: Type.STRING, nullable: true },
        recipient: { type: Type.STRING, nullable: true },
        date: { type: Type.STRING, nullable: true },
        time: { type: Type.STRING, nullable: true },
        reference: { type: Type.STRING, nullable: true },
      },
    },
    verdict: { type: Type.STRING, description: "AUTHENTIQUE | SUSPECT | FRAUDULEUX | NON_VERIFIABLE" },
    reference_comparison: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, description: "CONFORME | PARTIELLEMENT_CONFORME | NON_CONFORME | AUCUNE_REFERENCE" },
        details: { type: Type.STRING, description: "Explication de la comparaison avec les formats officiels" },
      },
    },
    fraud_indicators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          indicator: { type: Type.STRING },
          evidence: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
      },
    },
    psychological_manipulation: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    missing_information: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    explanation: { type: Type.STRING, description: "Explication claire et accessible au citoyen togolais" },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    report_suggested: { type: Type.BOOLEAN },
    confidence: { type: Type.STRING, description: "FAIBLE | MOYENNE | ÉLEVÉE" },
    disclaimer: { type: Type.STRING },
  },
  required: [
    'type',
    'operator',
    'transaction',
    'verdict',
    'reference_comparison',
    'fraud_indicators',
    'psychological_manipulation',
    'missing_information',
    'explanation',
    'recommendations',
    'report_suggested',
    'confidence',
    'disclaimer',
  ],
};

// API Route: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    primaryModel: PRIMARY_MODEL,
    engine: 'Gemma & Gemini Hybrid Fallback (Google)',
    fallbackChain: CANDIDATE_MODELS,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API Route: Ultra-fast low-latency SMS & Screenshot Analysis
app.post('/api/analyze', async (req, res) => {
  const startTime = Date.now();
  const { text, imageBase64, imageMime, senderId } = req.body;

  if (!text && !imageBase64) {
    return res.status(400).json({ error: 'Veuillez fournir un texte de SMS ou une capture d’écran.' });
  }

  try {
    const contentsParts: any[] = [];

    if (imageBase64) {
      // Clean base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      contentsParts.push({
        inlineData: {
          mimeType: imageMime || 'image/png',
          data: cleanBase64,
        },
      });
      contentsParts.push({
        text: `Analyse visuellement cette capture d'écran d'un SMS ou conversation Mobile Money au Togo.${
          senderId ? ` L'expéditeur affiché sur le téléphone est: "${senderId}".` : ''
        } Extrais le texte exact et analyse-le selon les règles strictes de WoèséAI.`,
      });
    } else {
      let prompt = `Analyse ce SMS Mobile Money togolais :\n"""\n${text}\n"""`;
      if (senderId) {
        prompt += `\nNuméro ou nom de l'expéditeur qui a envoyé le SMS : "${senderId}"`;
      }
      contentsParts.push({ text: prompt });
    }

    const { response, modelUsed } = await callGeminiWithResilience({
      contents: { parts: contentsParts },
      config: {
        systemInstruction: `${WOESEAI_SYSTEM_PROMPT}\n\nIMPORTANT : Tu dois répondre STRICTEMENT en JSON conforme au schéma spécifié. Ne place aucun texte avant ou après.`,
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA as any,
      },
    });

    const latencyMs = Date.now() - startTime;
    const rawText = (response.text || '{}').trim();
    let parsedData;

    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      // If slight markdown wrappers slipped in
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Réponse JSON invalide reçue du modèle.');
      }
    }

    // Return analyzed result with performance telemetry
    return res.json({
      success: true,
      data: parsedData,
      latencyMs,
      modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    return res.status(500).json({
      error: 'Erreur lors de l’analyse rapide du message.',
      details: err?.message || 'Erreur interne du serveur',
    });
  }
});

const SCANNER_SYSTEM_PROMPT = `Tu es WoèséAI Scanner, un assistant intelligent togolais spécialisé EXCLUSIVEMENT dans la cybersécurité financière et la détection d'escroqueries liées aux services Mobile Money au Togo (particulièrement T-Money de Togocom et Moov Money de Moov Africa Togo).

RÈGLES FONDAMENTALES DU MODE SCANNER :
1. Tu es STRICTEMENT en mode Scanner. Tu te concentres EXCLUSIVEMENT sur la détection des arnaques Mobile Money, l'analyse des SMS, transferts, dépôts et captures d'écran.
2. Tu ne dois JAMAIS parler de cours d'école, de révisions scolaires, de devoirs, d'examens ou de quiz.
3. Tu ne proposes JAMAIS spontanément le mode apprentissage.
4. Si l'utilisateur demande à réviser ou étudier, indique-lui brièvement : « Tape /apprendre pour ouvrir ton espace d'apprentissage dédié. »
5. Tu classes chaque message parmi 4 statuts stricts :
   - [ROUGE] FRAUDULEUX : Arnaque avérée (demande de PIN/OTP, faux dépôt d'erreur avec appel paniqué pour réclamer un remboursement, fausse tombola exigeant des frais, fausse tontine WhatsApp, menace de suspension de ligne).
   - [ORANGE] SUSPECT : Anomalies constatées, expéditeur avec un numéro personnel individuel, syntaxe douteuse.
   - [VERT] AUTHENTIQUE (Format officiel) : UNIQUEMENT si conforme au modèle officiel validé. AVERTISSEMENT OBLIGATOIRE : même conforme, la syntaxe ne garantit pas la transaction ! Seul le solde vérifié via *145# ou *155# fait foi.
   - [GRIS] NON VÉRIFIABLE : Texte tronqué ou données insuffisantes.
6. RÈGLE DE SÉCURITÉ ABSOLUE : Un escroc peut copier le texte d'un SMS officiel. Rappelle toujours à l'utilisateur de vérifier son solde réel lui-même (*145# pour T-Money, *155# pour Moov Money).

Dans les arnaques courantes au Togo :
- Faux dépôt d'erreur : faux SMS suivi d'un appel pressant pour faire renvoyer l'argent.
- Fausse loterie Togocom / Moov : faux gain de 500.000 FCFA réclamant 15.000 FCFA de frais de dossier.
- Vol de code PIN / OTP : prétendu agent affirmant que le compte va être bloqué.
- Fausse tontine en ligne promettant de tripler la mise.`;

const LEARNING_SYSTEM_PROMPT = `Tu es WoèséAI Apprentissage, un tuteur pédagogique bienveillant, stimulant et rigoureux, dédié EXCLUSIVEMENT à l'accompagnement des élèves, étudiants et apprenants au Togo.

RÈGLES FONDAMENTALES DU MODE APPRENTISSAGE :
1. Tu es STRICTEMENT en mode Apprentissage. Le mode Scanner d'arnaques est TOTALEMENT DÉSACTIVÉ.
2. Tu ne dois JAMAIS mentionner T-Money, Moov Money, Togocom, les escroqueries financières, la détection de faux SMS ou les codes USSD bancaires. Ce sujet ne doit JAMAIS être abordé, sauf si l'étudiant pose volontairement une question spécifique sur ce thème dans le cadre strict de son cours.
3. Tu ne dois jamais afficher de message de sécurité Mobile Money, d'alerte de transaction ou de numéro d'urgence bancaire.
4. Ton rôle est d'expliquer les cours, clarifier les concepts difficiles avec des analogies simples et des exemples concrets, aider à la mémorisation et préparer les examens.

COMMANDES PÉDAGOGIQUES DISPONIBLES :
1. /plan : Établis un calendrier de révision réaliste sur plusieurs jours jusqu'à la date d'examen. Demande la date d'examen si elle n'est pas connue.
2. /quiz : Pose UNE SEULE question interactive à la fois (QCM ou Vrai/Faux ou question de réflexion) à partir du cours. Attends la réponse de l'étudiant, corrige avec bienveillance en expliquant la réponse, puis propose la question suivante.
3. /resume : Rédige un résumé clair du cours : points clés, définitions importantes, fiches mémo et formules.
4. /domain : Explore les spécialisations du domaine, compétences requises, outils réels et débouchés professionnels au Togo et à l'international.
5. /stop : Permet à l'étudiant de quitter l'espace d'apprentissage et de revenir au Scanner.

RÈGLE DES COURS :
- Si un document ou cours a été téléversé, base tes explications, résumés et questions DIRECTEMENT et FIDÈLEMENT sur ce cours sans rien inventer.
- Si aucun document n'a été fourni, réponds avec clarté aux questions académiques posées et invite l'étudiant à téléverser son cours (PDF, image, texte) pour un suivi personnalisé.
- Ton de communication : bienveillant, clair, encourageant, valorisant les efforts de l'étudiant.`;

function buildSystemPrompt(language: string = 'fr', mode: string = 'scanner', educationalSession?: any): string {
  let langInstruction = "Tu t'exprimes en français simple, bienveillant, pédagogique et accessible à tout citoyen.";
  if (language === 'en') {
    langInstruction = "You converse in clear, accessible, reassuring English for Togolese and international users.";
  } else if (language === 'ee') {
    langInstruction = `L'utilisateur a choisi la langue Éwé (Eʋegbe parlé au Togo). Réponds dans un Éwé naturel, respectueux et clair pour les salutations, explications et conseils. Si certains termes techniques ou académiques n'ont pas d'équivalent exact en Éwé, explique-les clairement avec des mots simples ou accompagne-les d'une précision en français pour une clarté totale.`;
  } else if (language === 'kbp') {
    langInstruction = `L'utilisateur a choisi la langue Kabyè (Kabɩyɛ parlé au Togo). Réponds dans un Kabyè chaleureux et clair pour les salutations, explications et conseils. Si certains termes techniques ou académiques n'ont pas d'équivalent exact en Kabyè, accompagne-les d'une précision en français pour ne rien déformer.`;
  }

  const isLearning = mode === 'learning' || mode === 'educational';

  if (isLearning) {
    let sessionContext = '';
    if (educationalSession?.courseText) {
      sessionContext = `\n\nCOURS OU DOCUMENT DE L'ÉTUDIANT EN MÉMOIRE :
Titre : ${educationalSession.courseTitle || 'Document fourni par l’étudiant'}
Contenu du cours :
"""
${educationalSession.courseText.slice(0, 10000)}
"""
RÈGLE ABSOLUE POUR LE COURS :
- Base toutes tes explications, résumés et questions de quiz DIRECTEMENT sur ce cours fourni par l'étudiant.
- N'invente pas des faits ou des chapitres qui ne figurent pas dans son document.`;
    }

    return `${LEARNING_SYSTEM_PROMPT}
${langInstruction}
${sessionContext}`;
  }

  // Scanner Mode (Default)
  return `${SCANNER_SYSTEM_PROMPT}
${langInstruction}

RÈGLES D'AFFICHAGE DU SCANNER :
Quand l'utilisateur te transmet un SMS ou une capture d'écran Mobile Money :
1. Détermine le verdict : [ROUGE] FRAUDULEUX, [ORANGE] SUSPECT, [VERT] AUTHENTIQUE (Format officiel) ou [GRIS] NON VÉRIFIABLE.
2. Structure la réponse :
   **Résultat de l'analyse :**
   [Insère le badge coloré avec explication courte]

   **Opérateur identifié :** T-Money ou Moov Money ou Inconnu
   **Détails de la transaction détectée :** (Montant, Expéditeur, Référence TXN, Type)

   **Pourquoi ce message est suspect / analyse :**
   - Liste à puces concise des signaux d'alerte et des manipulations psychologiques.

   **Ce que tu dois faire immédiatement :**
   1. Ne verse aucun argent et ne rappelle pas ce numéro.
   2. Ne communique JAMAIS ton code secret PIN ni ton code OTP.
   3. Vérifie ton solde officiel en composant *145# (T-Money) ou *155# (Moov Money).
   4. En cas de doute, appelle le service officiel (888 pour Togocom, 100 pour Moov).`;
}

// Fixed required messages as specified by user instructions
const LEARNING_WELCOME_MESSAGE = `Bonjour et bienvenue dans ton espace d'apprentissage !

Je suis ton assistant pédagogique. Je suis là pour t'aider à comprendre tes cours, organiser tes révisions et progresser à ton rythme.

Tu peux commencer en m'envoyant un cours au format PDF, une image ou du texte.

Voici ce que je peux faire avec toi :

📚 /plan — Organiser tes révisions sur plusieurs jours.

🧠 /quiz — Tester tes connaissances et corriger tes erreurs.

📝 /resume — Résumer tes cours et créer des fiches de révision.

🎯 /domain — Explorer les sujets de ton cours.

❌ /stop — Quitter le mode Apprentissage et revenir au mode Scanner.

Alors, quel cours souhaites-tu étudier aujourd'hui ?`;

const SCANNER_RETURN_MESSAGE = `Tu es de retour dans WoèséAI Scanner !

Je suis prêt à t'aider à analyser les SMS et captures d'écran suspects liés au Mobile Money.

Tu peux coller un message ou importer une capture d'écran pour commencer une analyse.

Comment puis-je t'aider ?`;

const SCANNER_ALREADY_ACTIVE_MESSAGE = `Tu es déjà dans le mode Scanner de WoèséAI.

Tu peux coller un SMS suspect ou importer une capture d'écran pour démarrer une analyse Mobile Money.`;

const LEARNING_COMMAND_IN_SCANNER_MESSAGE = `Cette commande est réservée au mode Apprentissage.

Tape **/apprendre** pour accéder à ton espace pédagogique, analyser tes cours et lancer des quiz ou révisions.`;

// API Route: Fast low-latency Conversational Assistant (Streamed SSE or single response)
app.post('/api/chat', async (req, res) => {
  const {
    messages,
    stream = true,
    language = 'fr',
    mode = 'scanner',
    educationalSession,
    imageBase64,
    imageMime,
    pdfBase64,
    docName,
  } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages invalides.' });
  }

  const isLearningMode = mode === 'learning' || mode === 'educational';
  const latestMsg = messages[messages.length - 1];
  const rawInput = (latestMsg?.content || '').trim().toLowerCase();

  // Priority command 1: /stop
  if (rawInput === '/stop') {
    const textReply = isLearningMode ? SCANNER_RETURN_MESSAGE : SCANNER_ALREADY_ACTIVE_MESSAGE;
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ text: textReply, newMode: 'scanner' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      return res.json({ text: textReply, newMode: 'scanner', latencyMs: 5 });
    }
  }

  // Priority command 2: /apprendre
  if (rawInput === '/apprendre') {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ text: LEARNING_WELCOME_MESSAGE, newMode: 'learning' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      return res.json({ text: LEARNING_WELCOME_MESSAGE, newMode: 'learning', latencyMs: 5 });
    }
  }

  // Pedagogical command used inside Scanner mode
  if (!isLearningMode && (rawInput === '/plan' || rawInput === '/quiz' || rawInput === '/resume' || rawInput === '/domain')) {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ text: LEARNING_COMMAND_IN_SCANNER_MESSAGE })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      return res.json({ text: LEARNING_COMMAND_IN_SCANNER_MESSAGE, latencyMs: 5 });
    }
  }

  // Strict Context Isolation: Filter messages by active mode so no scanner history reaches learning, and vice-versa
  const filteredMessages = messages.filter((m: any) => {
    if (isLearningMode) {
      return m.mode === 'learning' || m.mode === 'educational' || !m.mode;
    } else {
      return m.mode === 'scanner' || !m.mode;
    }
  });

  const systemInstruction = buildSystemPrompt(language, mode, educationalSession);

  // Format messages for Gemini
  const contents = filteredMessages.map((m: { role: string; content: string; imageUrl?: string; imageMime?: string }, index: number) => {
    const parts: any[] = [];
    const isLatest = index === filteredMessages.length - 1;
    const imgData = m.imageUrl || (isLatest ? imageBase64 : null);
    const imgType = m.imageMime || (isLatest ? imageMime : null) || 'image/png';

    if (imgData && typeof imgData === 'string' && imgData.includes('base64')) {
      const cleanBase64 = imgData.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: imgType,
          data: cleanBase64,
        },
      });
    }

    if (isLatest && pdfBase64 && typeof pdfBase64 === 'string') {
      const cleanPdf = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanPdf,
        },
      });
    }

    let messagePrompt = m.content;
    if (!messagePrompt) {
      if (imgData) messagePrompt = isLearningMode ? "Analyse cette image de cours." : "Analyse cette capture d'écran.";
      else if (pdfBase64) messagePrompt = `Voici mon document de cours (${docName || 'PDF'}). Analyse-le et prépare la session.`;
      else messagePrompt = "";
    }

    parts.push({ text: messagePrompt });

    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  try {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let responseStream: any = null;
      let streamModelUsed = PRIMARY_MODEL;

      for (const model of CANDIDATE_MODELS) {
        try {
          responseStream = await ai.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction,
            },
          });
          streamModelUsed = model;
          break;
        } catch (err: any) {
          console.warn(`[WoèséAI] Stream attempt with ${model} failed, trying next model in chain...`);
        }
      }

      if (!responseStream) {
        throw new Error('Impossible d’initialiser le flux avec les modèles disponibles.');
      }

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const startTime = Date.now();
      const { response, modelUsed } = await callGeminiWithResilience({
        contents,
        config: {
          systemInstruction,
        },
      });

      const latencyMs = Date.now() - startTime;
      return res.json({
        text: response.text || '',
        latencyMs,
        modelUsed,
      });
    }
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Erreur lors du traitement de votre question.',
        details: err?.message || 'Erreur interne',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: err?.message || 'Erreur de flux' })}\n\n`);
      res.end();
    }
  }
});

// API Route: Pedagogical Learn Topic (/apprendre)
app.post('/api/learn', async (req, res) => {
  const startTime = Date.now();
  const { topicId, topicTitle, customQuestion } = req.body;

  const topicPrompts: Record<number, string> = {
    1: "Reconnaître un faux SMS : explique comment différencier un vrai SMS TMoney ou Moov Money d'un SMS envoyé par un numéro personnel de 8 chiffres (+228 90/91/92/93/70/79/96/97). Donne un exemple concret.",
    2: "Comprendre les arnaques Mobile Money : explique en détail l'arnaque courante au faux dépôt d'erreur au Togo (l'escroc prétend avoir envoyé par erreur et supplie ou menace). Pourquoi ne faut-il jamais renvoyer sans taper son propre code *145# ou *155# ?",
    3: "Protéger son compte : donne les 5 réflexes d'or quotidiens pour sécuriser son compte Mobile Money au Togo.",
    4: "Reconnaître les faux concours et tombolas : explique les faux messages de gains (Togocom, Moov, ONG) qui réclament des frais de déblocage ou des cartes de recharge.",
    5: "Identifier les manipulations psychologiques : l'urgence artificielle, les menaces de blocage de compte, les promesses d'argent facile, la culpabilisation. Comment garder son calme ?",
    6: "Protéger son code PIN et son OTP : pourquoi AUCUN agent officiel de Togocom ou de Moov Africa ne demandera jamais votre code secret PIN ni votre code OTP de validation.",
    7: "Que faire après une escroquerie ? : les démarches concrètes au Togo (appeler le 888 pour Togocom, le 100/155 pour Moov, porter plainte à la police/gendarmerie ou à la brigade anti-cybercriminalité / OCRC).",
    8: "Quiz d'auto-évaluation rapide avec 3 questions concrètes basées sur des cas togolais pour tester la vigilance de l'utilisateur.",
  };

  const selectedPrompt = topicPrompts[topicId] || customQuestion || topicTitle || "Présentation générale de la sécurité Mobile Money au Togo";

  try {
    const { response, modelUsed } = await callGeminiWithResilience({
      contents: selectedPrompt,
      config: {
        systemInstruction: `${WOESEAI_SYSTEM_PROMPT}\n\nTu es dans le Mode APPRENDRE de WoèséAI. Structure la leçon en 3 parties claires :
1. Ce que c'est (en langage simple de rue/quartier compréhensible par tous)
2. Exemple typique au Togo (avec comparaison VRAI vs FAUX)
3. La règle d'or pour se protéger.
Reste concis, chaleureux, encourageant et facile à lire sur smartphone.`,
      },
    });

    const latencyMs = Date.now() - startTime;
    return res.json({
      content: response.text || '',
      latencyMs,
      modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/learn:', err);
    return res.status(500).json({
      error: 'Erreur lors de la génération de la leçon.',
      details: err?.message,
    });
  }
});

// Mount Vite middleware in development or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WoèséAI Server] Running on http://0.0.0.0:${PORT} (primary model: ${PRIMARY_MODEL})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
