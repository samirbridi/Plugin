import { TimerConfig } from "./types";

export const AVAILABLE_FONTS = [
  "Arial",
  "Arial Black",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Impact",
  "Times New Roman",
  "Didot",
  "Georgia",
  "American Typewriter",
  "Andale Mono",
  "Courier",
  "Lucida Console",
  "Monaco",
  "Bradley Hand",
  "Brush Script MT",
  "Luminari",
  "Comic Sans MS",
  "Segoe UI",
  "Roboto",
  "Helvetica",
  "Open Sans"
];

export const DEFAULT_CONFIG: TimerConfig = {
  limitEnabled: true,
  limitSeconds: 300, // 5 minutes default
  fontFamily: "Arial",
  fontSize: 120,
  finalMessage: "TIME UP",
  finalMessageBlink: true,
  colorDefault: "#ffffff",
  color30s: "#00ff00", // Green
  color15s: "#0000ff", // Blue
  color10s: "#ffff00", // Yellow
  color5s: "#ff0000",  // Red
};