export interface SampleSMS {
  id: string;
  title: string;
  category: 'faux_depot' | 'faux_gain' | 'vol_code' | 'fausse_tontine' | 'authentique_tmoney' | 'authentique_moov' | 'suspect_incomplet';
  operator: 'T-Money' | 'Moov Money' | 'Inconnu';
  sender: string;
  text: string;
  expectedVerdict: 'AUTHENTIQUE' | 'SUSPECT' | 'FRAUDULEUX' | 'NON_VERIFIABLE';
  description: string;
}

export const SAMPLE_SMS_LIST: SampleSMS[] = [
  {
    id: 'scam-fake-deposit-1',
    title: '🚨 Faux dépôt avec appel d’urgence',
    category: 'faux_depot',
    operator: 'T-Money',
    sender: '+228 92 14 33 08',
    text: 'TMONEY: Vous avez recu 35 000 FCFA de KODJO A. Nouveau solde: 58 200 FCFA. Ref: TXN99482. Merci d utiliser Togocom.',
    expectedVerdict: 'FRAUDULEUX',
    description: 'Envoyé depuis un numéro personnel togolais 92 XX XX XX au lieu de l’identifiant TMoney. L’escroc appelle aussitôt en pleurant pour demander le remboursement.',
  },
  {
    id: 'scam-tombola-gain',
    title: '🚨 Fausse tombola Togocom 500 000 FCFA',
    category: 'faux_gain',
    operator: 'T-Money',
    sender: '+228 70 88 41 22',
    text: 'FELICITATION ! Votre numero a ete tire au sort par la Direction TOGOCOM. Vous gagnez 500.000 FCFA. Pour retirer votre lot, contactez d urgence le responsable Mr AGBEKO au 91223344 et envoyez 15.000 FCFA de frais de dossier.',
    expectedVerdict: 'FRAUDULEUX',
    description: 'Arnaque au faux gain de tombola exigeant 15 000 FCFA de frais préalables. Togocom n’organise aucun tirage secret exigeant des frais de retrait.',
  },
  {
    id: 'scam-pin-blocking',
    title: '🚨 Menace de blocage & vol de Code PIN Moov',
    category: 'vol_code',
    operator: 'Moov Money',
    sender: '+228 97 65 43 21',
    text: 'ALERTE MOOV AFRICA : Votre compte Moov Money presente une anomalie de conformite. Pour eviter le blocage definitif sous 24h, composez *155*4*97654321*50000# ou transmettez votre code secret PIN a l agent.',
    expectedVerdict: 'FRAUDULEUX',
    description: 'Tentative de vol de code PIN et manipulation USSD pour faire transférer 50 000 FCFA au numéro de l’escroc sous prétexte de conformité.',
  },
  {
    id: 'scam-tontine-whatsapp',
    title: '🚨 Fausse tontine en ligne « Flash Lomé »',
    category: 'fausse_tontine',
    operator: 'Inconnu',
    sender: '+228 93 11 00 45',
    text: 'Rejoins la grande tontine express de Lomé ! Tu cotises 20.000 FCFA par T-Money ou Moov Money et tu recois 60.000 FCFA en 48 heures sans risque. Places limitees, écris-moi vite sur WhatsApp.',
    expectedVerdict: 'FRAUDULEUX',
    description: 'Système pyramidal illégal promettant de tripler la mise en 48h. Dès l’envoi des fonds, l’escroc bloque la victime.',
  },
  {
    id: 'authentic-tmoney-depot',
    title: '✅ Vrai SMS de dépôt T-Money (Officiel)',
    category: 'authentique_tmoney',
    operator: 'T-Money',
    sender: 'TMoney',
    text: 'Vous avez recu 15 000 FCFA de 90 12 34 56. Nouveau solde: 27 500 FCFA. Frais: 0 FCFA. Ref: TXN20241031.1245.A892. Togocom vous remercie.',
    expectedVerdict: 'AUTHENTIQUE',
    description: 'SMS standard officiel émis par TMoney avec identifiant réseau opérateur et référence horodatée conforme.',
  },
  {
    id: 'authentic-moov-transfert',
    title: '✅ Vrai SMS transfert Moov Money (Officiel)',
    category: 'authentique_moov',
    operator: 'Moov Money',
    sender: 'MoovMoney',
    text: 'Transfert effectue avec succes. Montant: 10 000 FCFA a 99 88 77 66. Frais: 150 FCFA. Solde disponible: 34 200 FCFA. ID Transaction: MP241031143290.',
    expectedVerdict: 'AUTHENTIQUE',
    description: 'Message conforme au format officiel de notification de transfert émis par Moov Africa Togo.',
  },
  {
    id: 'suspect-incomplete',
    title: '⚪ SMS incomplet ou douteux',
    category: 'suspect_incomplet',
    operator: 'Inconnu',
    sender: 'Inconnu',
    text: 'Depot effectue. Merci de verifier votre solde et de me renvoyer la part convenue.',
    expectedVerdict: 'NON_VERIFIABLE',
    description: 'Texte sans opérateur, sans référence, sans montant vérifiable. Non concluant selon la grille rigoureuse de WoèséAI.',
  },
];
