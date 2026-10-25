import type { ReactNode } from "react";
import type { AsyncState } from "../lib/useAsync";

export function AsyncView<T>({ state, children }: { state: AsyncState<T>; children: (data: T) => ReactNode }) {
  if (state.status === "loading") {
    return (
      <p className="l" role="status">
        LOADING...
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p className="err" role="alert">
        Could not load this material. {state.error.message}
      </p>
    );
  }
  return <>{children(state.data)}</>;
}
