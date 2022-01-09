import babel, { types as t } from "@babel/core"

const FATAL_JSX_NAMESPACING = "XML-style JSX namespacing is not supported"

function jsxAttributesToObjectExpression(types: typeof t, attrs: Array<t.JSXAttribute | t.JSXSpreadAttribute>) {
  if (!Array.isArray(attrs)) {
    return undefined
  }

  const properties = []

  for (const attr of attrs) {
    if (attr.type === "JSXSpreadAttribute") {
      const spreadIdent = attr.argument
      properties.push(types.spreadElement(spreadIdent))
      continue
    }

    if (attr.name.type === "JSXNamespacedName") {
      throw new Error(FATAL_JSX_NAMESPACING)
    }

    let value: t.Expression | undefined

    if (attr.value) {
      if (attr.value.type === "StringLiteral") {
        value = attr.value
      } else if (attr.value.type === "JSXExpressionContainer" && attr.value.expression.type !== "JSXEmptyExpression") {
        // Did not find that JSXEmptyExpression is possible with the babel parser
        value = attr.value.expression
      }
    } else {
      value = types.booleanLiteral(true)
    }

    if (!value) {
      continue
    }

    properties.push(types.objectProperty(types.identifier(attr.name.name), value))
  }

  return types.objectExpression(properties)
}

function convertJsxMemberExpression(types: typeof t, expression: t.JSXMemberExpression): t.MemberExpression {
  let firstMember: t.MemberExpression | t.Identifier | undefined

  if (expression.object.type === "JSXMemberExpression") {
    firstMember = convertJsxMemberExpression(types, expression.object)
  } else if (expression.object.type === "JSXIdentifier") {
    firstMember = types.identifier(expression.object.name)
  }

  if (!firstMember) {
    throw new Error("unknown expression object type")
  }

  return types.memberExpression(firstMember, types.identifier(expression.property.name))
}

function jsxElementNameToIdentifier(
  types: typeof t,
  element: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
): t.Identifier | t.MemberExpression {
  if (element.type === "JSXMemberExpression") {
    return convertJsxMemberExpression(types, element)
  }

  if (element.type === "JSXNamespacedName") {
    throw new Error(FATAL_JSX_NAMESPACING)
  }

  return types.identifier(element.name)
}

export default function moonbeamBabelPlugin({ types }: typeof babel): babel.PluginObj {
  return {
    name: "@moonbeam/babel-plugin",
    visitor: {
      JSXElement(path) {
        const { openingElement } = path.node

        const moonbeamArgs = [
          jsxElementNameToIdentifier(types, openingElement.name),
          jsxAttributesToObjectExpression(types, openingElement.attributes),
        ]

        const moonbeamCall = types.callExpression(types.identifier("moonbeam"), moonbeamArgs as any)

        const childElements = path.node.children.filter((child) => child.type === "JSXElement" || child.type === 'JSXExpressionContainer')
          .map((child) => {
            if (child.type === 'JSXExpressionContainer') {
              return child.expression
            }

            return child
          })

        if (childElements.length > 0) {
          moonbeamCall.arguments = moonbeamCall.arguments.concat(types.arrayExpression(childElements as any))
        }

        path.replaceWith(moonbeamCall)
      },
    },
  }
}
