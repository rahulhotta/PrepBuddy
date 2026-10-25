import { useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: Error };

/** Runs `load` whenever `key` changes; ignores results from stale runs. */
export function useAsync<T>(load: () => Promise<T>, key: string): AsyncState<T> {
  const [state, setState] = useState<{ key: string; value: AsyncState<T> }>({ key, value: { status: "loading" } });

  useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setState({ key, value: { status: "ready", data } }),
      (error: unknown) =>
        alive && setState({ key, value: { status: "error", error: error instanceof Error ? error : new Error(String(error)) } }),
    );
    return () => {
      alive = false;
    };
    // `key` identifies the request; `load` is recreated every render.
  }, [key]);

  return state.key === key ? state.value : { status: "loading" };
}
