
export enum CalculatorType {
  Welcome = 'welcome',
  UnitConverter = 'unitConverter',
  NumberBase = 'numberBase',
  BitwiseCalculator = 'bitwiseCalculator',
  JSON = 'json',
  HashGenerator = 'hashGenerator',
  PaletteGenerator = 'paletteGenerator',
  UUIDGenerator = 'uuidGenerator',
  UnixTimestamp = 'unixTimestamp',
  NetworkTools = 'networkTools',
  AiAssistant = 'aiAssistant',
  BMI = 'bmi',
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  tool: string;
  details: string;
  input: string;
  output: string;
}

export type Language = 'es' | 'en';

// Definición para el evento de instalación PWA (No estándar en TS dom lib)
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
