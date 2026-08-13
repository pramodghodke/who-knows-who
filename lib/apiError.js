import { NextResponse } from "next/server";
import { ConfigError, DatabaseUnavailableError } from "./neo4j";

export function handleApiError(err) {
  if (err instanceof ConfigError) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  if (err instanceof DatabaseUnavailableError) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
  console.error(err);
  return NextResponse.json(
    { error: "Unexpected server error." },
    { status: 500 }
  );
}
