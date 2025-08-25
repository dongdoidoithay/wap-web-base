import { NextRequest, NextResponse } from 'next/server';
import { refreshDomainConfigsCache } from '@/lib/domain-config';

export async function POST(_request: NextRequest) {
  try {
    await refreshDomainConfigsCache();
    return NextResponse.json({ success: true, refreshed: true });
  } catch (error) {
    console.error('Error refreshing domain configs cache:', error);
    return NextResponse.json({ success: false, error: 'Failed to refresh cache' }, { status: 500 });
  }
}
