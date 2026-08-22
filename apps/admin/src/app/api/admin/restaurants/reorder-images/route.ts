import { NextRequest, NextResponse } from 'next/server';

interface ImageOrder {
  id: number;
  sort_order: number;
}

export async function PUT(request: NextRequest) {
  try {
    const { images } = (await request.json()) as { images: ImageOrder[] };

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Get auth token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to Laravel API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/restaurants/reorder-images`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Laravel API error:', error);
      return NextResponse.json(
        { error: 'Failed to reorder images' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Image reorder error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder images' },
      { status: 500 }
    );
  }
}
