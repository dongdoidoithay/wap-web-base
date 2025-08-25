import { headers } from 'next/headers';
import { getDomainConfigSync } from '../lib/domain-config';

interface ServerThemeProviderProps {
  children: React.ReactNode;
}

export async function ServerThemeProvider({ children }: ServerThemeProviderProps) {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfigSync(hostname);

  // Tạo CSS variables cho theme
  const themeStyles = `
    :root {
      /* Primary colors */
      --primary: ${config.theme.primaryColor};
      --primary-dark: ${config.theme.secondaryColor};
      --primary-light: ${config.theme.accentColor};
      --secondary: ${config.theme.secondaryColor};
      --accent: ${config.theme.accentColor};
      
      /* Background colors */
      --background: ${config.theme.backgroundColor};
      --surface: ${config.theme.surfaceColor};
      
      /* Text colors */
      --text-primary: ${config.theme.textPrimary};
      --text-secondary: ${config.theme.textSecondary};
      --text-muted: ${config.theme.textMuted};
      
      /* State colors */
      --success: ${config.theme.successColor};
      --warning: ${config.theme.warningColor};
      --error: ${config.theme.errorColor};
      --info: ${config.theme.infoColor};
      
      /* Interactive colors */
      --link: ${config.theme.linkColor};
      --link-hover: ${config.theme.linkHoverColor};
      --button: ${config.theme.buttonColor};
      --button-text: ${config.theme.buttonTextColor};
      
      /* Border colors */
      --border: ${config.theme.borderColor};
      --border-light: ${config.theme.borderLightColor};
      
      /* Focus colors */
      --focus: ${config.theme.focusColor};
      
      /* Gradient colors */
      --gradient-from: ${config.theme.gradientFrom || config.theme.primaryColor};
      --gradient-to: ${config.theme.gradientTo || config.theme.secondaryColor};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      {children}
    </>
  );
}
