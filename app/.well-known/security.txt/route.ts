const expires = new Date("2026-12-10T00:00:00.000Z").toISOString();

const body = [
  "Contact: mailto:hello@loomandhearthstudio.com",
  "Preferred-Languages: en",
  "Canonical: https://www.loomandhearthstudio.com/.well-known/security.txt",
  "Policy: https://www.loomandhearthstudio.com/privacy-policy",
  `Expires: ${expires}`,
  "",
].join("\n");

export function GET() {
  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
