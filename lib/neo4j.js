import neo4j from "neo4j-driver";

// A single driver instance is reused across requests (recommended by the
// Neo4j driver docs — it manages its own connection pool internally).
let driver;

function getDriver() {
  if (driver) return driver;

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !user || !password) {
    throw new ConfigError(
      "Missing CognoDB connection details. Set COGNODB_URI, COGNODB_USER and COGNODB_PASSWORD in .env.local."
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
  });

  return driver;
}

export class ConfigError extends Error {}
export class DatabaseUnavailableError extends Error {}

/**
 * Runs a Cypher query with parameters and returns plain JS records.
 * Wraps connection failures in a DatabaseUnavailableError so API routes
 * can turn them into a friendly, non-crashing response.
 */
export async function runQuery(cypher, params = {}) {
  const session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } catch (err) {
    if (
      err.code === "ServiceUnavailable" ||
      err.code === "Neo.ClientError.Security.Unauthorized" ||
      err.name === "Neo4jError"
    ) {
      throw new DatabaseUnavailableError(
        "Could not reach the graph database. It may be paused, unreachable, or the credentials may be wrong."
      );
    }
    throw err;
  } finally {
    await session.close();
  }
}

/** Converts a Neo4j Integer (used for counts, degrees, etc.) to a plain number. */
export function toNumber(value) {
  return neo4j.isInt(value) ? value.toNumber() : value;
}

/** Flattens a Neo4j node into a plain object of its properties. */
export function nodeProps(node) {
  if (!node) return null;
  const props = { ...node.properties };
  for (const key of Object.keys(props)) {
    if (neo4j.isInt(props[key])) props[key] = toNumber(props[key]);
  }
  return props;
}
