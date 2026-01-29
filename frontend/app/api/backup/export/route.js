// API Route: Backup Export
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req) {
    try {
        const res = await fetch(`${API_URL}/api/backup/export`);
        const data = await res.json();

        // Return as JSON download
        return new Response(JSON.stringify(data, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename=backup-kasir-${Date.now()}.json`
            }
        });
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
