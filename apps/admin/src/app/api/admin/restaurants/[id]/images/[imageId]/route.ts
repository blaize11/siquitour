import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id: restaurantId, imageId } = params;

    // Get auth token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to Laravel API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/restaurants/${restaurantId}/images/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Laravel API error:', error);
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: response.status }
      );
    }

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id: restaurantId, imageId } = params;
    const formData = await request.formData();

    // Get auth token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to Laravel API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/restaurants/${restaurantId}/images/${imageId}`,
      {
        method: 'PUT',
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
        { error: 'Failed to update image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Image update error:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}
