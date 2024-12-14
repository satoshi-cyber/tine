import { z } from "zod";
import { $steps } from "./daunus_steps";
import { Scope, StepOptions } from "./new_types";
import { DaunusCtx } from ".";

export function $useCase<T>(options?: { input?: z.ZodType<T> }) {
  const scope = new Scope({}).addGlobal("input", {} as T);

  function steps<T extends StepOptions>(options?: T) {
    return $steps({
      $: scope,
      stepsType: options?.stepsType as T["stepsType"]
    });
  }

  function handle<Z>(fn: ($: typeof scope.global) => Z) {
    return {} as { run: (input: T, ctx?: DaunusCtx) => Promise<Z> };
  }

  return { steps, handle };
}