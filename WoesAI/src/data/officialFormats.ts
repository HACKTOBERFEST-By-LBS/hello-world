export interface OperatorFormatSpec {
  operator: 'T-Money' | 'Moov Money';
  parentCompany: string;
  senderId: string;
  ussdCheck: string;
  customerServiceNumber: string;
  officialDepositExample: string;
  officialTransferExample: string;
  fraudulentCounterfeitExample: string;
  differences: {
    element: string;
    authentic: string;
    fraudulent: string;
    whyItMatters: string;
  }[];
  criticalRules: string[];
}

export const OFFICIAL_FORMATS: Record<'tmoney' | 'moov', OperatorFormatSpec> = {
  tmoney: {
    operator: 'T-Money',
    parentCompany: 'Togocom (Togo Cellulaire)',
    senderId: 'TMoney / T-MONEY (Alphanumérique opérateur)',
    ussdCheck: '*145# (Menu Principal & Consultation Solde)',
    customerServiceNumber: '888 (Appel gratuit depuis Togocom)',
    officialDepositExample:
      'Vous avez recu 25000 FCFA de 90123456. Nouveau solde: 42350 FCFA. Frais: 0 FCFA. Ref: TXN20241031.1508.A912. Togocom vous remercie.',
    officialTransferExample:
      'Transfert reussi de 10000 FCFA vers 91234567. Frais: 100 FCFA. Nouveau solde: 32250 FCFA. Ref: TXN20241031.1509.B110.',
    fraudulentCounterfeitExample:
      'TMONEY: Vous avez recu 25000 FCFA de KODJO A. Nouveau solde: 42350 FCFA. Merci d avoir choisi Togocom. (Envoyé par le +228 92 44 11 22)',
    differences: [
      {
        element: "Numéro d'expédition",
        authentic: "Affiché comme 'TMoney' (pas de numéro de téléphone +228)",
        fraudulent: "Numéro de portable togolais ordinaire (90/91/92/93/70...)",
        whyItMatters: "Un particulier ne peut pas envoyer un SMS réseau avec le libellé d'un opérateur sans passer par un serveur télécom dédié.",
      },
      {
        element: 'Mise à jour du solde',
        authentic: "Le solde réel de votre compte T-Money augmente réellement sur le serveur central.",
        fraudulent: "Le faux SMS invente un chiffre, mais votre solde sur *145# n'a pas bougé d'un franc !",
        whyItMatters: "L'escroc vous pousse à rembourser un argent qu'il ne vous a en réalité jamais envoyé.",
      },
      {
        element: 'Numéro de référence',
        authentic: 'Format officiel TXN[DATE].[HEURE].[CODE]',
        fraudulent: 'Référence inventée courte (ex: TXN1234) ou absente',
        whyItMatters: 'Permet la traçabilité informatique immédiate en cas de réclamation au 888.',
      },
    ],
    criticalRules: [
      "Vérifiez TOUJOURS votre solde en tapant *145# puis votre code secret avant de répondre à quelqu'un.",
      "Ne renvoyez JAMAIS d'argent directement si quelqu'un vous appelle en criant à l'erreur. Dites-lui d'appeler le 888.",
      "Togocom ne demande JAMAIS votre code secret PIN ni vos codes de confirmation par SMS.",
    ],
  },
  moov: {
    operator: 'Moov Money',
    parentCompany: 'Moov Africa Togo',
    senderId: 'MoovMoney / Moov Money',
    ussdCheck: '*155# (Menu Principal & Consultation Solde)',
    customerServiceNumber: '100 ou 155 (Service Client Moov)',
    officialDepositExample:
      'Transfert effectue avec succes. Montant: 20000 FCFA a 99123456. Frais: 150 FCFA. Solde disponible: 35500 FCFA. ID Transaction: MP241031154567.',
    officialTransferExample:
      'Depot de 50000 FCFA effectue avec succes sur votre compte Moov Money. Nouveau solde: 55000 FCFA. ID: MP241031155012. Moov Africa.',
    fraudulentCounterfeitExample:
      'MOOV MONEY NOTIF: 20000 FCFA recus sur votre compte. Appelez le 97001122 pour debloquer vos fonds sous 15 minutes. (Envoyé par le +228 98 12 34 56)',
    differences: [
      {
        element: "Numéro d'expédition",
        authentic: "Libellé 'MoovMoney' direct",
        fraudulent: 'Numéro de téléphone personnel +228 96/97/98/99',
        whyItMatters: "Les notifications automatiques du système de Moov Africa proviennent du serveur d'envoi réseau.",
      },
      {
        element: 'ID Transaction',
        authentic: 'Commence généralement par les initiales MP suivies de la date et de chiffres uniques',
        fraudulent: 'ID bizarre, inexistant ou demande de rappeler un numéro de téléphone portable',
        whyItMatters: "Chaque mouvement financier est identifié par un identifiant serveur vérifiable en agence.",
      },
      {
        element: "Sentiment d'urgence",
        authentic: 'Information factuelle, calme, sans menaces ni ultimatum de temps',
        fraudulent: "Menace de blocage 'sous 15 minutes' ou urgence extrême",
        whyItMatters: "L'urgence est créée intentionnellement pour vous empêcher de vérifier votre solde.",
      },
    ],
    criticalRules: [
      "Tapez *155# pour vérifier votre solde Moov Money avant de croire tout message de crédit.",
      "Ne composez JAMAIS une séquence USSD dictée par téléphone (ex: *155*4*...#) car cela transfère votre argent à l'escroc.",
      "Aucun agent Moov Africa ne peut vous exiger un code secret.",
    ],
  },
};
