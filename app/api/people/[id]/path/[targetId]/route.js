import { NextResponse } from "next/server";
import { runQuery, nodeProps, toNumber } from "@/lib/neo4j";
import { handleApiError } from "@/lib/apiError";

// GET /api/people/:id/path/:targetId
//
// "How are we connected?" — a variable-length shortest path between two
// people, capped at 6 hops. This is the query that's genuinely awkward
// in a relational schema: you'd need a recursive CTE with manual cycle
// detection and no idea in advance how many self-joins deep to go.
// In Cypher it's one line: shortestPath() with a bounded variable-length
// relationship pattern.
const PATH_QUERY = `
  MATCH (a:Person {id: $id}), (b:Person {id: $targetId})
  MATCH path = shortestPath((a)-[:KNOWS*..6]-(b))
  RETURN [n IN nodes(path) | n] AS pathNodes, length(path) AS degrees
`;

export async function GET(_req, { params }) {
  try {
    if (params.id === params.targetId) {
      return NextResponse.json({ error: "Pick two different people." }, { status: 400 });
    }

    const records = await runQuery(PATH_QUERY, {
      id: params.id,
      targetId: params.targetId,
    });

    if (records.length === 0) {
      return NextResponse.json({ path: null, degrees: null, connected: false });
    }

    const record = records[0];
    const path = record.get("pathNodes").map(nodeProps);
    const degrees = toNumber(record.get("degrees"));

    return NextResponse.json({ path, degrees, connected: true });
  } catch (err) {
    return handleApiError(err);
  }
}
