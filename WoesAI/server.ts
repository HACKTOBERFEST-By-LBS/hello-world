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

const LOW_LATENCY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-3.8-flash';

// Helper to call Gemini with retry and fallback
async function callGeminiWithResilience(params: {
  contents: any;
  config?: any;
}): Promise<{ response: any; modelUsed: string }> {
  // Attempt 1: gemini-3.1-flash-lite (fastest low-latency model)
  try {
    const res = await ai.models.generateContent({
      model: LOW_LATENCY_MODEL,
      contents: params.contents,
      config: params.config,
    });
    return { response: res, modelUsed: LOW_LATENCY_MODEL };
  } catch (err: any) {
    const errStr = `${err?.message || ''} ${err?.status || ''} ${JSON.stringify(err || '')}`;
    console.warn(`[WoèséAI] Notice: ${LOW_LATENCY_MODEL} encountered an issue, seamlessly switching to ${FALLBACK_MODEL}...`);
    try {
      const fallbackRes = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: params.contents,
        config: params.config,
      });
      return { response: fallbackRes, modelUsed: FALLBACK_MODEL };
    } catch (fallbackErr: any) {
      console.error('[WoèséAI] Fallback model also errored:', fallbackErr);
      throw fallbackErr;
    }
  }
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
    model: LOW_LATENCY_MODEL,
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

function buildSystemPrompt(language: string = 'fr', mode: string = 'scanner', educationalSession?: any): string {
  let langInstruction = "Tu t'exprimes en français simple, bienveillant, pédagogique et accessible à tout citoyen.";
  if (language === 'en') {
    langInstruction = "You converse in clear, accessible, reassuring English for Togolese and international users.";
  } else if (language === 'ee') {
    langInstruction = `L'utilisateur a choisi la langue Éwé (Eʋegbe parlé au Togo). Réponds dans un Éwé naturel, respectueux et clair pour les salutations, avertissements et conseils. Si certains termes techniques ou académiques n'ont pas d'équivalent exact en Éwé, explique-les clairement avec des mots simples ou accompagne-les d'une précision en français pour une clarté totale. Reste fidèle aux règles de sécurité togolaises.`;
  } else if (language === 'kbp') {
    langInstruction = `L'utilisateur a choisi la langue Kabyè (Kabɩyɛ parlé au Togo). Réponds dans un Kabyè chaleureux et clair pour les salutations, avertissements et conseils. Si certains termes techniques ou académiques n'ont pas d'équivalent exact en Kabyè, accompagne-les d'une précision en français pour ne rien déformer. Reste rigoureux sur la sécurité.`;
  }

  if (mode === 'educational') {
    let sessionContext = '';
    if (educationalSession?.courseText) {
      sessionContext = `\n\nCOURS OU DOCUMENT DE L'ÉTUDIANT EN MÉMOIRE :
Titre : ${educationalSession.courseTitle || 'Document fourni par l’étudiant'}
Contenu du cours :
"""
${educationalSession.courseText.slice(0, 10000)}
"""
RÈGLE ABSOLUE POUR LE MODE ÉDUCATIF :
- Base toutes tes explications, résumés et questions de quiz DIRECTEMENT sur ce cours fourni par l'étudiant.
- N'invente pas des informations en prétendant qu'elles figurent dans son document.`;
    }

    return `Tu es WoèséAI, propulsé par Gemma comme moteur IA principal, agissant ici en MODE ÉDUCATIF pour accompagner les étudiants et apprenants au Togo.
${langInstruction}

COMMANDES ÉDUCATIVES QUE TU DOIS GÉRER :
1. Commandes d'aide : '/' ou '/aide' -> Présente clairement la liste des commandes éducatives disponibles avec un court résumé.
2. '/apprendre' -> Invite l'étudiant à fournir ou coller son cours (s'il ne l'a pas déjà fait). S'il y a déjà un cours en mémoire, analyse les thèmes et chapitres clés, confirme la détection et propose une méthode de travail adaptée.
3. '/plan' -> Établis un programme de révision réaliste sur plusieurs jours jusqu'à la date d'examen. Si la date d'examen n'est pas encore mentionnée (date actuelle : ${educationalSession?.examDate || 'non spécifiée'}), demande-la poliment ou propose un modèle sur 7 à 14 jours avec objectifs quotidiens, chapitres, exercices et temps de repos.
4. '/quiz' -> Teste les connaissances de l'étudiant à partir du cours fourni ! Pose UNE seule question à la fois (QCM ou Vrai/Faux ou question ouverte de compréhension). Attends la réponse de l'étudiant, corrige avec bienveillance en expliquant pourquoi, puis propose la question suivante.
5. '/resume' -> Produis un support de révision complet et clair : résumé général, récapitulatif par chapitre, fiches de révision mémo, définitions clés, formules et points cruciaux à mémoriser.
6. '/domain' -> Aide l'étudiant à explorer son domaine d'études. Si son domaine (${educationalSession?.studyField || 'non précisé'}) n'est pas connu, demande-le lui. Propose ensuite des spécialisations concrètes (ex: en informatique : Full Stack, Cybersécurité, Réseaux, IA, Data, DevOps), avec pour chaque branche : description, compétences, outils/technos clés, projets pratiques pour s'entraîner, débouchés au Togo et à l'international, certifications réelles, et parcours débutant progressif.
7. '/stop' -> Confirme la désactivation de la session éducative et le retour au mode Scanner d'arnaques, en rassurant l'étudiant que son cours reste conservé en mémoire pour une prochaine fois.

STRUCTURE DE TES RÉPONSES :
- Titres clairs et aérés
- Paragraphes courts
- Listes à puces
- Mots-clés importants en **gras**
- Ton encourageant, jamais rabaissant.
${sessionContext}`;
  }

  // Scanner Mode (Default)
  return `${WOESEAI_SYSTEM_PROMPT}
${langInstruction}

RÈGLES D'AFFICHAGE DU SCANNER D'ARNAQUES (STYLE CHATGPT & BALISES VISUELLES) :
Quand l'utilisateur te transmet un SMS, une description d'appel ou une capture d'écran Mobile Money (T-Money ou Moov Money) :
1. Détermine le verdict parmi :
   - [ROUGE] FRAUDULEUX : Si danger avéré (faux dépôt demandant remboursement, vol de PIN/OTP, faux gain avec frais, fausse tontine pyramidale, menace de coupure).
   - [ORANGE] SUSPECT : Si anomalies, expéditeur douteux, numéro personnel au lieu du serveur.
   - [VERT] AUTHENTIQUE (Format officiel) : UNIQUEMENT si conforme au modèle officiel validé. AVERTISSEMENT OBLIGATOIRE : même si conforme, la syntaxe ne garantit pas la transaction ! Seul le solde via *145# ou *155# fait foi.
   - [GRIS] NON VÉRIFIABLE : Si informations incomplètes ou tronquées.
2. Structure ta réponse avec ces sections distinctes :
   **Résultat de l'analyse :**
   [Insère le badge coloré, ex: [ROUGE] FRAUDULEUX]

   **Opérateur identifié :** T-Money (Togocom) ou Moov Money (Moov Africa) ou Inconnu
   **Détails de la transaction détectée :** (Montant, Expéditeur, Référence TXN si présents)

   **Pourquoi ce message est suspect / analyse :**
   - Liste à puces concise des signaux d'alerte et des manipulations psychologiques (urgence artificielle, culpabilisation, appât du gain).

   **Ce que tu dois faire immédiatement :**
   1. Ne verse aucun argent et ne rappelle pas ce numéro.
   2. Ne communique JAMAIS ton code secret PIN ni ton code OTP.
   3. Vérifie ton solde officiel en composant toi-même *145# (T-Money) ou *155# (Moov Money).
   4. En cas de doute, appelle le service officiel (888 pour Togocom, 100 pour Moov).

Ne fais pas de fausse promesse. Sois rapide, précis et protecteur.`;
}

// API Route: Fast low-latency Conversational Assistant (Streamed SSE or single response)
app.post('/api/chat', async (req, res) => {
  const { messages, stream = true, language = 'fr', mode = 'scanner', educationalSession, imageBase64, imageMime } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages invalides.' });
  }

  const systemInstruction = buildSystemPrompt(language, mode, educationalSession);

  // Format messages for Gemini
  const contents = messages.map((m: { role: string; content: string; imageUrl?: string; imageMime?: string }, index: number) => {
    const parts: any[] = [];

    // If latest user message has an attached image
    const isLatest = index === messages.length - 1;
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

    parts.push({ text: m.content || (imgData ? "Analyse cette capture d'écran." : "") });

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

      let responseStream;
      try {
        responseStream = await ai.models.generateContentStream({
          model: LOW_LATENCY_MODEL,
          contents,
          config: {
            systemInstruction,
          },
        });
      } catch (err: any) {
        console.warn(`[WoèséAI] Stream switching to fallback ${FALLBACK_MODEL}...`);
        responseStream = await ai.models.generateContentStream({
          model: FALLBACK_MODEL,
          contents,
          config: {
            systemInstruction,
          },
        });
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
    console.log(`[WoèséAI Server] Running on http://0.0.0.0:${PORT} (model: ${LOW_LATENCY_MODEL})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
