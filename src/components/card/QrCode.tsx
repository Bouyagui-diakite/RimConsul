import QRCode from "react-qr-code";

/** Scannable QR code, styled to sit on the consular card. */
export function QrCode({
  value,
  size = 64,
  fg = "#0c2e1f",
}: {
  value: string;
  size?: number;
  fg?: string;
}) {
  const pad = Math.round(size * 0.08);
  return (
    <div
      style={{
        background: "#ffffff",
        padding: pad,
        borderRadius: 4,
        lineHeight: 0,
        boxShadow: "0 0 0 0.5px rgba(0,0,0,0.08)",
      }}
    >
      <QRCode
        value={value || "AFROCONSUL"}
        size={size}
        bgColor="#ffffff"
        fgColor={fg}
        level="M"
        style={{ height: size, width: size, display: "block" }}
      />
    </div>
  );
}
