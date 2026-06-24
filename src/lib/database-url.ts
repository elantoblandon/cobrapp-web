export function getPgConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to connect to PostgreSQL.");
  }

  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");

  return url.toString();
}
