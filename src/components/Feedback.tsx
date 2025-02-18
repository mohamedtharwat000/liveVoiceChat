interface FeedbackProps {
  chatflowId: string;
  error: string | null;
}

export default function Feedback({ chatflowId, error }: FeedbackProps) {
  return (
    <>
      {!chatflowId && (
        <div className="mt-2 text-sm text-red-400 text-center">
          No Chatflow ID provided.
        </div>
      )}

      {error && <div className="mt-4 p-2 text-red-500 text-sm">{error}</div>}
    </>
  );
}
