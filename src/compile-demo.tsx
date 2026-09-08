import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import CompileWordmark from "@/components/CompileWordmark";
import "@/index.css";

function Demo() {
  const [run, setRun] = useState(0);
  const [delay, setDelay] = useState(600);

  return (
    <div className="min-h-screen w-full bg-[#EEECE7] px-8 py-10 text-[#26251E]">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-y-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium">Compile wordmark</h1>
            <p className="text-sm opacity-60">
              7 Lissajous curves &middot; L rotates &minus;81&deg;&rarr;&minus;121&deg; (1299ms), P rotates 0&deg;&rarr;&minus;30&deg; (1065ms)
            </p>
          </div>
          <div className="flex items-center gap-x-4">
            <label className="flex items-center gap-x-2 text-sm">
              delay
              <input
                type="range"
                min={0}
                max={3000}
                step={100}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
              />
              <span className="w-14 tabular-nums opacity-60">{delay}ms</span>
            </label>
            <button
              onClick={() => setRun((n) => n + 1)}
              className="rounded-full bg-[#26251E] px-5 py-2 text-sm text-[#EEECE7] hover:opacity-80"
            >
              Replay
            </button>
          </div>
        </header>

        <div className="rounded-2xl bg-white/40 p-6">
          <CompileWordmark key={run} delayMs={delay} />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
