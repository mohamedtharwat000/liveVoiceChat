interface CaptionProps {
  text: string | null;
}

export default function Caption({ text }: CaptionProps) {
  if (!text) return null;
  return <div className="mb-4 p-6 text-xl text-center">{text}</div>;
}
