import { z } from "zod"
import { $useCase } from "./daunus_use_case"
import { Expect, Equal } from "./type_helpers"
import { $input, DaunusException, exit } from "."

describe("$usecase", () => {
  it("should work without input", async () => {
    const useCase = $useCase("Hello world").handle(
      ({ $ }) => $.useCase.originalName
    )

    const { data } = await useCase.run()

    type A = typeof data

    type data = Expect<Equal<A, "Hello world">>

    expect(data).toEqual("Hello world")
  })

  it("should work for single step", async () => {
    const input = $input({ name: z.string() })

    const useCase = $useCase("name")
      .withInput(input)

      .handle(({ $ }) => $.input.name === "lorem")

    const { data } = await useCase.run({ name: "lorem" })

    type A = typeof data

    type data = Expect<Equal<A, boolean>>

    expect(data).toEqual(true)
  })

  it("should provide expected types for return", async () => {
    const input = $input({ name: z.string() })

    const route = $useCase("My use case")
      .withInput(input)

      .steps()

      .add("first step", ({ $ }) => $.input)

      .add("second step", ({ $ }) => $.firstStep.name)

    const { data } = await route.run({ name: "Luna" })

    type A = typeof data

    type data = Expect<Equal<A, string>>

    expect(data).toEqual("Luna")
  })

  it("should work with parallel steps", async () => {
    const input = $input({ city: z.string() })

    const route = $useCase("Example")
      .withInput(input)

      .steps({ stepsType: "parallel" })

      .add("first step", ({ $ }) => $.input)

      .add("second step", () => 42)

    const { data } = await route.run({ city: "London" })

    type A = typeof data

    type data = Expect<
      Equal<
        A,
        {
          firstStep: {
            city: string
          }
          secondStep: number
        }
      >
    >

    expect(data).toEqual({
      firstStep: {
        city: "London"
      },
      secondStep: 42
    })
  })

  it("should work with loop and condition", async () => {
    const input = $input({ array: z.array(z.number()) })

    const useCase = $useCase("Loop and condition")
      .withInput(input)

      .handle(({ $loop, $ }) =>
        $loop({ list: $.input.array })
          .forEachItem()

          .add("module", ({ $ }) => $.item.value % 2)

          .add("check", ({ $if, $ }) =>
            $if({ condition: $.module === 0 })
              .isTrue()
              .add("even", ({ $ }) => `${$.item.value} is even`)

              .isFalse()
              .add("odd", ({ $ }) => $.item.value)
          )
      )

    const { data } = await useCase.run({ array: [1, 2, 3] })

    type A = typeof data

    type data = Expect<Equal<A, (string | number)[]>>

    expect(data).toEqual([1, "2 is even", 3])
  })

  xit("should return error inside loop ", async () => {
    const input = $input({ array: z.array(z.number()) })

    const useCase = $useCase("Loop with error")
      .withInput(input)

      .handle(({ $loop, $ }) =>
        $loop({ list: $.input.array })
          .forEachItem()

          .add("exit", () => exit({ status: 500 }))
      )

    const { exception } = await useCase.run({ array: [1, 2, 3] })

    type A = typeof exception

    type exception = Expect<
      Equal<A, DaunusException<500, undefined, undefined>>
    >

    expect(exception).toEqual(new DaunusException({ status: 500 }))
  })

  xit("should return error inside condition", async () => {
    const input = $input({ array: z.array(z.number()) })

    const useCase = $useCase("condition with error")
      .withInput(input)
      
      .handle(({ $if, $ }) =>
        $if({ condition: $.input.array.length > 1 }) //
          .add("exit", () => exit({ status: 500 }))
      )

    const { exception } = await useCase.run({ array: [1, 2, 3] })

    type A = typeof exception

    type exception = Expect<
      Equal<A, DaunusException<500, undefined, undefined>>
    >

    expect(exception).toEqual(new DaunusException({ status: 500 }))
  })

  it("should allow script version", async () => {
    const input = $input({ names: z.array(z.number()) })

    const useCase = $useCase("Script")
      .withInput(input)
      
      .handle(({ $ }) =>
        $.input.names.map((item) => (item % 2 === 0 ? `${item} is even` : item))
      )

    const { data } = await useCase.run({ names: [1, 2, 3] })

    type A = typeof data

    type data = Expect<Equal<A, (string | number)[]>>

    expect(data).toEqual([1, "2 is even", 3])
  })
})
