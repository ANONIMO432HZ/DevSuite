
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
  URLEncoder = 'urlEncoder',
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  tool: string;
  details: string;
  input: string;
  output: string;
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

export interface AuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  isDriveReady: boolean;
  login: () => void;
  logout: () => void;
  uploadFileToDrive: (content: string, filename: string, mimeType: string) => Promise<void>;
}
