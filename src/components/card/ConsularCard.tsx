import { MauritaniaEmblem, MauritaniaFlag, StarCrescent, Silhouette } from "./symbols";
import { QrCode } from "./QrCode";
import type { Beneficiary, CardRequest, Gender } from "@/lib/mock";

export interface ConsularCardData {
  reference: string;
  lastName: string;
  firstName: string;
  dob: string;
  placeOfBirth: string;
  nationality: string;
  address: string;
  height: number;
  gender: Gender;
  photoUrl?: string;
  issueDate: string;
  cardType: string;
}

export function buildCardData(
  b: Beneficiary,
  req: CardRequest,
): ConsularCardData {
  return {
    reference: req.reference.replace(/^N°?/i, "") || req.reference,
    lastName: b.lastName,
    firstName: b.firstName,
    dob: b.dob,
    placeOfBirth: b.placeOfBirth,
    nationality: b.nationality,
    address: b.address,
    height: b.height,
    gender: b.gender,
    photoUrl: b.photoUrl,
    issueDate: req.submissionDate,
    cardType: req.cardType,
  };
}

const GREEN = "#006233";
const INK = "#0c2e1f";

const cardBase: React.CSSProperties = {
  background: `
    repeating-linear-gradient(118deg, rgba(0,98,51,0.045) 0px, rgba(0,98,51,0.045) 1px, transparent 1px, transparent 8px),
    repeating-linear-gradient(62deg, rgba(0,98,51,0.035) 0px, rgba(0,98,51,0.035) 1px, transparent 1px, transparent 9px),
    linear-gradient(135deg, #e9f4ec 0%, #d3ecda 55%, #c2e5cb 100%)
  `,
};

function dims(width: number) {
  return { width, height: Math.round(width / 1.586) };
}

export function CardRecto({
  data,
  width = 360,
}: {
  data: ConsularCardData;
  width?: number;
}) {
  const { width: w, height: h } = dims(width);
  return (
    <div
      style={{ ...cardBase, ...dims(width) }}
      className="relative overflow-hidden rounded-[10px] shadow-md ring-1 ring-black/5"
    >
      {/* top flag */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2">
        <MauritaniaFlag width={w * 0.1} />
      </div>

      {/* header */}
      <div className="px-4" style={{ paddingTop: h * 0.16 }}>
        <p
          dir="rtl"
          className="text-center font-semibold"
          style={{ color: GREEN, fontSize: w * 0.033 }}
        >
          الجمهورية الإسلامية الموريتانية
        </p>
        <h3
          className="text-center font-display font-bold"
          style={{ color: GREEN, fontSize: w * 0.039, letterSpacing: "0.1em" }}
        >
          RÉPUBLIQUE ISLAMIQUE DE MAURITANIE
        </h3>
        <div
          className="mx-auto my-1 h-px w-4/5"
          style={{
            background: "linear-gradient(to right, transparent, #cd2a3e, transparent)",
          }}
        />
        <p
          className="text-center font-semibold"
          style={{ color: INK, opacity: 0.8, fontSize: w * 0.022, letterSpacing: "0.06em" }}
        >
          MINISTÈRE DES AFFAIRES ÉTRANGÈRES ET DE LA COOPÉRATION
        </p>
      </div>

      {/* emblem */}
      <div className="absolute" style={{ left: w * 0.06, top: h * 0.42 }}>
        <MauritaniaEmblem size={w * 0.19} />
      </div>

      {/* qr */}
      <div className="absolute" style={{ right: w * 0.06, top: h * 0.4 }}>
        <QrCode
          value={`AFROCONSUL|${data.reference}|${data.lastName} ${data.firstName}|${data.nationality}`}
          size={w * 0.2}
        />
      </div>

      {/* signature */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ bottom: h * 0.12 }}>
        <p style={{ fontFamily: "'Brush Script MT', cursive", color: INK, fontSize: w * 0.045 }}>
          Le Consul
        </p>
        <div className="mx-auto" style={{ marginTop: 2, height: 1, width: w * 0.18, background: "rgba(12,46,31,0.4)" }} />
      </div>

      {/* card number */}
      <div
        className="absolute font-mono"
        style={{ left: w * 0.06, bottom: h * 0.04, color: GREEN, fontSize: w * 0.026 }}
      >
        N°{data.reference}
      </div>
    </div>
  );
}

export function CardVerso({
  data,
  width = 360,
}: {
  data: ConsularCardData;
  width?: number;
}) {
  const { width: w, height: h } = dims(width);
  const photoW = w * 0.2;
  return (
    <div
      style={{ ...cardBase, ...dims(width) }}
      className="relative overflow-hidden rounded-[10px] shadow-md ring-1 ring-black/5"
    >
      {/* watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <StarCrescent size={h * 0.85} color={GREEN} />
      </div>

      <div className="relative h-full" style={{ padding: w * 0.04 }}>
        {/* header */}
        <div className="flex items-center gap-2">
          <MauritaniaEmblem size={w * 0.085} />
          <div className="leading-tight">
            <p className="font-bold" style={{ color: GREEN, fontSize: w * 0.026, letterSpacing: "0.04em" }}>
              RÉPUBLIQUE ISLAMIQUE DE MAURITANIE
            </p>
            <p className="font-display font-semibold" style={{ color: INK, fontSize: w * 0.03 }}>
              Carte d&apos;identité consulaire
            </p>
          </div>
        </div>
        <div className="mt-1 flex h-[3px] w-full overflow-hidden rounded-full">
          <span className="flex-1" style={{ background: "#cd2a3e" }} />
          <span className="flex-1" style={{ background: GREEN }} />
          <span className="flex-1" style={{ background: "#f1c40f" }} />
        </div>

        {/* body */}
        <div className="mt-3 flex gap-3">
          <div
            className="overflow-hidden rounded bg-white"
            style={{ width: photoW, height: photoW * 1.25, boxShadow: `0 0 0 1px ${GREEN}40` }}
          >
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Silhouette className="h-full w-full" />
            )}
          </div>

          <div className="grid flex-1 grid-cols-2" style={{ gap: `${h * 0.03}px ${w * 0.03}px` }}>
            <Field w={w} label="Nom et prénom" value={`${data.lastName} ${data.firstName}`} span2 />
            <Field w={w} label="Né(e) le" value={data.dob} />
            <Field w={w} label="À" value={data.placeOfBirth} />
            <Field w={w} label="Nationalité" value={data.nationality} />
            <Field w={w} label="Sexe" value={data.gender === "feminin" ? "F" : "M"} />
            <Field w={w} label="Taille" value={`${data.height} cm`} />
            <Field w={w} label="Type" value={data.cardType} />
          </div>
        </div>

        {/* footer */}
        <div
          className="absolute inset-x-0 flex items-end justify-between px-4"
          style={{ bottom: w * 0.04 }}
        >
          <span className="font-mono" style={{ color: GREEN, fontSize: w * 0.026 }}>
            N°{data.reference}
          </span>
          <span style={{ color: INK, opacity: 0.7, fontSize: w * 0.022 }}>
            Délivrée le {data.issueDate}
          </span>
          <span className="font-semibold" style={{ color: "#cd2a3e", fontSize: w * 0.022 }}>
            VALABLE 2 ANS
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({
  w,
  label,
  value,
  span2,
}: {
  w: number;
  label: string;
  value: string;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : undefined}>
      <p className="uppercase" style={{ color: GREEN, fontSize: w * 0.018, letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p className="font-semibold" style={{ color: INK, fontSize: w * 0.026 }}>
        {value}
      </p>
    </div>
  );
}
