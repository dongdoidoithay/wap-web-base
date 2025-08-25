import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - trong thực tế sẽ query database
    const mangaList = [
      {
        id: 1,
        title: 'Epic Adventure Manga',
        author: 'Author A',
        genre: 'Action, Adventure, Fantasy',
        status: 'Ongoing',
        chapters: 200,
        cover: '/images/manga-cover.jpg',
        description: 'An epic adventure story with amazing artwork...',
        language: 'en',
      },
      {
        id: 2,
        title: 'Cyberpunk Warriors',
        author: 'Author B',
        genre: 'Sci-Fi, Action, Cyberpunk',
        status: 'Completed',
        chapters: 150,
        cover: '/images/cyberpunk-cover.jpg',
        description: 'A cyberpunk story about warriors in a dystopian future...',
        language: 'en',
      },
    ];

    return NextResponse.json({
      success: true,
      data: mangaList,
      total: mangaList.length,
      language: 'en',
      api: '/api/manga-en/manga',
    });
  } catch (error) {
    console.error('Error fetching English manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga list' },
      { status: 500 }
    );
  }
}
