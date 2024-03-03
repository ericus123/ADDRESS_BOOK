## Address Book API with NestJS and GraphQL

[![CI/CD](https://github.com/ericus123/ADDRESS_BOOK/actions/workflows/main.yml/badge.svg)](https://github.com/ericus123/ADDRESS_BOOK/actions/workflows/main.yml)

This is a NestJS application with GraphQL API built for managing an Address Book.

### Features

- User registration, login, and logout functionalities
- CRUD operations for contacts (Create, Read, Update, Delete)
- Merging duplicate contacts
- Managing contact information (phone numbers, emails, etc.)

### Technologies

- NestJS: Node.js framework for building efficient and scalable server-side applications.
- TypeScript: Superset of JavaScript for developing typed and maintainable code.
- GraphQL: API query language for efficient data fetching.
- Sequelize: Object-Relational Mapper (ORM) for interacting with PostgreSQL database.


### Database ERD

[ERD Diagram](/src/ERD.png)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ericus123/ADDRESS_BOOK/
```

2. Install dependencies:

```bash
yarn install
```

### Configuration

1. Create a `.env` file in the project root directory.
2. Add environment variables for database connection details, JWT secret, and other configurations based on the provided sample `env.example` file.

### Usage

1. Start the development server:

```bash
yarn start:dev
```
### Usage

2. Start the production server:
```bash
yarn build
```
and

```bash
yarn start:prod
```

3. Access the GraphQL playground at `http://localhost:yourport/altair`.

4. Use the provided example queries and mutations in the `/src/graphql` directory to interact with the API.

### Authentication and Authorization

All requests to the Address Book API are protected by authentication. To access authorized endpoints, clients must include both access and refresh tokens in the request headers.

- The refresh token should be included as `x-refresh-token` in the request headers with the value obtained from the sign-in process.
- The access token should be included as `Authorization` with the value `Bearer ${accessToken}`.

Example of headers:

```plaintext

x-refresh-token: "refreshToken value from sign-in"
Authorization: Bearer ${accessToken value} 

```

### Contact Listing and Authentication

Basic contact listing functionality and authentication features (signin, signup, signout) are available at [bookui.amanieric.com](http://bookui.amanieric.com). For other features, such as CRUD operations and merging duplicates, please use the GraphQL playground.


### Deployment

1. Build the production-ready application:

```bash
yarn build
```

2. Deploy the application to a server of your choice

3. Configure environment variables for the deployed environment.

### API Reference

The API documentation is available in the GraphQL playground at `http://localhost:yourport/altair`. 

You can explore the available queries and mutations, their arguments, and expected responses.