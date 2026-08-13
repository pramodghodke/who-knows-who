require("dotenv").config({ path: ".env.local" });
const neo4j = require("neo4j-driver");

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function stage(label, cypher, params) {
  const session = driver.session();
  try {
    console.log(`\n--- ${label} ---`);
    console.log(cypher.trim());
    const result = await session.run(cypher, params);
    console.log(`Rows returned: ${result.records.length}`);
    result.records.slice(0, 5).forEach((r) => {
      console.log(r.toObject());
    });
  } catch (err) {
    console.log("ERROR:", err.message);
  } finally {
    await session.close();
  }
}

async function main() {
  const id = "p16"; // Nadia

  await stage(
    "1. Direct friends (should be 6)",
    `MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person) RETURN mutual.name`,
    { id }
  );

  await stage(
    "2. Raw 2-hop, no filtering at all",
    `MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person)-[:KNOWS]->(candidate:Person)
     RETURN DISTINCT candidate.name`,
    { id }
  );

  await stage(
    "3. 2-hop + exclude self only",
    `MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person)-[:KNOWS]->(candidate:Person)
     WHERE candidate <> me
     RETURN DISTINCT candidate.name`,
    { id }
  );

  await stage(
    "4. 2-hop + exclude self + exclude existing friends (full WHERE)",
    `MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person)-[:KNOWS]->(candidate:Person)
     WHERE candidate <> me AND NOT (me)-[:KNOWS]->(candidate)
     RETURN DISTINCT candidate.name`,
    { id }
  );

  await stage(
    "5. Full query with WITH + aggregation",
    `MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person)-[:KNOWS]->(candidate:Person)
     WHERE candidate <> me AND NOT (me)-[:KNOWS]->(candidate)
     WITH me, candidate, collect(DISTINCT mutual) AS mutualFriends, count(DISTINCT mutual) AS mutualCount
     RETURN candidate.name, mutualCount`,
    { id }
  );

  await driver.close();
}

main();