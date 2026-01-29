// API Route: New Customers
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req) {
    try {
        const res = await fetch(`${API_URL}/api/dashboard/new-customers`);
        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
