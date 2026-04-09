// Auto-selected based on NEXT_PUBLIC_ENV at build time
const env = process.env.NEXT_PUBLIC_ENV;

const environments: Record<string, { production: boolean; url: string; backendurl: string; localurl: string }> = {
  production: {
    production: true,
    url: 'https://diy.sbisecurities.in/open-demat-account/',
    backendurl: 'https://diy.sbisecurities.in/',
    localurl: 'http://localhost:44360/',
  },
  uat: {
    production: true,
    url: 'https://udn.sbisecurities.in/diy/',
    backendurl: 'https://udn.sbisecurities.in/',
    localurl: 'http://localhost:44360/',
  },
  development: {
    production: false,
    url: 'https://udn.sbisecurities.in/diy/',
    backendurl: 'https://udn.sbisecurities.in/',
    localurl: 'http://localhost:44360/',
  },
};

export const environment = environments[env ?? 'development'];
