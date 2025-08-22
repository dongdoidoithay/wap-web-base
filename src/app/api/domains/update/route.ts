import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, config } = body;
    
    if (!domain || !config) {
      return NextResponse.json(
        { error: 'Domain and config are required' },
        { status: 400 }
      );
    }
    
    // Đọc file cấu hình hiện tại
    const configPath = path.join(process.cwd(), 'public', 'domains-config.json');
    const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    
    // Cập nhật cấu hình
    currentConfig[domain] = config;
    
    // Ghi lại vào file
    await fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2));
    
    return NextResponse.json({
      success: true,
      message: `Domain ${domain} updated successfully`
    });
    
  } catch (error) {
    console.error('Error updating domain config:', error);
    return NextResponse.json(
      { error: 'Failed to update domain config' },
      { status: 500 }
    );
  }
}
