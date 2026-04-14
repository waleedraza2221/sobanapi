import { NextRequest, NextResponse } from "next/server";

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY!;

// GET /api/test-dataset?id=gd_xxx — fetch dataset info from BrightData
export async function GET(req: NextRequest) {
  const datasetId = req.nextUrl.searchParams.get("id") ?? "gd_m8d03he47z8nwb5xc";

  try {
    const res = await fetch(`https://api.brightdata.com/datasets/v3/dataset/${datasetId}`, {
      headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` },
    });
    const text = await res.text();
    
    // Try parsing as JSON, otherwise return raw text
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ 
        status: res.status, 
        statusText: res.statusText,
        contentType: res.headers.get("content-type"),
        body: text.slice(0, 2000) 
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
