/**
 * Mock data for AfroConsul (frontend-first build).
 * Domain: the Mauritanian consulate issues consular cards to nationals of
 * African foreign countries only (i.e. African nationalities, excluding Mauritania).
 */

export type RequestStatus = "nouveau" | "en_cours" | "traite" | "cloture";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  traite: "Traité",
  cloture: "Cloturé",
};

export type Gender = "masculin" | "feminin";

export interface Beneficiary {
  id: string;
  lastName: string;
  firstName: string;
  dob: string; // dd/mm/yyyy
  placeOfBirth: string;
  nationality: string; // African country (never Mauritania)
  address: string;
  height: number; // cm
  gender: Gender;
  photoUrl?: string;
}

export interface CardRequest {
  id: string;
  reference: string;
  cardType: string;
  unitCount: number;
  submissionDate: string; // dd/mm/yyyy
  deadline: string; // dd/mm/yyyy
  status: RequestStatus;
  beneficiaries: Beneficiary[];
}

/**
 * African countries eligible for a consular card (Mauritania intentionally excluded —
 * the platform serves foreign African nationals only).
 */
export const AFRICAN_COUNTRIES: string[] = [
  "Afrique du Sud", "Algérie", "Angola", "Bénin", "Botswana", "Burkina Faso",
  "Burundi", "Cameroun", "Cap-Vert", "Comores", "Congo", "Côte d'Ivoire",
  "Djibouti", "Égypte", "Érythrée", "Eswatini", "Éthiopie", "Gabon", "Gambie",
  "Ghana", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Kenya", "Lesotho",
  "Libéria", "Libye", "Madagascar", "Malawi", "Mali", "Maroc", "Maurice",
  "Mozambique", "Namibie", "Niger", "Nigéria", "Ouganda", "République centrafricaine",
  "République démocratique du Congo", "Rwanda", "São Tomé-et-Principe", "Sénégal",
  "Seychelles", "Sierra Leone", "Somalie", "Soudan", "Soudan du Sud", "Tanzanie",
  "Tchad", "Togo", "Tunisie", "Zambie", "Zimbabwe",
];

function makeBeneficiaries(): Beneficiary[] {
  const seed: Array<[string, string, string, string]> = [
    ["DIALLO", "Mamadou Alpha", "Sénégal", "Dakar"],
    ["BA", "Abdoulaye", "Sénégal", "Saint-Louis"],
    ["SENE", "Simond", "Côte d'Ivoire", "Abidjan"],
    ["MBAYE", "Pape Abdou", "Sénégal", "Thiès"],
    ["SIDIBÉ", "Yahya", "Mali", "Bamako"],
    ["KEITA", "Mariam", "Mali", "Kayes"],
    ["SY", "Mamadou", "Guinée", "Conakry"],
    ["SIMON", "Patrick", "Ghana", "Accra"],
    ["BADJI", "Moustapha", "Sénégal", "Ziguinchor"],
    ["NDIAYE", "Aïssatou", "Sénégal", "Dakar"],
  ];
  return seed.map((s, i) => ({
    id: `b${i + 1}`,
    lastName: s[0],
    firstName: s[1],
    nationality: s[2],
    placeOfBirth: s[3],
    dob: "06/07/1994",
    address: "Tevragh Zeina, Nouakchott",
    height: 170 + ((i * 3) % 25),
    gender: ["KEITA", "NDIAYE"].includes(s[0]) ? "feminin" : "masculin",
  }));
}

const allBeneficiaries = makeBeneficiaries();

export const CARD_REQUESTS: CardRequest[] = [
  {
    id: "123",
    reference: "N°3901AFC21",
    cardType: "Carte consulaire",
    unitCount: 20,
    submissionDate: "07/07/2024",
    deadline: "21/07/2024",
    status: "nouveau",
    beneficiaries: allBeneficiaries,
  },
  {
    id: "124",
    reference: "N°3902AFC21",
    cardType: "Carte consulaire",
    unitCount: 12,
    submissionDate: "05/07/2024",
    deadline: "19/07/2024",
    status: "en_cours",
    beneficiaries: allBeneficiaries.slice(0, 6),
  },
  {
    id: "125",
    reference: "N°3903AFC21",
    cardType: "Carte de séjour",
    unitCount: 8,
    submissionDate: "01/07/2024",
    deadline: "15/07/2024",
    status: "traite",
    beneficiaries: allBeneficiaries.slice(0, 4),
  },
  {
    id: "126",
    reference: "N°3904AFC21",
    cardType: "Carte consulaire",
    unitCount: 20,
    submissionDate: "28/06/2024",
    deadline: "12/07/2024",
    status: "en_cours",
    beneficiaries: allBeneficiaries,
  },
  {
    id: "127",
    reference: "N°3905AFC21",
    cardType: "Carte de séjour",
    unitCount: 5,
    submissionDate: "20/06/2024",
    deadline: "04/07/2024",
    status: "cloture",
    beneficiaries: allBeneficiaries.slice(0, 5),
  },
  {
    id: "128",
    reference: "N°3906AFC21",
    cardType: "Carte consulaire",
    unitCount: 15,
    submissionDate: "18/06/2024",
    deadline: "02/07/2024",
    status: "traite",
    beneficiaries: allBeneficiaries.slice(0, 7),
  },
  {
    id: "129",
    reference: "N°3907AFC21",
    cardType: "Carte consulaire",
    unitCount: 10,
    submissionDate: "12/06/2024",
    deadline: "26/06/2024",
    status: "cloture",
    beneficiaries: allBeneficiaries.slice(0, 10),
  },
  {
    id: "130",
    reference: "N°3908AFC21",
    cardType: "Carte de séjour",
    unitCount: 6,
    submissionDate: "08/06/2024",
    deadline: "22/06/2024",
    status: "cloture",
    beneficiaries: allBeneficiaries.slice(0, 6),
  },
];

export interface Appointment {
  id: string;
  requestRef: string;
  cardType: string;
  unitCount: number;
  date: string; // long FR
  slot: string;
  deadline: string;
  status: "assiste" | "manque" | "a_venir";
}

export const APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    requestRef: "N°12345678",
    cardType: "Carte consulaire",
    unitCount: 20,
    date: "28 Juillet 2024",
    slot: "12H - 13H",
    deadline: "26/07/2024",
    status: "a_venir",
  },
  {
    id: "a2",
    requestRef: "N°12345678",
    cardType: "Carte consulaire",
    unitCount: 20,
    date: "15 Juillet 2024",
    slot: "12H - 13H",
    deadline: "13/07/2024",
    status: "assiste",
  },
  {
    id: "a3",
    requestRef: "N°12345602",
    cardType: "Carte de séjour",
    unitCount: 100,
    date: "01 Juillet 2024",
    slot: "09H - 10H",
    deadline: "29/06/2024",
    status: "assiste",
  },
  {
    id: "a4",
    requestRef: "N°12345602",
    cardType: "Carte de séjour",
    unitCount: 100,
    date: "22 Mai 2024",
    slot: "09H - 10H",
    deadline: "20/05/2024",
    status: "manque",
  },
];

export const CURRENT_USER = {
  name: "Abdoulaye Konaté",
  role: "Agent consulaire",
};
