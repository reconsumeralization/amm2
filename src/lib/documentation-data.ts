import { DocumentationCategory, DocumentationArticle } from "./types";

// Helper function to create article IDs
const createArticleId = (categorySlug: string, articleSlug: string) => `${categorySlug}-${articleSlug}`;

// Getting Started Category
const gettingStartedArticles: DocumentationArticle[] = [
  {
    id: createArticleId("getting-started", "introduction"),
    title: "Introduction",
    slug: "introduction",
    content: `
# Introduction to EDB Postgres AI

Welcome to EDB Postgres AI, the next-generation database platform that combines the power of PostgreSQL with advanced artificial intelligence capabilities. This documentation will help you get started with our platform and explore its features.

## What is EDB Postgres AI?

EDB Postgres AI is a comprehensive database platform that extends PostgreSQL with AI-powered features for query optimization, data insights, anomaly detection, and more. It's designed to help developers, data scientists, and database administrators work more efficiently with their data.

## Key Features

- **AI-Powered Query Optimization**: Automatically optimize your SQL queries for better performance.
- **Natural Language to SQL**: Convert natural language questions into SQL queries.
- **Anomaly Detection**: Identify unusual patterns in your data.
- **Predictive Scaling**: Automatically scale your database resources based on predicted usage patterns.
- **Intelligent Indexing**: Get recommendations for indexes based on your query patterns.
- **Data Insights**: Discover hidden patterns and relationships in your data.

## Who is EDB Postgres AI for?

- **Developers** who want to build applications with advanced database capabilities.
- **Data Scientists** who need to analyze and visualize data efficiently.
- **Database Administrators** who want to optimize database performance and reduce maintenance overhead.
- **Business Analysts** who need to extract insights from data without writing complex SQL queries.

## Getting Started

To get started with EDB Postgres AI, follow these steps:

1. [Create an account](/documentation/getting-started/quick-start)
2. [Set up your first database](/documentation/getting-started/installation)
3. [Connect to your database](/documentation/database/connect)
4. [Explore AI features](/documentation/ai/overview)

## Next Steps

- Learn about our [database management features](/documentation/database/create)
- Explore our [SQL capabilities](/documentation/sql/basics)
- Discover our [AI features](/documentation/ai/overview)
- Check out our [API reference](/documentation/api/authentication)
    `,
    excerpt: "Learn about EDB Postgres AI and its key features",
    author: "EDB Team",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-03-20"),
    tags: ["introduction", "overview", "getting started"]
  },
  {
    id: createArticleId("getting-started", "quick-start"),
    title: "Quick Start Guide",
    slug: "quick-start",
    content: `
# Quick Start Guide

This guide will help you get up and running with EDB Postgres AI in just a few minutes.

## Prerequisites

Before you begin, make sure you have:

- An EDB Postgres AI account
- Basic knowledge of SQL and databases
- A modern web browser

## Step 1: Create Your First Database

1. Log in to your EDB Postgres AI dashboard
2. Click on the "Create Database" button
3. Enter a name for your database
4. Select a region close to your users
5. Choose a database size (you can scale up or down later)
6. Click "Create"

Your database will be provisioned in a few seconds.

## Step 2: Connect to Your Database

### Connection String

You'll find your connection string in the database details page. It will look something like this:

\`\`\`
postgresql://username:password@hostname:port/database
\`\`\`

### Using the Web Interface

The easiest way to get started is to use our built-in SQL editor:

1. Navigate to your database in the dashboard
2. Click on "SQL Editor"
3. You can now write and execute SQL queries directly in your browser

### Using a Client

You can also connect using any PostgreSQL client:

- [psql](https://www.postgresql.org/docs/current/app-psql.html)
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)
- Any other PostgreSQL-compatible client

## Step 3: Create Your First Table

Let's create a simple table to store user data:

\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Step 4: Insert Some Data

Now let's add some data to our table:

\`\`\`sql
INSERT INTO users (name, email) VALUES
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Bob Johnson', 'bob@example.com');
\`\`\`

## Step 5: Query Your Data

Let's retrieve the data we just inserted:

\`\`\`sql
SELECT * FROM users;
\`\`\`

## Step 6: Try AI Features

Now let's try one of our AI features. Ask a question in natural language:

1. Go to the "AI Assistant" tab
2. Type a question like "Show me all users who signed up today"
3. The AI will generate and execute the appropriate SQL query

## Next Steps

Congratulations! You've created your first database, table, and used our AI features. Here are some next steps:

- [Learn more about database management](/documentation/database/create)
- [Explore advanced SQL features](/documentation/sql/advanced)
- [Discover more AI capabilities](/documentation/ai/query-generation)
- [Set up authentication](/documentation/security/authentication)

If you have any questions, check out our [FAQ](/faq) or [contact our support team](/support).
    `,
    excerpt: "Get up and running with EDB Postgres AI in minutes",
    author: "EDB Team",
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-03-25"),
    tags: ["quick start", "tutorial", "getting started"]
  },
  {
    id: createArticleId("getting-started", "installation"),
    title: "Installation",
    slug: "installation",
    content: `
# Installation Guide

This guide covers different ways to install and set up EDB Postgres AI for your projects.

## Cloud Deployment (Recommended)

The easiest way to get started with EDB Postgres AI is to use our cloud service:

1. [Sign up](https://edb-postgres-ai.com/signup) for an account
2. Create a new project
3. Create a database
4. Start using your database immediately

No installation required!

## Self-Hosted Installation

For users who need to run EDB Postgres AI in their own infrastructure, we offer several deployment options.

### Docker Installation

Our Docker image contains everything you need to run EDB Postgres AI:

\`\`\`bash
# Pull the latest image
docker pull edb/postgres-ai:latest

# Run the container
docker run -d \\
  --name postgres-ai \\
  -p 5432:5432 \\
  -p 8080:8080 \\
  -e POSTGRES_PASSWORD=your_password \\
  edb/postgres-ai:latest
\`\`\`

### Kubernetes Installation

We provide Helm charts for Kubernetes deployment:

\`\`\`bash
# Add the EDB Helm repository
helm repo add edb https://charts.edb.com

# Update your repositories
helm repo update

# Install EDB Postgres AI
helm install postgres-ai edb/postgres-ai \\
  --set postgresPassword=your_password \\
  --set persistence.size=10Gi
\`\`\`

### Manual Installation

For manual installation on Linux:

1. Add our repository:

\`\`\`bash
# For Ubuntu/Debian
curl -s https://repo.edb.com/key.asc | sudo apt-key add -
echo "deb https://repo.edb.com/apt stable main" | sudo tee /etc/apt/sources.list.d/edb.list
sudo apt update

# For RHEL/CentOS
sudo rpm -Uvh https://repo.edb.com/edb-repo-latest.noarch.rpm
\`\`\`

2. Install the packages:

\`\`\`bash
# For Ubuntu/Debian
sudo apt install edb-postgres-ai

# For RHEL/CentOS
sudo yum install edb-postgres-ai
\`\`\`

3. Initialize the database:

\`\`\`bash
sudo edb-postgres-ai-setup
\`\`\`

## Client Libraries

We provide client libraries for various programming languages:

### Python

\`\`\`bash
pip install edb-postgres-ai
\`\`\`

### Node.js

\`\`\`bash
npm install edb-postgres-ai
\`\`\`

### Java

\`\`\`xml
<dependency>
  <groupId>com.edb</groupId>
  <artifactId>postgres-ai-client</artifactId>
  <version>1.0.0</version>
</dependency>
\`\`\`

### Go

\`\`\`bash
go get github.com/edb/postgres-ai-go
\`\`\`

## Next Steps

After installation:

1. [Configure your database](/documentation/getting-started/configuration)
2. [Connect to your database](/documentation/database/connect)
3. [Set up authentication](/documentation/security/authentication)
4. [Explore AI features](/documentation/ai/overview)

If you encounter any issues during installation, please check our [troubleshooting guide](/documentation/getting-started/troubleshooting) or [contact our support team](/support).
    `,
    excerpt: "Learn how to install and set up EDB Postgres AI",
    author: "EDB Team",
    createdAt: new Date("2023-01-25"),
    updatedAt: new Date("2023-04-10"),
    tags: ["installation", "setup", "deployment"]
  },
  {
    id: createArticleId("getting-started", "configuration"),
    title: "Configuration",
    slug: "configuration",
    content: `
# Configuration Guide

This guide covers the configuration options for EDB Postgres AI.

## Basic Configuration

### Environment Variables

EDB Postgres AI can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| \`POSTGRES_HOST\` | Database host | localhost |
| \`POSTGRES_PORT\` | Database port | 5432 |
| \`POSTGRES_USER\` | Database user | postgres |
| \`POSTGRES_PASSWORD\` | Database password | - |
| \`POSTGRES_DB\` | Database name | postgres |
| \`AI_API_KEY\` | API key for AI services | - |
| \`LOG_LEVEL\` | Logging level | info |

### Configuration File

You can also use a configuration file. Create a file named \`config.yaml\`:

\`\`\`yaml
database:
  host: localhost
  port: 5432
  user: postgres
  password: your_password
  name: postgres

ai:
  api_key: your_api_key
  models:
    - name: gpt-4
      enabled: true
    - name: text-embedding-ada-002
      enabled: true

logging:
  level: info
  format: json
\`\`\`

Then specify the configuration file when starting the service:

\`\`\`bash
edb-postgres-ai --config /path/to/config.yaml
\`\`\`

## Advanced Configuration

### Connection Pooling

Configure connection pooling to improve performance:

\`\`\`yaml
database:
  # ... basic config ...
  pool:
    max_connections: 20
    min_connections: 5
    idle_timeout: 10000  # milliseconds
\`\`\`

### Memory Settings

Optimize memory usage:

\`\`\`yaml
memory:
  cache_size: 1024  # MB
  query_memory_limit: 512  # MB
\`\`\`

### AI Model Configuration

Configure AI models:

\`\`\`yaml
ai:
  api_key: your_api_key
  models:
    - name: gpt-4
      enabled: true
      temperature: 0.7
      max_tokens: 2048
    - name: text-embedding-ada-002
      enabled: true
      dimensions: 1536
  cache:
    enabled: true
    ttl: 3600  # seconds
\`\`\`

### Security Settings

Configure security options:

\`\`\`yaml
security:
  ssl:
    enabled: true
    cert_file: /path/to/cert.pem
    key_file: /path/to/key.pem
  authentication:
    jwt:
      secret: your_jwt_secret
      expiration: 86400  # seconds
\`\`\`

## Environment-Specific Configurations

### Development

\`\`\`yaml
environment: development
logging:
  level: debug
database:
  # ... database config ...
\`\`\`

### Production

\`\`\`yaml
environment: production
logging:
  level: warn
  format: json
database:
  # ... database config ...
security:
  ssl:
    enabled: true
  # ... security config ...
\`\`\`

## Monitoring Configuration

Configure monitoring:

\`\`\`yaml
monitoring:
  prometheus:
    enabled: true
    port: 9090
  health_check:
    enabled: true
    port: 8080
    path: /health
\`\`\`

## Next Steps

After configuring your EDB Postgres AI instance:

1. [Connect to your database](/documentation/database/connect)
2. [Set up authentication](/documentation/security/authentication)
3. [Explore AI features](/documentation/ai/overview)

If you need help with configuration, check our [troubleshooting guide](/documentation/getting-started/troubleshooting) or [contact our support team](/support).
    `,
    excerpt: "Configure EDB Postgres AI for optimal performance",
    author: "EDB Team",
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-04-15"),
    tags: ["configuration", "setup", "optimization"]
  }
];

// Database Management Category
const databarticles: DocumentationArticle[] = [
  {
    id: createArticleId("database", "create"),
    title: "Creating Databases",
    slug: "create",
    content: `
# Creating Databases

This guide explains how to create and manage databases in EDB Postgres AI.

## Creating a Database via the Dashboard

The easiest way to create a database is through our web dashboard:

1. Log in to your EDB Postgres AI dashboard
2. Click on "Databases" in the sidebar
3. Click the "Create Database" button
4. Fill in the required information:
   - Database name
   - Region
   - Size (can be changed later)
   - Optional: Enable high availability
5. Click "Create"

Your database will be provisioned in a few seconds.

## Creating a Database via the CLI

You can also create databases using our command-line interface:

\`\`\`bash
# Install the CLI if you haven't already
npm install -g edb-postgres-ai-cli

# Log in to your account
edb login

# Create a database
edb database create my-database --region us-east-1 --size small
\`\`\`

## Creating a Database via the API

You can create databases programmatically using our REST API:

\`\`\`bash
curl -X POST https://api.edb-postgres-ai.com/v1/databases \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-database",
    "region": "us-east-1",
    "size": "small",
    "high_availability": false
  }'
\`\`\`

## Database Sizing Options

When creating a database, you can choose from several size options:

| Size | CPU | Memory | Storage | Price |
|------|-----|--------|---------|-------|
| Micro | 1 vCPU | 1 GB | 10 GB | $5/month |
| Small | 2 vCPU | 2 GB | 20 GB | $15/month |
| Medium | 4 vCPU | 8 GB | 50 GB | $50/month |
| Large | 8 vCPU | 16 GB | 100 GB | $100/month |
| XLarge | 16 vCPU | 32 GB | 200 GB | $200/month |

You can change the size of your database at any time.

## High Availability Options

For production workloads, we recommend enabling high availability:

- **Standard**: Single instance, no automatic failover
- **High Availability**: Primary and standby instances with automatic failover
- **Multi-Region**: Replicas in multiple regions for global distribution

## Database Settings

When creating a database, you can configure these additional settings:

### PostgreSQL Version

Choose the PostgreSQL version for your database:

- PostgreSQL 16 (recommended)
- PostgreSQL 15
- PostgreSQL 14
- PostgreSQL 13

### Extensions

Enable PostgreSQL extensions:

- PostGIS for geospatial data
- TimescaleDB for time-series data
- pgvector for vector operations
- pg_stat_statements for query analysis
- And many more

### Backup Settings

Configure automated backups:

- Backup frequency (hourly, daily, weekly)
- Backup retention period (1-35 days)
- Point-in-time recovery

## Next Steps

After creating your database:

1. [Connect to your database](/documentation/database/connect)
2. [Create tables](/documentation/sql/basics)
3. [Set up authentication](/documentation/security/authentication)
4. [Configure backups](/documentation/database/backup)

If you need help creating a database, [contact our support team](/support).
    `,
    excerpt: "Learn how to create and configure databases",
    author: "EDB Team",
    createdAt: new Date("2023-02-05"),
    updatedAt: new Date("2023-04-20"),
    tags: ["database", "creation", "configuration"]
  },
  {
    id: createArticleId("database", "connect"),
    title: "Connection Management",
    slug: "connect",
    content: `
# Connection Management

This guide explains how to connect to your EDB Postgres AI databases.

## Connection Methods

There are several ways to connect to your database:

1. Web-based SQL Editor
2. Command-line interface (CLI)
3. Database clients (pgAdmin, DBeaver, etc.)
4. Application code using database drivers

## Connection String Format

The standard PostgreSQL connection string format is:

\`\`\`
postgresql://username:password@hostname:port/database
\`\`\`

You can find your connection string in the database details page of the dashboard.

## Web-based SQL Editor

The easiest way to query your database is using our built-in SQL Editor:

1. Log in to your EDB Postgres AI dashboard
2. Navigate to your database
3. Click on "SQL Editor"
4. Start writing and executing queries

Our SQL Editor includes features like:
- Syntax highlighting
- Auto-completion
- Query history
- Result visualization
- Query optimization suggestions

## Command-line Interface

You can use our CLI to connect to your database:

\`\`\`bash
# Install the CLI
npm install -g edb-postgres-ai-cli

# Log in to your account
edb login

# Connect to your database
edb database connect my-database
\`\`\`

You can also use the standard PostgreSQL CLI tool, psql:

\`\`\`bash
psql postgresql://username:password@hostname:port/database
\`\`\`

## Database Clients

You can connect using any PostgreSQL-compatible client:

### pgAdmin

1. Open pgAdmin
2. Right-click on "Servers" and select "Create" > "Server..."
3. Enter a name for the connection
4. In the "Connection" tab, enter:
   - Host: Your database hostname
   - Port: 5432 (or your custom port)
   - Maintenance database: Your database name
   - Username: Your username
   - Password: Your password
5. Click "Save"

### DBeaver

1. Open DBeaver
2. Click "New Database Connection"
3. Select "PostgreSQL"
4. Enter your connection details
5. Click "Test Connection" to verify
6. Click "Finish"

## Connecting from Application Code

### Node.js

Using the \`pg\` package:

\`\`\`javascript
const { Pool } = require('pg')

const pool = new Pool({
  user: 'username',
  host: 'hostname',
  database: 'database',
  password: 'password',
  port: 5432,
})

async function query() {
  const result = await pool.query('SELECT NOW()')
  console.log(result.rows[0])
}

query()
\`\`\`

### Python

Using the \`psycopg2\` package:

\`\`\`python
import psycopg2

conn = psycopg2.connect(
    host="hostname",
    database="database",
    user="username",
    password="password"
)

cur = conn.cursor()
cur.execute("SELECT NOW()")
result = cur.fetchone()
print(result)

cur.close()
conn.close()
\`\`\`

### Java

Using JDBC:

\`\`\`java
import java.sql.*;

public class PostgreSQLExample {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://hostname:5432/database";
        String user = "username";
        String password = "password";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT NOW()")) {
            
            if (rs.next()) {
                System.out.println(rs.getString(1));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
\`\`\`

## Connection Pooling

For production applications, we recommend using connection pooling:

### Node.js

\`\`\`javascript
const { Pool } = require('pg')

const pool = new Pool({
  user: 'username',
  host: 'hostname',
  database: 'database',
  password: 'password',
  port: 5432,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000
})
\`\`\`

### Python

\`\`\`python
from psycopg2.pool import SimpleConnectionPool

pool = SimpleConnectionPool(
    1, 20,  # min, max connections
    host="hostname",
    database="database",
    user="username",
    password="password"
)

conn = pool.getconn()
# Use the connection
pool.putconn(conn)  # Return the connection to the pool
\`\`\`

## Troubleshooting Connections

If you're having trouble connecting:

1. Check your firewall settings
2. Verify your IP is allowed in the database's access control list
3. Confirm your username and password
4. Check if the database is running
5. Verify SSL requirements

## Next Steps

After connecting to your database:

1. [Create tables](/documentation/sql/basics)
2. [Import data](/documentation/database/import-export)
3. [Set up authentication](/documentation/security/authentication)
4. [Explore AI features](/documentation/ai/overview)

If you need help connecting to your database, [contact our support team](/support).
    `,
    excerpt: "Learn how to connect to your databases using various methods",
    author: "EDB Team",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-04-25"),
    tags: ["connection", "database", "psql"]
  },
  {
    id: createArticleId("database", "backup"),
    title: "Backup & Recovery",
    slug: "backup",
    content: `
# Backup & Recovery

This guide explains how to back up and restore your EDB Postgres AI databases.

## Automated Backups

EDB Postgres AI automatically creates backups of your databases:

- **Daily backups**: Retained for 7 days
- **Weekly backups**: Retained for 4 weeks
- **Monthly backups**: Retained for 6 months

These backups are stored in multiple regions for redundancy.

## Backup Types

We offer several types of backups:

### Full Backups

A complete copy of your database at a specific point in time.

### Incremental Backups

Only changes since the last backup are stored, reducing storage requirements.

### Continuous Archiving (WAL)

Write-Ahead Log (WAL) files are continuously archived, enabling point-in-time recovery.

## Configuring Backup Settings

You can customize your backup settings in the dashboard:

1. Navigate to your database
2. Click on "Settings"
3. Select the "Backup" tab
4. Configure your backup settings:
   - Backup frequency
   - Retention period
   - Storage location
   - Encryption options

## Manual Backups

You can create manual backups at any time:

### Via Dashboard

1. Navigate to your database
2. Click on "Backups"
3. Click "Create Backup"
4. Enter a description (optional)
5. Click "Create"

### Via CLI

\`\`\`bash
edb database backup create my-database --description "Pre-deployment backup"
\`\`\`

### Via API

\`\`\`bash
curl -X POST https://api.edb-postgres-ai.com/v1/databases/my-database/backups \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "description": "Pre-deployment backup"
  }'
\`\`\`

## Restoring from Backup

You can restore your database from any backup:

### Via Dashboard

1. Navigate to your database
2. Click on "Backups"
3. Find the backup you want to restore
4. Click "Restore"
5. Confirm the restoration

### Via CLI

\`\`\`bash
edb database restore my-database --backup-id backup_id
\`\`\`

### Via API

\`\`\`bash
curl -X POST https://api.edb-postgres-ai.com/v1/databases/my-database/restore \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "backup_id": "backup_id"
  }'
\`\`\`

## Point-in-Time Recovery (PITR)

PITR allows you to restore your database to any point in time within your retention period:

### Via Dashboard

1. Navigate to your database
2. Click on "Backups"
3. Click "Point-in-Time Recovery"
4. Select the date and time
5. Click "Restore"

### Via CLI

\`\`\`bash
edb database restore my-database --pitr "2023-04-25T14:30:00Z"
\`\`\`
    `,
    excerpt: "Learn how to back up and restore your databases",
    author: "EDB Team",
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-04-30"),
    tags: ["backup", "recovery", "disaster recovery"]
  }
];

// Create documentation categories
export const documentationCategories: DocumentationCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    slug: "getting-started",
    description: "Learn the basics of EDB Postgres AI and get up and running quickly",
    articles: gettingStartedArticles
  },
  {
    id: "database",
    title: "Database Management",
    slug: "database",
    description: "Learn how to create, manage, and optimize your databases",
    articles: databarticles
  }
]; 