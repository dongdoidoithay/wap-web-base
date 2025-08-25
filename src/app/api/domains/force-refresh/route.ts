import { NextRequest, NextResponse } from 'next/server';
import { forceRefreshDomainConfigs } from '@/lib/domain-config';

export async function POST(_request: NextRequest) {
  try {
    // Force refresh cache và trả về config mới
    const newConfigs = await forceRefreshDomainConfigs();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache refreshed successfully',
      configs: newConfigs
    });
  } catch (error) {
    console.error('Error force refreshing domain configs cache:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to force refresh cache' 
    }, { status: 500 });
  }
}
