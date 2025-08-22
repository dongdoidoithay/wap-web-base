import { NextRequest, NextResponse } from 'next/server';
import { getAllDomains, getDomainConfig } from '../../../lib/domain-config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get('hostname');
  
  if (hostname) {
    const config = getDomainConfig(hostname);
    return NextResponse.json(config);
  }
  
  const domains = getAllDomains();
  return NextResponse.json({ domains });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostname, config } = body;
    
    // Here you would typically save to database
    // For now, we'll just return the config
    const domainConfig = getDomainConfig(hostname);
    
    return NextResponse.json({
      success: true,
      config: domainConfig,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 