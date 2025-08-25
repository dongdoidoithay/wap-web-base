import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - trong thực tế sẽ query database
    const mangaList = [
      {
        id: 1,
        title: 'Truyện Ma Kinh Điển',
        author: 'Tác giả A',
        genre: 'Kinh dị, Phiêu lưu',
        status: 'Đang tiến hành',
        chapters: 150,
        cover: '/images/truyen-cover.jpg',
        description: 'Một câu chuyện kinh dị đầy hấp dẫn...',
        language: 'vi',
      },
      {
        id: 2,
        title: 'Võ Đế Trở Về',
        author: 'Tác giả B',
        genre: 'Tiên hiệp, Võ hiệp',
        status: 'Hoàn thành',
        chapters: 200,
        cover: '/images/vo-de-cover.jpg',
        description: 'Câu chuyện về một võ đế trở về...',
        language: 'vi',
      },
    ];

    return NextResponse.json({
      success: true,
      data: mangaList,
      total: mangaList.length,
      language: 'vi',
      api: '/api/manga-vn/manga',
    });
  } catch (error) {
    console.error('Error fetching Vietnamese manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga list' },
      { status: 500 }
    );
  }
}
