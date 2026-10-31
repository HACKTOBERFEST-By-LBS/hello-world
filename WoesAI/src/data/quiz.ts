export interface QuizQuestion {
  id: number;
  question: string;
  context: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  category: string;
  practicalTip: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Vous recevez un SMS disant que vous avez reçu 25 000 FCFA. Deux minutes plus tard, un inconnu vous appelle en pleurant en disant : 'Maman, je me suis trompé de numéro, renvoyez-moi mon argent vite s'il vous plaît !'. Que faites-vous ?",
    context: "Arnaque classique au faux dépôt d'erreur au Togo",
    options: [
      {
        id: 'a',
        text: "Je vérifie tout de suite mon solde réel en tapant mon code secret USSD (*145# ou *155#).",
        isCorrect: true,
        explanation: "Bravo ! C'est le réflexe absolu. Ne vous fiez JAMAIS au SMS reçu. Seul votre solde vérifié par vous-même via *145# ou *155# dit la vérité.",
      },
      {
        id: 'b',
        text: "Par pitié et gentillesse, je lui renvoie immédiatement les 25 000 FCFA.",
        isCorrect: false,
        explanation: "Piège mortel ! C'est exactement ce que cherche l'escroc. Le SMS reçu est un faux message ou envoyé depuis un numéro 9X... Votre compte n'a jamais reçu d'argent, vous perdriez vos propres 25 000 FCFA.",
      },
      {
        id: 'c',
        text: "Je lui transfère la moitié pour être gentil.",
        isCorrect: false,
        explanation: "Erreur ! Vous perdez votre propre argent. Il faut vérifier son solde avant toute action.",
      },
    ],
    category: "Faux Dépôt",
    practicalTip: "Si la personne a vraiment fait une erreur de transfert officiel, dites-lui de contacter le service client officiel de son opérateur (888 pour Togocom, 100/155 pour Moov) qui peut annuler une transaction erronée selon la procédure légale.",
  },
  {
    id: 2,
    question: "Un appelant affirme être un agent de la direction Togocom / T-Money et vous demande votre code PIN secret à 4 chiffres pour 'sécuriser votre compte'. Que devez-vous faire ?",
    context: "Tentative d'usurpation d'agent officiel",
    options: [
      {
        id: 'a',
        text: "Je lui donne mon code car c'est un agent de Togocom.",
        isCorrect: false,
        explanation: "Non ! AUCUN agent de Togocom ou de Moov n'a besoin ni le droit de vous demander votre code PIN secret.",
      },
      {
        id: 'b',
        text: "Je raccroche immédiatement. Mon code PIN est strictement personnel et secret.",
        isCorrect: true,
        explanation: "Exactement ! Votre code secret PIN est confidentiel comme la clé de votre coffre. Si un prétendu agent vous le demande, c'est un escroc à 100%.",
      },
      {
        id: 'c',
        text: "Je lui donne un faux code pour rigoler.",
        isCorrect: false,
        explanation: "Le mieux est de raccrocher et de signaler le numéro au service client 888 ou à l'autorité.",
      },
    ],
    category: "Code PIN / Sécurité",
    practicalTip: "Les vrais agents techniques voient les statuts informatiques dans leurs écrans sécurisés ; ils n'ont JAMAIS besoin de connaître votre mot de passe ni votre PIN.",
  },
  {
    id: 3,
    question: "Comment reconnaître un véritable SMS de notification envoyé par T-Money ou Moov Money ?",
    context: "Identification de l'expéditeur officiel",
    options: [
      {
        id: 'a',
        text: "Le SMS provient d'un numéro personnel togolais ordinaire (ex: +228 92 12 34 56).",
        isCorrect: false,
        explanation: "Faux ! Si l'expéditeur est un numéro à 8 chiffres (9X, 7X), c'est une personne privée, pas le serveur central de l'opérateur !",
      },
      {
        id: 'b',
        text: "L'expéditeur affiche officiellement le nom de l'opérateur (TMoney ou MoovMoney) et contient une référence de transaction unique et votre solde mis à jour.",
        isCorrect: true,
        explanation: "Parfait ! Les opérateurs disposent d'un identifiant réseau court (Shortcode alphanumérique) comme 'TMoney' ou 'MoovMoney'.",
      },
      {
        id: 'c',
        text: "Le SMS contient des fautes de frappe et demande de rappeler un numéro portable.",
        isCorrect: false,
        explanation: "Les SMS automatiques des opérateurs ne contiennent pas de fautes d'orthographe et n'invitent jamais à rappeler un numéro portable privé.",
      },
    ],
    category: "Format SMS",
    practicalTip: "Regardez toujours qui a envoyé le SMS en haut de l'écran : si c'est un numéro 90... ou 70..., méfiance totale !",
  },
  {
    id: 4,
    question: "Vous recevez un SMS : 'Félicitations ! Vous avez gagné 500 000 FCFA à la tombola nationale. Pour récupérer vos sous, envoyez 15 000 FCFA de frais de dossier'. Quelle est la vérité ?",
    context: "Arnaque à la fausse tombola / gain financier",
    options: [
      {
        id: 'a',
        text: "C'est une arnaque 100% garantie. On ne paie jamais pour toucher un gain légitime !",
        isCorrect: true,
        explanation: "Absolument vrai ! Dans une vraie tombola déclarée, les gains sont remis gratuitement en agence officielle munie de votre carte d'identité.",
      },
      {
        id: 'b',
        text: "C'est une opportunité en or, 15 000 FCFA pour gagner 500 000 FCFA c'est rentable.",
        isCorrect: false,
        explanation: "Vous venez de vous faire délester de 15 000 FCFA. Dès que vous envoyez ces frais, l'escroc éteint son téléphone.",
      },
      {
        id: 'c',
        text: "Je négocie pour payer seulement 5 000 FCFA de frais.",
        isCorrect: false,
        explanation: "C'est une pure escroquerie. Ne négociez rien avec un fraudeur.",
      },
    ],
    category: "Faux Concours",
    practicalTip: "Règle d'or : Toute personne qui vous annonce que vous avez gagné à un jeu auquel vous n'avez jamais participé ment. Et si on vous demande de payer pour recevoir un cadeau, c'est une escroquerie.",
  },
  {
    id: 5,
    question: "Quelqu'un sur Facebook ou WhatsApp vous propose d'intégrer une 'tontine magique' où 10 000 FCFA investis vous rapportent 30 000 FCFA en 24 heures. Que pensez-vous de cette offre ?",
    context: "Fausses tontines et arnaques de Ponzi",
    options: [
      {
        id: 'a',
        text: "C'est une arnaque pyramidale. Aucun investissement légal ne triple votre argent en 24h.",
        isCorrect: true,
        explanation: "Exact ! Les fausses tontines en ligne utilisent l'argent des nouveaux venus pour payer les premiers, puis les créateurs fuient avec la caisse.",
      },
      {
        id: 'b',
        text: "C'est la nouvelle finance numérique qui profite aux Togolais.",
        isCorrect: false,
        explanation: "Non, c'est une escroquerie très répandue à Lomé et dans la sous-région.",
      },
    ],
    category: "Fausses Tontines",
    practicalTip: "Les vraies tontines traditionnelles togolaises reposent sur des personnes physiques connues dans le quartier ou la famille, jamais sur des inconnus cachés derrière un compte WhatsApp anonyme.",
  },
  {
    id: 6,
    question: "Vous recevez un SMS disant : 'Votre compte va être clôturé d'ici 30 minutes si vous ne confirmez pas votre identité ! Tapez *145*...'. Quel piège est utilisé ici ?",
    context: "Manipulation par urgence artificielle et peur",
    options: [
      {
        id: 'a',
        text: "L'urgence artificielle et la peur pour vous faire paniquer et agir sans réfléchir.",
        isCorrect: true,
        explanation: "Bien vu ! Les escrocs utilisent la panique pour contourner votre réflexion logique. Les opérateurs donnent toujours plusieurs semaines et invitent en agence physique pour l'identification KYC.",
      },
      {
        id: 'b',
        text: "Une simple procédure d'urgence administrative normale.",
        isCorrect: false,
        explanation: "Les opérateurs légitimes n'envoient pas d'ultimatum de 30 minutes par SMS avec une syntaxe de transfert d'argent.",
      },
    ],
    category: "Manipulation Psychologique",
    practicalTip: "Quand un message vous crie 'Vite, urgent, 15 minutes avant blocage', respirez, buvez de l'eau et appelez le 888 ou rendez-vous dans une agence officielle.",
  },
];
