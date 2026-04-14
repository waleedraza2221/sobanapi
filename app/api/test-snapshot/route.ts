import { NextRequest, NextResponse } from "next/server";

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY!;
const BRIGHTDATA_BASE = "https://api.brightdata.com/datasets/v3";

// GET /api/test-snapshot?id=sd_xxx  — fetch a raw BrightData snapshot
export async function GET(req: NextRequest) {
  const snapshotId = req.nextUrl.searchParams.get("id");
  if (!snapshotId) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  try {
    // Check progress first
    const progressRes = await fetch(`${BRIGHTDATA_BASE}/progress/${snapshotId}`, {
      headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` },
    });
    const progress = await progressRes.json();

    if (progress.status !== "ready") {
      return NextResponse.json({ status: progress.status, progress });
    }

    // Fetch the snapshot
    const dataRes = await fetch(`${BRIGHTDATA_BASE}/snapshot/${snapshotId}?format=json`, {
      headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` },
    });
    const raw = await dataRes.json();
    const arr = Array.isArray(raw) ? raw : [];

    return NextResponse.json({
      status: "ready",
      count: arr.length,
      allKeys: arr.length > 0 ? Object.keys(arr[0]) : [],
      firstItem: arr[0] ?? null,
      secondItem: arr[1] ?? null,
      thirdItem: arr[2] ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
