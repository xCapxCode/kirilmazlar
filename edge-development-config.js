/**
 * EDGE-FIRST DEVELOPMENT CONFIGURATION
 * VSCode Simple Browser yerine Edge kullanım rehberi
 */

const developmentConfig = {
  // Cross-browser sync sorunu çözümü: Tek browser kullan!
  primaryBrowser: 'Edge',
  reason: 'localStorage isolation - Browser security feature',

  // VSCode ayarları - Edge'e yönlendirme
  vscodeSettings: {
    "liveServer.settings.CustomBrowser": "msedge",
    "open-in-browser.default": "msedge"
  },

  // Development workflow
  workflow: [
    "1. npm run dev → localhost:5500",
    "2. Edge'de aç: http://localhost:5500",
    "3. VSCode Simple Browser'ı KULLANMA",
    "4. Tüm test ve development Edge'de yap",
    "5. Satıcı panel, müşteri panel tümü Edge'de"
  ],

  // Neden bu çözüm?
  technicalReason: {
    problem: "localStorage cross-browser isolation by design",
    solution: "Single browser environment (Edge)",
    benefit: "Consistent data, no sync issues, real production simulation"
  }
};

// VSCode launcher script - Edge'e yönlendirme
export function launchInEdge() {
  const url = 'http://localhost:5500';

  // Windows Edge launcher
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  } else {
    console.log(`🚀 Edge'de aç: ${url}`);
  }
}

export default developmentConfig;
