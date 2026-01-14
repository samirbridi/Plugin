export interface TimerConfig {
  limitEnabled: boolean;
  limitSeconds: number; // Total limit in seconds
  fontFamily: string;
  fontSize: number;
  finalMessage: string;
  finalMessageBlink: boolean;
  
  // Colors (Hex strings)
  colorDefault: string;
  color30s: string;
  color15s: string;
  color10s: string;
  color5s: string;
}

export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export interface GeneratedCodeResponse {
  cppCode: string;
  headerCode: string;
}