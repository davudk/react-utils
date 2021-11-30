import { useState } from "react";

export function useForceRender() {
  const [_, setState] = useState<any>();
  return () => setState(Math.random());
}