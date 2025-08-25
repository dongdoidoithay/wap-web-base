import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { refreshDomainConfigsCache } from '@/lib/domain-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain } = body;
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }
    
    // Đọc file cấu hình hiện tại
    const configPath = path.join(process.cwd(), 'public', 'domains-config.json');
    const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    
    // Kiểm tra domain có tồn tại không
    if (!currentConfig[domain]) {
      return NextResponse.json(
        { error: `Domain ${domain} does not exist` },
        { status: 404 }
      );
    }
    
    // Không cho phép xóa domain mặc định
    if (domain === 'example.com') {
      return NextResponse.json(
        { error: 'Cannot delete default domain' },
        { status: 400 }
      );
    }
    
    // Xóa domain
    delete currentConfig[domain];
    
    // Ghi lại vào file
    await fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2));
    
    // Xóa cache để force reload cấu hình mới
    await refreshDomainConfigsCache();
    
    return NextResponse.json({
      success: true,
      message: `Domain ${domain} deleted successfully`
    });
    
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    );
  }
}
