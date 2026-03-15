type PlaceholderPanelProps = {
  title: string;
  body: string;
};

export function PlaceholderPanel({ title, body }: PlaceholderPanelProps) {
  return (
    <section className="placeholder-panel">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}
