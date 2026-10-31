# AUDIT COMPLET DE L'APPLICATION WOÈSÉAI
*Date de l'audit : 31 octobre 2026*
*Auditeur : Ingénieur Full Stack Senior & Architecte Logiciel*

---

## 1. Architecture Actuelle

- **Frontend** : React 19 SPA avec TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend** : Node.js / Express (`server.ts`) monté avec `vite.middlewares` en développement et servant `dist` en production.
- **Moteur IA** : Google GenAI SDK (`@google/genai` v2.32.0) côté serveur, avec le modèle ultra-rapide basse latence `gemini-3.1-flash-lite` et basculement automatique de résilience sur `gemini-3.8-flash` en cas de pic de charge (503/429).
- **Sécurité API** : Clé d'API `process.env.GEMINI_API_KEY` isolée exclusivement sur le serveur Node.js, aucune clé exposée au client.
- **Persistance locale** : `localStorage` pour les sessions, l'historique des discussions, les préférences de langue (Français, Anglais, Éwé, Kabyè) et le thème (clair/sombre).

---

## 2. Inventaire des Fichiers et Composants

### Backend (`server.ts`)
- `GET /api/health` : Statut du service, détection de la clé API et identification du modèle.
- `POST /api/chat` : Route de conversation multimodale avec streaming SSE (`text/event-stream`), support des images (Base64), et prompt dynamique selon le mode (`scanner` vs `educational`) et la langue.
- `POST /api/analyze` : Analyse JSON stricte de SMS et captures d'écran avec schéma standardisé WoèséAI (`verdict`, `operator`, `transaction`, `fraud_indicators`, `recommendations`, `confidence`).
- `POST /api/learn` : Générateur de leçons pour le mode éducatif structuré.

### Frontend (`/src`)
- `App.tsx` : Composant racine coordonnant la Navbar, l'interface de conversation, le mode, la langue, le thème et les modales.
- `Navbar.tsx` : Barre supérieure fixe avec commutateur de mode (Scanner ↔ Éducatif), sélecteur de langue, bouton d'urgences et paramètres.
- `ChatInterface.tsx` : Zone centrale de discussion avec zone de saisie fixe, enregistrement vocal Web Speech API, importation d'image et suggestions d'amorce.
- `ChatMessageItem.tsx` : Composant d'affichage des bulles de messages avec synthèse vocale (`window.speechSynthesis`), parseur Markdown et badges de couleur (`[ROUGE]`, `[ORANGE]`, `[VERT]`, `[BLEU]`, `[GRIS]`).
- `SettingsModal.tsx` : Paramètres de langue, thème (clair/sombre), vitesse audio et contact d'urgence.
- `EmergencyModal.tsx` : Annuaire d'urgence togolais (Togocom 888, Moov 100/155, Police 117, Gendarmerie 172, codes USSD `*145#` et `*155#`).
- `ComparatorTab.tsx` : Simulateur comparatif visuel côte à côte (SMS authentique vs contrefait).
- `ReportTab.tsx` : Module de veille citoyenne et recherche de numéros suspects signalés.
- `DetectorTab.tsx` : Interface spécialisée d'analyse technique de SMS avec `VerdictCard.tsx`.
- `data/samples.ts` : Scénarios togolais authentiques et frauduleux (faux dépôt, tombola 500k, vol de PIN, fausse tontine).
- `data/officialFormats.ts` : Spécifications des modèles officiels T-Money et Moov Money.
- `data/translations.ts` : Traductions pour FR, EN, Éwé (Eʋegbe) et Kabyè (Kabɩyɛ).
- `data/quiz.ts` : Cas pratiques interactifs pour tester les réflexes anti-arnaque.

---

## 3. État des Fonctionnalités

| Fonctionnalité | Statut Actuel | Problèmes Identifiés |
|---|---|---|
| **Ouverture directe sur le chatbot** | **OPÉRATIONNELLE** | L'app démarre directement sur l'interface de discussion. |
| **Bascule de mode Scanner / Éducatif** | **OPÉRATIONNELLE** | Transition fluide dans la navbar avec adaptation des prompts. |
| **Détection d'arnaques SMS (Texte)** | **OPÉRATIONNELLE** | Moteur IA rigoureux, verdicts clairs, respect de la règle d'or (*145# / *155#). |
| **Analyse de capture d'écran** | **OPÉRATIONNELLE** | Importation PNG/JPG avec transmission Base64 vision au modèle. |
| **Enregistrement vocal utilisateur** | **PARTIELLEMENT OPÉRATIONNELLE** | Fonctionne via `webkitSpeechRecognition`, mais manque de bouton d'arrêt d'urgence et d'indicateur d'annulation. |
| **Lecture vocale (Text-to-Speech)** | **OPÉRATIONNELLE** | Synthèse vocale native avec Play/Pause/Reprise/Stop et réglage de vitesse. |
| **Support multilingue (FR, EN, EE, KBP)** | **OPÉRATIONNELLE** | Dictionnaire complet pour l'UI et injection de consignes linguistiques dans le prompt IA. |
| **Gestion des conversations (Historique)** | **PARTIELLEMENT OPÉRATIONNELLE** | Une seule conversation linéaire était stockée. Manque d'un tiroir/tiroir d'historique multi-conversations (créer, lister, basculer, supprimer des conversations). |
| **Bouton d'arrêt de génération (Stop streaming)** | **DÉFECTUEUSE / MANQUANTE** | Absence d'`AbortController` pour interrompre la génération de texte en cours. |
| **Prise en charge des PDF en Mode Éducatif** | **PARTIELLEMENT OPÉRATIONNELLE** | Les fichiers `.txt` et `.md` étaient lus, mais les fichiers `.pdf` n'extrayaient pas le texte ou ne transmettaient pas le document au modèle. |
| **Base des références officielles de SMS** | **PARTIELLEMENT OPÉRATIONNELLE** | Structure présente mais non consultable directement depuis l'interface de chat principale. |
| **Boutons décoratifs / liens isolés** | **MINEUR** | Les composants `ComparatorTab` et `ReportTab` étaient présents dans les fichiers mais non rattachés à un accès direct depuis la navbar ou le tiroir. |

---

## 4. Vulnérabilités & Points d'Attention Sécurité

1. **Extraction de documents** : Les fichiers PDF téléversés doivent être validés en taille (max 10 Mo) et transmis proprement en `application/pdf` ou texte extrait pour éviter les erreurs de lecture.
2. **Protection contre l'injection de prompt** : Renforcer l'instruction système pour s'assurer qu'aucun texte injecté dans un SMS ou un document ne puisse usurper le rôle de WoèséAI ou révéler des instructions internes.
3. **Contrôle d'abandon de requête** : Implémenter l'`AbortController` côté client pour libérer immédiatement les ressources réseau et processeur lors de l'arrêt demandé par l'utilisateur.
4. **Anonymisation** : Ne jamais afficher les clés secrètes ni stocker de données bancaires en clair.

---

## 5. Plan d'Action & Ordre de Priorité

1. **Priorité 0 (Architecture & Multi-conversations)** :
   - Mettre en place un gestionnaire multi-conversations complet (Tiroir latéral ChatGPT-like avec liste des conversations, création, sélection, renommage automatique selon le premier message, et suppression).
   - Intégrer l'`AbortController` pour le bouton d'arrêt de génération (`Stop`).

2. **Priorité 1 (Support multimodal & PDF pour le Mode Éducatif)** :
   - Intégrer la lecture native des documents PDF via `application/pdf` inlineData transmis au backend pour que `/apprendre`, `/plan`, `/quiz`, `/resume` exploitent le contenu réel des PDF.
   - Valider la gestion des fichiers volumineux ou illisibles avec messages d'erreur conviviaux.

3. **Priorité 2 (Intégration unifiée des outils Scanner & Communauté)** :
   - Rendre le Comparateur Officiel (Vrai vs Faux) et la Veille Citoyenne / Signalements accessibles depuis la Navbar ou le tiroir latéral sans quitter la discussion.

4. **Priorité 3 (Fonctions vocales & Ergonomie)** :
   - Peaufiner l'enregistrement vocal avec possibilité d'annuler ou de valider le texte avant envoi.
   - Améliorer l'accessibilité mobile (responsive drawer, boutons tactiles).

5. **Priorité 4 (Tests d'intégration complets & Validation)** :
   - Tester l'ensemble des commandes éducatives (`/`, `/apprendre`, `/plan`, `/quiz`, `/resume`, `/domain`, `/stop`).
   - Tester le scanner textuel et visuel sur les cas officiels et d'arnaques.
   - Produire le rapport final `RAPPORT_FINAL_WOESEAI.md`.
