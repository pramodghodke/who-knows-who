import { NextResponse } from "next/server";
import { runQuery, nodeProps } from "@/lib/neo4j";
import { handleApiError } from "@/lib/apiError";

export async function GET(_req, { params }) {
  try {
    const { id } = params;

    const friendRows = await runQuery(
      `MATCH (me:Person {id: $id})-[:KNOWS]->(friend:Person) RETURN friend.id AS friendId`,
      { id }
    );
    const friendIds = new Set(friendRows.map((r) => r.get("friendId")));

    const myInterestRows = await runQuery(
      `MATCH (me:Person {id: $id})-[:INTERESTED_IN]->(i:Interest) RETURN i.name AS name`,
      { id }
    );
    const myInterests = new Set(myInterestRows.map((r) => r.get("name")));

    const pairRows = await runQuery(
      `MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person)-[:KNOWS]->(candidate:Person)
       WHERE candidate <> me
       RETURN candidate, mutual`,
      { id }
    );

    const byCandidate = new Map();
    for (const row of pairRows) {
      const candidate = nodeProps(row.get("candidate"));
      if (friendIds.has(candidate.id)) continue;

      if (!byCandidate.has(candidate.id)) {
        byCandidate.set(candidate.id, { person: candidate, mutualFriends: new Map() });
      }
      const mutual = nodeProps(row.get("mutual"));
      byCandidate.get(candidate.id).mutualFriends.set(mutual.id, mutual);
    }

    const candidateIds = [...byCandidate.keys()];
    let interestRows = [];
    if (candidateIds.length > 0) {
      interestRows = await runQuery(
        `MATCH (p:Person)-[:INTERESTED_IN]->(i:Interest)
         WHERE p.id IN $ids
         RETURN p.id AS personId, i.name AS interest`,
        { ids: candidateIds }
      );
    }
    const interestsByCandidate = new Map();
    for (const row of interestRows) {
      const pid = row.get("personId");
      if (!interestsByCandidate.has(pid)) interestsByCandidate.set(pid, new Set());
      interestsByCandidate.get(pid).add(row.get("interest"));
    }

//     const RECOMMENDATION_QUERY = `
//   MATCH (me:Person {id: $id})-[:KNOWS]->(mutual:Person)-[:KNOWS]->(candidate:Person)
//   WHERE candidate <> me
//   WITH me, candidate, collect(DISTINCT mutual) AS mutualFriends, count(DISTINCT mutual) AS mutualCount
//   OPTIONAL MATCH (me)-[existing:KNOWS]->(candidate)
//   WITH me, candidate, mutualFriends, mutualCount, existing
//   WHERE existing IS NULL
//   OPTIONAL MATCH (me)-[:INTERESTED_IN]->(sharedInterest:Interest)<-[:INTERESTED_IN]-(candidate)
//   WITH candidate, mutualFriends, mutualCount, collect(DISTINCT sharedInterest.name) AS sharedInterests
//   RETURN candidate, mutualFriends, mutualCount, sharedInterests
//   ORDER BY mutualCount DESC, size(sharedInterests) DESC, candidate.name ASC
//   LIMIT 12
// `;

    const recommendations = [...byCandidate.values()]
      .map(({ person, mutualFriends }) => {
        const candidateInterests = interestsByCandidate.get(person.id) || new Set();
        const sharedInterests = [...candidateInterests].filter((i) => myInterests.has(i));
        return {
          person,
          mutualCount: mutualFriends.size,
          mutualFriends: [...mutualFriends.values()],
          sharedInterests,
        };
      })
      .sort((a, b) => {
        if (b.mutualCount !== a.mutualCount) return b.mutualCount - a.mutualCount;
        if (b.sharedInterests.length !== a.sharedInterests.length)
          return b.sharedInterests.length - a.sharedInterests.length;
        return a.person.name.localeCompare(b.person.name);
      })
      .slice(0, 12);

    return NextResponse.json({ recommendations });
  } catch (err) {
    return handleApiError(err);
  }
}