import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const formData = await request.formData();

    // Get auth token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to Laravel API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/restaurants/${restaurantId}/images`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Laravel API error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
