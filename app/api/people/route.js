import { NextResponse } from "next/server";
import { runQuery, nodeProps } from "@/lib/neo4j";
import { handleApiError } from "@/lib/apiError";

// GET /api/people — the directory list used by the home page + search.
export async function GET() {
  try {
    const records = await runQuery(`MATCH (p:Person) RETURN p ORDER BY p.name`);
    const people = records.map((r) => nodeProps(r.get("p")));
    return NextResponse.json({ people });
  } catch (err) {
    return handleApiError(err);
  }
}
