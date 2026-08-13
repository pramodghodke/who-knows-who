import { NextResponse } from "next/server";
import { runQuery, nodeProps } from "@/lib/neo4j";
import { handleApiError } from "@/lib/apiError";

// GET /api/people/:id
// A single Cypher query, parameterized by $id, that gets the person,
// their direct KNOWS connections, and their interests in one round trip.
export async function GET(_req, { params }) {
  try {
    const records = await runQuery(
      `
      MATCH (p:Person {id: $id})
      OPTIONAL MATCH (p)-[:KNOWS]->(friend:Person)
      OPTIONAL MATCH (p)-[:INTERESTED_IN]->(interest:Interest)
      RETURN p,
             collect(DISTINCT friend) AS friends,
             collect(DISTINCT interest.name) AS interests
      `,
      { id: params.id }
    );

    if (records.length === 0 || !records[0].get("p")) {
      return NextResponse.json({ error: "Person not found." }, { status: 404 });
    }

    const record = records[0];
    const person = nodeProps(record.get("p"));
    const friends = record
      .get("friends")
      .filter(Boolean)
      .map(nodeProps)
      .sort((a, b) => a.name.localeCompare(b.name));
    const interests = record.get("interests").filter(Boolean);

    return NextResponse.json({ person, friends, interests });
  } catch (err) {
    return handleApiError(err);
  }
}
