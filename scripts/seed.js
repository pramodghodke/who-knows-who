/**
 * Loads seed data into CognoDB.
 *
 * Usage:
 *   npm run seed
 *
 * Reads COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD from .env.local.
 * Safe to re-run: it wipes existing Person/Interest nodes first.
 */
require("dotenv").config({ path: ".env.local" });
const neo4j = require("neo4j-driver");
const { people, edges, INTERESTS } = require("./data");

async function main() {
  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !user || !password) {
    console.error(
      "Missing COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD.\n" +
        "Copy .env.example to .env.local and fill in your CognoDB connection details first."
    );
    process.exit(1);
  }

  console.log(`Connecting to ${uri} ...`);
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    await driver.verifyConnectivity();
    console.log("Connected. Clearing existing data...");

    await session.run("MATCH (n) DETACH DELETE n");

    console.log("Creating uniqueness constraints...");
    await session.run(
      "CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT interest_name IF NOT EXISTS FOR (i:Interest) REQUIRE i.name IS UNIQUE"
    );

    console.log(`Loading ${people.length} Person nodes...`);
    await session.run(
      `
      UNWIND $people AS person
      CREATE (p:Person {
        id: person.id,
        name: person.name,
        location: person.location,
        bio: person.bio,
        avatarSeed: person.avatarSeed
      })
      `,
      { people }
    );

    console.log(`Loading ${INTERESTS.length} Interest nodes...`);
    await session.run(
      `
      UNWIND $interests AS name
      CREATE (:Interest {name: name})
      `,
      { interests: INTERESTS }
    );

    console.log("Linking people to their interests...");
    const interestRows = people.flatMap((p) =>
      p.interests.map((interest) => ({ personId: p.id, interest }))
    );
    await session.run(
      `
      UNWIND $rows AS row
      MATCH (p:Person {id: row.personId})
      MATCH (i:Interest {name: row.interest})
      CREATE (p)-[:INTERESTED_IN]->(i)
      `,
      { rows: interestRows }
    );

    console.log(`Creating ${edges.length} KNOWS relationships...`);
    const edgeRows = edges.map(([a, b]) => ({ a, b }));
    await session.run(
      `
      UNWIND $rows AS row
      MATCH (a:Person {id: row.a})
      MATCH (b:Person {id: row.b})
      CREATE (a)-[:KNOWS]->(b)
      CREATE (b)-[:KNOWS]->(a)
      `,
      { rows: edgeRows }
    );

    console.log("Done. Seed summary:");
    const counts = await session.run(`
      MATCH (p:Person) WITH count(p) AS people
      MATCH (:Person)-[k:KNOWS]->() WITH people, count(k) AS knows
      MATCH (i:Interest) WITH people, knows, count(i) AS interests
      RETURN people, knows, interests
    `);
    const row = counts.records[0];
    console.log(`  Person nodes: ${row.get("people")}`);
    console.log(`  KNOWS relationships (directed): ${row.get("knows")}`);
    console.log(`  Interest nodes: ${row.get("interests")}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
