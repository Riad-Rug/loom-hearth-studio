import { ImageResponse } from "next/og";

import { lookbookItems } from "@/features/content-pages/content-pages-data";

export const alt =
  "A low-furnished Moroccan living room anchored by an ivory Beni Ourain rug in natural light.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function LookbookOpenGraphImage() {
  const heroImage = lookbookItems[0]?.imageSrc;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#211f22",
          color: "#fffaf2",
          fontFamily: "Georgia, serif",
          overflow: "hidden",
        }}
      >
        {heroImage ? (
          <img
            alt=""
            src={heroImage}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(25, 22, 20, 0.82) 0%, rgba(25, 22, 20, 0.54) 42%, rgba(25, 22, 20, 0.16) 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Loom & Hearth Studio
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 720,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 78,
                lineHeight: 0.94,
                letterSpacing: -2,
              }}
            >
              Moroccan Interior Lookbook
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 610,
                color: "#f3e7d7",
                fontFamily: "Arial, sans-serif",
                fontSize: 28,
                lineHeight: 1.32,
              }}
            >
              Hand-knotted rugs, vintage textiles, and Moroccan decor photographed in real
              interiors.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
