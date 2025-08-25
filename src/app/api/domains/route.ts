import { NextRequest, NextResponse } from 'next/server';
import { getAllDomains, getDomainConfig, updateDomainConfig } from '@/lib/domain-config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get('hostname');
  
  if (hostname) {
    const config = await getDomainConfig(hostname);
    return NextResponse.json(config);
  }
  
  const domains = await getAllDomains();
  return NextResponse.json({ domains });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostname, config } = body;
    
    if (!hostname || !config) {
      return NextResponse.json(
        { error: 'Hostname and config are required' },
        { status: 400 }
      );
    }
    
    // Cập nhật cấu hình domain
    const success = await updateDomainConfig(hostname, config);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Domain config updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update domain config' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating domain config:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 