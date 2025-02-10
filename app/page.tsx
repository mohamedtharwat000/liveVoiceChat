import Microphone from "./microphone";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mb-32 flex justify-center items-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4">
        <Microphone />
      </div>
    </main>
  );
}
