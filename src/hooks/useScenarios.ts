import { useContext } from "react";
import { ScenariosContext } from "../state/ScenariosContext.context";

export function useScenarios() {
  const ctx = useContext(ScenariosContext);
  if (!ctx)
    throw new Error("useScenarios must be used within ScenariosProvider");
  return ctx;
}
