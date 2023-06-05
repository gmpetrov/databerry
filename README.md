<h1 align="center" style="font-weight: bold">
  <br>
  <a href="https://griotai.kasetolabs.xyz"><img src="public/databerry-logo-icon.png" alt="WebTorrent" width="200"></a>
  <br>
  GriotAI
  <br>
    <h3 align="center">The no-code platform for building custom LLM Agents</h3>
  <br>
  
</h1>

<!-- <h4 align="center">The no-code platform for semantic search and retrieval of personal or organizational documents.</h4> -->

<h2 align="center">
<img src="public/og-image.png" alt="Databerry" width="1000" style="max-width: 100%;">
</h2>

**[GriotAI](https://griotai.kasetolabs.xyz)** provides a user-friendly solution to quickly setup a semantic search system over your personal data without any technical knowledge.

### [📄 Documentation](https://docs.kasetolabs.xyz/)

### Features

- Load data from anywhere
  - Raw text
  - Web page
  - Files
    - Word
    - Excel
    - Powerpoint
    - PDF
    - Markdown
    - Plain Text
    - Website
  - Notion (coming soon)
  - Airtable (coming soon)
- No-code: User-friendly interface to manage your datastores and chat with your data
- Secured API endpoint for querying your data
- Auto sync data sources (coming soon)
- **Auto generates a ChatGPT Plugin** for each datastore

### Semantic Search Specs

- Vector Datbase: Qdrant
- Embeddigs: Openai's text-embedding-ada-002
- Chunk size: 256 tokens

### Stack

- Next.js
- Joy UI
- LangchainJS
- PostgreSQL
- Prisma
- Qdrant

Inspired by the [ChatGPT Retrieval Plugin](https://github.com/openai/chatgpt-retrieval-plugin).

### Run the project locally

#### Without docker compose

Minimum requirements to run the projects locally

- Node.js v18
- Postgres Database
- Redis
- Qdrant
- GitHub App (NextAuth)
- Email Provider (NextAuth)
- OpenAI API Key
- AWS S3 Credentials

```bash
# Create .env.local
cp .env.example .env.local

# Install dependencies
pnpm install

# Generate DB tables
pnpm prisma:migrate:dev

# Run server
pnpm dev

# Run worker process
pnpm worker:datasource-loader

# or pnpm dev:all
```

#### With docker compose

First `cd .dev/griotai` then populate the config files `app.env` and `docker.env` as needed, then run the compose command:

```shell
pnpm docker:compose up

# create .dev/databerry/app.env
cp .dev/databerry/app.env.example .dev/databerry/app.env

# create s3 dev bucker
# go to http://localhost:9090 and create bucket databerry-dev
# set bucket access policy to public
# might need to add 127.0.0.1 minio to /etc/hosts in order to access public s3 files through http://minio...
```

You can fully rebuild dockers with :

```shell
pnpm docker:compose up --build

# Dev emails inbox (maildev)
# visit http://localhost:1080
```
