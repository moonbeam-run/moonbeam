import * as babel from "@babel/core"

import plugin from "./index"

function render(code: string) {
  const result = babel.transformSync(code, {
    plugins: ["@babel/plugin-syntax-jsx", plugin],
  })

  if (result === null) {
    throw new Error("expected transformed code")
  }

  return result.code
}

describe("plugin", () => {
  it("renders a single element with no props or children", () => {
    expect(
      render(`
        export default (
          <Domain />
        )
      `),
    ).toMatchInlineSnapshot(`"export default moonbeam(Domain, {});"`)
  })

  it("renders a single element with a string literal attribute", () => {
    expect(
      render(`
        export default (
          <Domain name="test" />
        )
      `),
    ).toMatchInlineSnapshot(`
      "export default moonbeam(Domain, {
        name: \\"test\\"
      });"
    `)
  })

  it("renders a single element with an expression member attribute", () => {
    expect(
      render(`
        const name = "test"
        export default (
          <Domain name={name} />
        )
      `),
    ).toMatchInlineSnapshot(`
      "const name = \\"test\\";
      export default moonbeam(Domain, {
        name: name
      });"
    `)
  })

  it("renders a single element with boolean true for attributes without a value", () => {
    expect(
      render(`
        export default (
          <Domain has_something />
        )
      `),
    ).toMatchInlineSnapshot(`
      "export default moonbeam(Domain, {
        has_something: true
      });"
    `)
  })

  it("renders a single element with a spread attribute", () => {
    expect(
      render(`
        const props = { name: "test" }
        export default (
          <Domain {...name} />
        )
      `),
    ).toMatchInlineSnapshot(`
      "const props = {
        name: \\"test\\"
      };
      export default moonbeam(Domain, { ...name
      });"
    `)
  })

  it("renders a single element with no attributes and a single child", () => {
    expect(
      render(`
        export default (
          <Domain>
            <Model />
          </Domain>
        )
      `),
    ).toMatchInlineSnapshot(`"export default moonbeam(Domain, {}, [moonbeam(Model, {})]);"`)
  })

  it("renders a single element where the name is a single member expression", () => {
    expect(
      render(`
        export default (
          <moonbeam.Domain name="test" /> 
        )
      `),
    ).toMatchInlineSnapshot(`
      "export default moonbeam(moonbeam.Domain, {
        name: \\"test\\"
      });"
    `)
  })

  it("renders a single element where the name is many member expressions", () => {
    expect(
      render(`
        export default (
          <global.moonbeam.Domain name="test" />
        )
      `),
    ).toMatchInlineSnapshot(`
      "export default moonbeam(global.moonbeam.Domain, {
        name: \\"test\\"
      });"
    `)
  })

  it("renders many elements with attributes and children", () => {
    expect(
      render(`
      export default (
        <Domain name="test">
          <Model name="model1">
            <Field name="f1" />
          </Model>
        </Domain>
      )
    `),
    ).toMatchInlineSnapshot(`
      "export default moonbeam(Domain, {
        name: \\"test\\"
      }, [moonbeam(Model, {
        name: \\"model1\\"
      }, [moonbeam(Field, {
        name: \\"f1\\"
      })])]);"
    `)
  })

  it('renders lower-cased JSX identifiers as regular identifiers', () => {
    expect(
      render(`
        export default (
          <domain name="test" />
        )
      `)
    ).toMatchInlineSnapshot(`
      "export default moonbeam(domain, {
        name: \\"test\\"
      });"
    `)
  })

  it("renders an element that has JSXExpressionContainer children", () => {
    expect(
      render(`
      const posts = (
        <Model name="posts">
          <Field name="title" type="string" />
        </Model>
      )
      
      const comments = (
        <Model name="comments">
          <Field name="content" type="text" />
        </Model>
      )
      
      export default (
        <Domain name="blog">
          {posts}
          {comments}
        </Domain>
      )
    `),
    ).toMatchInlineSnapshot(`
      "const posts = moonbeam(Model, {
        name: \\"posts\\"
      }, [moonbeam(Field, {
        name: \\"title\\",
        type: \\"string\\"
      })]);
      const comments = moonbeam(Model, {
        name: \\"comments\\"
      }, [moonbeam(Field, {
        name: \\"content\\",
        type: \\"text\\"
      })]);
      export default moonbeam(Domain, {
        name: \\"blog\\"
      }, [posts, comments]);"
    `)
  })

  it('throws an error if JSX namespaced identifiers are used', () => {
    expect(() => render(`
      export default (
        <xml:test name="test" />
      )
    `)).toThrowErrorMatchingInlineSnapshot(`"unknown: XML-style JSX namespacing is not supported"`)

    expect(() => render(`
      export default (
        <Model xml:name="test" />
      )
    `)).toThrowErrorMatchingInlineSnapshot(`"unknown: XML-style JSX namespacing is not supported"`)
  })
})
