// API Route: Jam Operasional
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const validate = searchParams.get('validate');
        const tanggal = searchParams.get('tanggal');

        let url = `${API_URL}/api/jam-operasional`;
        if (validate && tanggal) {
            url += `/validate?tanggal=${tanggal}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
