> This project is in an early alpha status. Please submit issues with comments, feedback, or bugs and they will be addressed as soon as possible!

## moonbeam

Data modeling and APIs using JSX.

### Intro

Moonbeam aims to make development of web software easier, faster, and more beginner friendly, all while giving you the tools to build products that are still fast, reliable, and using modern best practices. Moonbeam can provide the core data components of your application, leaving you to focus on your product's differentiating factors.

While Moonbeam is excellent for new apps, POCs, and greenfield projects, the project aims to be a stable solution that can take your project well beyond its initial phase.

### Getting Started

There are detailed guides, references, and more on [moonbeam.run](https://moonbeam.run).

Moonbeam takes a JSX document as input and produces the necessary database schema, API server, and more to provide a backend implementation of the declared domain model.

### Domain Modeling

The basics of Moonbeam can be shown in an example document that outlines the data model for a simple blog:

```tsx
import moonbeam, { Domain, Model, Field, Relationship } from '@moonbeam/core'

// Models are wrapped in a Domain, a logical group of Models
export default (
  <Domain name="blog">
    <Model name="posts">
      <Field name="title" type="string" />
      <Field name="content" type="text" />
      <Field name="dateCreated" type="datetime" />
      <Field name="dateUpdated" type="datetime" />
      <Field name="author" type="string" />
      <Relationship has_many model="comments" />
    </Model>
    <Model name="comments">
      <Field name="content" type="text" />
      <Field name="author" type="string" />
      <Field name="dateCreated" type="datetime" />
      <Relationship belongs_to model="posts" />
    </Model>
  </Domain>
)
```

### What happens next?

Your schema is applied to an instance of Moonbeam server. The server determines which changes are required to either the underlying storage or the API routes, and the new version of the schema becomes available.

### Advantages of JSX

The parts that matter most about managing data are the business rules we apply to data types: processes such as validation, pre-save and post-save hooks (e.g. writing to an event stream), or customizing logic for querying the data. JSX provides a logical way to organize both the hierarchical structure of the schema as well as give you as the developer freedom to include your own code to manage your data.

## Contributing

TBD - basic docs on helping out

