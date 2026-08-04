const FRAME_ASPECT_RATIO = 762.5 / 469.3333;

export default function Logo3D({
  width = 140,
  durationMs = 1600,
  className = "",
}: {
  width?: number;
  durationMs?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Kanot"
      className={`inline-block shrink-0 bg-no-repeat ${className}`}
      style={{
        width,
        aspectRatio: FRAME_ASPECT_RATIO,
        backgroundImage: "url(/imagenes/logo-3d.png)",
        backgroundSize: "400% 300%",
        animation: `kanot-logo-spin ${durationMs}ms linear infinite`,
      }}
    />
  );
}
