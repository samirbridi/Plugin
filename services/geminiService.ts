import { GoogleGenAI } from "@google/genai";
import { TimerConfig } from "../types";

const generateFFGLCode = async (config: TimerConfig): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Convert Hex colors to Float (0.0 - 1.0) for OpenGL
  const hexToGl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return `{ ${r.toFixed(2)}f, ${g.toFixed(2)}f, ${b.toFixed(2)}f, 1.0f }`;
  };

  const prompt = `
  You are an expert C++ developer specializing in FFGL (FreeFrame GL) plugins for Resolume Arena.
  
  **GOAL:** Generate a robust, cross-platform (Windows & macOS) C++ source file for a Timer Plugin.
  
  **CONTEXT:** 
  The user is following the official Resolume FFGL SDK "Quickstart" guide. They will paste this code into a file inside an existing SDK project (replacing a sample plugin).
  
  **REQUIREMENTS:**
  1.  **Single File**: Provide the complete implementation (Class definition + Methods + DLL Exports) in one code block.
  2.  **SDK Compliance**: 
      - Include <FFGL.h> and <FFGLLib.h>.
      - Use the standard \`CFFGLPlugin\` base class.
      - Implement \`DllMain\` (Windows) and \`plugMain\`.
  3.  **Rendering (Vector)**: 
      - **DO NOT** use external font libraries (FreeType, etc.). 
      - Implement a private helper method \`DrawDigit(float x, float y, float size, char character)\` using \`glBegin(GL_LINES)\` to draw numbers 0-9 and letters A-Z (for the message). 
      - **DO NOT** draw any copyright/version footer text on the texture itself. The plugin name will handle the branding in the UI.
  4.  **Cross-Platform**:
      - Use standard OpenGL 2.1 syntax (compatible with Resolume).
      - If including Windows headers, wrap them in \`#ifdef _WIN32\`.
  
  **PLUGIN LOGIC:**
  - **Name**: "ProgressiveTimer"
  - **ID**: "MZN1"
  - **Function**: Count UP from 0 to ${config.limitSeconds}s.
  - **Parameters (Controls)**:
    - \`Play\` (Checkbox/Bool): Default ON. If OFF, pause timer.
    - \`Reset\` (Event/Trigger): If triggered, set time to 0.
  - **Visuals**:
    - Draw the time (MM:SS).
    - If Limit reached (${config.limitSeconds}s), draw message: "${config.finalMessage}".
  - **Colors**:
    - Default: ${hexToGl(config.colorDefault)}
    - < 30s remaining: ${hexToGl(config.color30s)}
    - < 15s remaining: ${hexToGl(config.color15s)}
    - < 10s remaining: ${hexToGl(config.color10s)}
    - < 5s remaining: ${hexToGl(config.color5s)}
  
  **OUTPUT FORMAT:**
  Return ONLY the raw C++ code string. No markdown formatting blocks around it, or minimal markdown.

  \`\`\`cpp
  #include <FFGL.h>
  #include <FFGLLib.h>
  
  #ifdef _WIN32
  #include <windows.h>
  #endif
  
  #include <stdio.h>
  #include <math.h>
  #include <string>

  // Define ID
  #define MIZIN_PLUGIN_ID "MZN1"

  class ProgressiveTimer : public CFFGLPlugin {
  public:
     ProgressiveTimer();
     // ... overrides ...
  private:
     // ... helpers ...
     void DrawChar(float x, float y, float size, char c);
     void DrawString(float x, float y, float size, const char* str);
     
     // Param constants
     // #define FFPARAM_PLAY  0
     // #define FFPARAM_RESET 1
  };
  
  // ... Implementation ...
  \`\`\`
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