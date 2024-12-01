import {
  AbstractStepFactory,
  Action,
  StepConfig,
  StepFactory,
  resultKey
} from "./new_types";
import { DisableSameName, FormatScope, Overwrite } from "./type_helpers";

export type ExtractValuesByKey<T, K extends keyof any> =
  T extends Record<string, any>
    ? T extends Record<K, infer R>
      ? R
      : { [P in keyof T]: ExtractValuesByKey<T[P], K> }[keyof T]
    : never;

export type DeepOmitByPath<
  T,
  Path extends [keyof any, ...any[]]
> = Path extends [infer Key, ...infer Rest]
  ? Key extends keyof T
    ? Rest extends [keyof any, ...any[]]
      ? { [K in keyof T]: K extends Key ? DeepOmitByPath<T[K], Rest> : T[K] }
      : Omit<T, Key>
    : T
  : T;

interface ConditionDefaultCaseStepFactory<
  C,
  G extends Record<string, any> = {},
  L extends Record<any, any> = Record<
    "true",
    Record<"condition", Exclude<C, Fallacy>> &
      Record<typeof resultKey, Exclude<C, Fallacy>>
  > &
    Record<
      "false",
      Record<"condition", Exclude<C, Truthy>> &
        Record<typeof resultKey, Exclude<C, Truthy>>
    >,
  K extends string = "",
  E extends string = ""
> extends AbstractStepFactory<G, L>,
    Action<"condition", Promise<ExtractValuesByKey<L, typeof resultKey>>> {
  isTrue(): Omit<
    ConditionDefaultCaseStepFactory<
      C,
      Omit<G, "condition"> & Record<"condition", Exclude<C, Fallacy>>,
      L,
      "true",
      E | "isTrue"
    >,
    E | "isTrue"
  >;

  isFalse(): Omit<
    ConditionDefaultCaseStepFactory<
      C,
      Omit<G, "condition"> & Record<"condition", Exclude<C, Truthy>>,
      L,
      "false",
      E | "isFalse"
    >,
    E | "isFalse"
  >;

  add<T extends Action<any, any>, N extends string>(
    name: DisableSameName<N, L>,
    options: StepConfig,
    fn: ($: FormatScope<G>) => Promise<T> | T
  ): Omit<
    ConditionDefaultCaseStepFactory<
      C,
      Overwrite<G, N> & Record<N, Awaited<ReturnType<T["run"]>>>,
      DeepOmitByPath<L, [K, typeof resultKey]> &
        Record<K, Record<N, T>> &
        Record<K, Record<typeof resultKey, T>>,
      K,
      E
    >,
    E
  >;
  add<T extends Action<any, any>, N extends string>(
    name: DisableSameName<N, L>,
    fn: ($: FormatScope<G>) => Promise<T> | T
  ): Omit<
    ConditionDefaultCaseStepFactory<
      C,
      Overwrite<G, N> & Record<N, Awaited<ReturnType<T["run"]>>>,
      DeepOmitByPath<L, [K, typeof resultKey]> &
        Record<K, Record<N, T>> &
        Record<K, Record<typeof resultKey, T>>,
      K,
      E
    >,
    E
  >;

  add<T, N extends string>(
    name: DisableSameName<N, L>,
    options: StepConfig,
    fn: ($: FormatScope<G>) => Promise<T> | T
  ): Omit<
    ConditionDefaultCaseStepFactory<
      C,
      Overwrite<G, N> & Record<N, Awaited<T>>,
      DeepOmitByPath<L, [K, typeof resultKey]> &
        Record<K, Record<N, T>> &
        Record<K, Record<typeof resultKey, T>>,
      K,
      E
    >,
    E
  >;

  add<T, N extends string>(
    name: DisableSameName<N, L>,
    fn: ($: FormatScope<G>) => Promise<T> | T
  ): Omit<
    ConditionDefaultCaseStepFactory<
      C,
      Overwrite<G, N> & Record<N, Awaited<T>>,
      DeepOmitByPath<L, [K, typeof resultKey]> &
        Record<K, Record<N, T>> &
        Record<K, Record<typeof resultKey, T>>,
      K,
      E
    >,
    E
  >;

  get<N extends keyof L>(
    name: N,
    scope?: Record<any, any>
  ): StepFactory<G, L[N]>;
}

// WIP
type Fallacy = false | "" | undefined | null;

// WIP
type Truthy = true | object | number;

type MainConditionStepFactory<C, G extends Record<string, any> = {}> = Omit<
  ConditionDefaultCaseStepFactory<C, G>,
  "add"
>;

export function $if<C, G extends Record<string, any> = {}>(
  { condition, $ }: { condition: C, $?: G },
) {
  return {} as MainConditionStepFactory<C, G>;
}

// const actions = {
//   trigger: (type: string, params: any) => {
//     return struct(params);
//   }
// };

// const steps = $steps()
//   .add("input", () => ({ name: "foo" }))

//   .add("list", () => [1, 2, 3])

//   .add("could have error", ($) => $.list)

//   .add("condition", ($) =>
//     $if({ condition: $.input.name === "foo", $ })
//       .isTrue()

//       .add("list", () => ["lorem", "ipsum", "dolor"])

//       .add("asdasd", ($) => $.list)

//       .isFalse()

//       .add("asda", ($) => true)
//   )

//   .add("asdasd2", ($) => $.condition)

//   .add("loop", ($) =>
//     $loop({ list: $.list, $ })
//       .forEachItem()

//       .add("send slack message", ($) =>
//         actions.trigger("takswish.slack.send_message", {
//           channel: "#general",
//           text: `#${$.item.value}`
//         })
//       )
//   );