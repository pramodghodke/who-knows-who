import { NextResponse } from "next/server";
import { runQuery, nodeProps, toNumber } from "@/lib/neo4j";
import { handleApiError } from "@/lib/apiError";

// GET /api/people/:id/recommendations
//
// The core "people you may know" query. It's a 2-hop traversal:
// me -> mutual friend -> candidate, excluding people I already know
// and myself, ranked by how many mutual friends connect us and
// how many interests we share. This is the kind of query a relational
// database handles through multiple self-joins that get slower and
// uglier with every extra hop — here it's one readable pattern.
const RECOMMENDATION_QUERY = `
  MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person)-[:KNOWS]->(candidate:Person)
  WHERE candidate <> me
    AND NOT (me)-[:KNOWS]->(candidate)
  WITH me, candidate,
       collect(DISTINCT mutual) AS mutualFriends,
       count(DISTINCT mutual) AS mutualCount
  OPTIONAL MATCH (me)-[:INTERESTED_IN]->(sharedInterest:Interest)<-[:INTERESTED_IN]-(candidate)
  WITH candidate, mutualFriends, mutualCount,
       collect(DISTINCT sharedInterest.name) AS sharedInterests
  RETURN candidate, mutualFriends, mutualCount, sharedInterests
  ORDER BY mutualCount DESC, size(sharedInterests) DESC, candidate.name ASC
  LIMIT 12
`;

export async function GET(_req, { params }) {
  try {
    const records = await runQuery(RECOMMENDATION_QUERY, { id: params.id });

    const recommendations = records.map((r) => ({
      person: nodeProps(r.get("candidate")),
      mutualCount: toNumber(r.get("mutualCount")),
      mutualFriends: r.get("mutualFriends").map(nodeProps),
      sharedInterests: r.get("sharedInterests"),
    }));

    return NextResponse.json({ recommendations });
  } catch (err) {
    return handleApiError(err);
  }
}
