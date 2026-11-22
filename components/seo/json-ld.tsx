type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

// Admin-written text reaches this script tag, and a literal "</script>" in it
// would end the tag early. The escaped form reads back as the same character
// to a JSON parser.
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
