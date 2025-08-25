import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { refreshDomainConfigsCache } from '@/lib/domain-config';

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
    
    // Kiểm tra domain đã tồn tại chưa
    if (currentConfig[domain]) {
      return NextResponse.json(
        { error: `Domain ${domain} already exists` },
        { status: 400 }
      );
    }
    
    // Thêm domain mới
    currentConfig[domain] = config;
    
    // Ghi lại vào file
    await fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2));
    
    // Xóa cache để force reload cấu hình mới
    await refreshDomainConfigsCache();
    
    return NextResponse.json({
      success: true,
      message: `Domain ${domain} added successfully`
    });
    
  } catch (error) {
    console.error('Error adding domain:', error);
    return NextResponse.json(
      { error: 'Failed to add domain' },
      { status: 500 }
    );
  }
}
