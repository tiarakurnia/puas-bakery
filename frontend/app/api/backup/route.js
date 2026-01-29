// API Route: Backup Import & Validate
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(req) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action') || 'import';

        const body = await req.json();

        const endpoint = action === 'validate' ? 'validate' : 'import';
        const res = await fetch(`${API_URL}/api/backup/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return Response.json(data, { status: res.status });
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
