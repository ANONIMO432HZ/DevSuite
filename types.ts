
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
