import { GoogleGenAI } from "@google/genai";
import { TimerConfig } from "../types";

const generateFFGLCode = async (config: TimerConfig): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
  You are an expert C++ developer specializing in FFGL (FreeFrame GL) plugins for Resolume Arena.
  
  I need you to generate the 'processOpenGL' and 'GetParameter'/'SetParameter' implementation logic for a Timer Plugin in C++.
  
  The plugin Name/ID in the code should reference "PROGRESSIVE TIMER by Mizin".
  
  Configuration to bake into the code defaults (but keep them adjustable via FFGL parameters):
  - Progressive Timer (Counts Up).
  - Limit Enabled by default: ${config.limitEnabled}
  - Limit Duration: ${config.limitSeconds} seconds.
  - Final Message: "${config.finalMessage}"
  - Font: ${config.fontFamily} (Assume using a texture atlas or system font rendering helper).
  - Colors: 
    - Default: ${config.colorDefault}
    - 30s Remaining: ${config.color30s}
    - 15s Remaining: ${config.color15s}
    - 10s Remaining: ${config.color10s}
    - 5s Remaining: ${config.color5s}
  
  **IMPORTANT REQUIREMENT:**
  In the OpenGL rendering logic (ProcessOpenGL), you MUST draw a small footer bar at the bottom of the frame.
  - Background: Semi-transparent black strip across the bottom (width 100%, height ~20px).
  - Text Right Aligned: "v1.0 by Mizin" in a small font size.
  - Text Left Aligned: "PROGRESSIVE TIMER".
  This acts as a signature/watermark for the plugin.
  
  Please provide a COMPLETE, single-file C++ class implementation (header and source combined or clearly separated) that implements 'CFFGLPlugin'. 
  Focus on the logic for:
  1. Calculating time based on delta time.
  2. Switching colors based on 'Limit - CurrentTime'.
  3. Blinking logic if the limit is reached (Blink: ${config.finalMessageBlink}).
  4. Rendering the footer bar and text.
  
  Add comments explaining how to compile this as a DLL using Visual Studio.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "// Error generating code.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "// Error connecting to AI Service. Please check API Key.";
  }
};

export { generateFFGLCode };