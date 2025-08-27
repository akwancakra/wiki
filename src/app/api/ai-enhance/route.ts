import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize providers based on available API keys
const initializeProviders = () => {
  const providers = {
    ollama: {
      available: !!process.env.OLLAMA_API_KEY,
      endpoint: process.env.OLLAMA_API_ENDPOINT || "http://localhost:11434",
      model: process.env.OLLAMA_AI_MODEL || "llama3.2",
      apiKey: process.env.OLLAMA_API_KEY
    },
    gemini: {
      available: !!process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_AI_MODEL || "gemini-2.0-flash-exp",
      client: process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null
    }
  };

  return providers;
};

// Generate content using Ollama API
async function generateWithOllama(prompt: string, config: any) {
  try {
    const response = await fetch(`${config.endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          max_tokens: 4096
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.text || "";
  } catch (error) {
    console.error("Ollama API error:", error);
    throw error;
  }
}

// Generate content using Gemini API
async function generateWithGemini(prompt: string, config: any) {
  try {
    if (!config.client) {
      throw new Error("Gemini client not initialized");
    }
    
    const model = config.client.getGenerativeModel({ model: config.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const { content, type = "fix" } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const providers = initializeProviders();

    // Priority: Ollama first, then Gemini
    let selectedProvider = null;
    let providerName = "";

    if (providers.ollama.available) {
      selectedProvider = providers.ollama;
      providerName = "ollama";
      console.log(`Using Ollama with model: ${providers.ollama.model}`);
    } else if (providers.gemini.available) {
      selectedProvider = providers.gemini;
      providerName = "gemini";
      console.log(`Using Gemini with model: ${providers.gemini.model}`);
    } else {
      return NextResponse.json(
        { error: "No AI provider configured. Please set OLLAMA_API_KEY or GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    let prompt = "";
    
    switch (type) {
      case "fix":
        prompt = `
You are an expert AI assistant specializing in MDX and Markdown formatting. Your task is to fix and clean up the provided MDX content.

Fix the following issues if they exist:
1. Syntax errors in MDX/Markdown
2. Incorrect table formatting
3. Inconsistent heading hierarchy
4. Poor list formatting
5. Unclosed code blocks
6. Broken link formatting
7. Unclosed or incorrectly formatted JSX components
8. Invalid frontmatter
9. Inconsistent spacing and indentation
10. Broken bold/italic formatting

Available components:
- <Callout type="info|warning|error">content</Callout>
- <Tabs defaultValue="tab1"><TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList><TabsContent value="tab1">Content</TabsContent></Tabs>
- <Card title="Title">Content</Card>
- <Cards><Card>Content</Card></Cards>
- <Accordion><AccordionItem title="Title">Content</AccordionItem></Accordion>
- <Steps><Step>Content</Step></Steps>
- <Banner>Content</Banner>
- <PDFViewer src="/path/to/file.pdf" height="400px" />
- <VideoViewer src="/path/to/video.mp4" />

CRITICAL RULES:
- Do NOT change the original content or language
- ONLY fix formatting and syntax issues
- Preserve all existing information exactly
- Do NOT wrap the response in code blocks or markdown formatting
- Do NOT add \`\`\`mdx or any code block wrapper
- Return ONLY the raw MDX content without any wrapper
- If frontmatter exists, ensure valid YAML format
- If no issues exist, return the original content unchanged
- Maintain the original language (Indonesian/English) of the content

Content to fix:
${content}

Return ONLY the fixed MDX content without any explanation or code block wrapper.`;
        break;

      case "improve":
        prompt = `
You are an expert AI assistant specializing in content writing and MDX formatting. Your task is to improve the quality of the provided MDX content.

Enhance the content by:
1. Improving heading structure for better hierarchy
2. Adding clearer descriptions where needed
3. Optimizing the use of available MDX components
4. Improving table formatting for better information display
5. Adding callouts for important information
6. Organizing content with tabs when appropriate
7. Adding emphasis (bold/italic) in the right places
8. Improving flow and readability
9. Adding emoji for visual appeal (when appropriate)
10. Optimizing spacing and layout

Available components:
- <Callout type="info|warning|error">content</Callout>
- <Tabs defaultValue="tab1"><TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList><TabsContent value="tab1">Content</TabsContent></Tabs>
- <Card title="Title">Content</Card>
- <Cards><Card>Content</Card></Cards>
- <Accordion><AccordionItem title="Title">Content</AccordionItem></Accordion>
- <Steps><Step>Content</Step></Steps>
- <Banner>Content</Banner>

CRITICAL RULES:
- Preserve ALL original information, do not remove any content
- ONLY improve formatting and presentation
- Do NOT change the language of the content
- Do NOT wrap the response in code blocks or markdown formatting
- Do NOT add \`\`\`mdx or any code block wrapper
- Return ONLY the raw MDX content without any wrapper
- Use components that fit the context appropriately
- Preserve frontmatter if it exists
- Maintain the original language (Indonesian/English) of all text content

Content to improve:
${content}

Return ONLY the improved MDX content without any explanation or code block wrapper.`;
        break;

      case "format":
        prompt = `
You are an expert AI assistant specializing in MDX and Markdown formatting. Your task is to clean up the formatting of the provided MDX content without changing its content.

Clean up formatting by:
1. Consistent spacing between elements
2. Proper indentation for nested elements
3. Consistent use of bold/italic
4. Clean and aligned table formatting
5. Consistent heading hierarchy
6. Consistent list formatting
7. Proper code block formatting
8. Proper line breaks between sections
9. Consistent use of quotes
10. Clean frontmatter formatting

CRITICAL RULES:
- Do NOT change any content or information whatsoever
- ONLY clean up formatting and spacing
- Preserve all text, links, and data exactly as they are
- Do NOT change the language of any content
- Do NOT wrap the response in code blocks or markdown formatting
- Do NOT add \`\`\`mdx or any code block wrapper
- Return ONLY the raw MDX content without any wrapper
- If frontmatter exists, clean up the YAML formatting
- Use consistent spacing throughout
- Maintain the original language (Indonesian/English) of all content

Content to format:
${content}

Return ONLY the formatted MDX content without any explanation or code block wrapper.`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid enhancement type" },
          { status: 400 }
        );
    }

    let enhancedContent = "";

    try {
      if (providerName === "ollama") {
        enhancedContent = await generateWithOllama(prompt, selectedProvider);
      } else if (providerName === "gemini") {
        enhancedContent = await generateWithGemini(prompt, selectedProvider);
      }
    } catch (error) {
      console.error(`${providerName} generation error:`, error);
      
      // Fallback to other provider if available
      if (providerName === "ollama" && providers.gemini.available) {
        console.log("Falling back to Gemini...");
        try {
          enhancedContent = await generateWithGemini(prompt, providers.gemini);
          providerName = "gemini (fallback)";
        } catch (fallbackError) {
          console.error("Fallback to Gemini failed:", fallbackError);
          throw error;
        }
      } else if (providerName === "gemini" && providers.ollama.available) {
        console.log("Falling back to Ollama...");
        try {
          enhancedContent = await generateWithOllama(prompt, providers.ollama);
          providerName = "ollama (fallback)";
        } catch (fallbackError) {
          console.error("Fallback to Ollama failed:", fallbackError);
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Post-processing: Remove any code block wrappers that might be added
    enhancedContent = enhancedContent
      .replace(/^```mdx\s*\n/, '') // Remove opening ```mdx
      .replace(/^```\s*\n/, '')    // Remove opening ```
      .replace(/\n```\s*$/, '')    // Remove closing ```
      .trim();

    // If the content starts and ends with triple backticks, remove them
    if (enhancedContent.startsWith('```') && enhancedContent.endsWith('```')) {
      const lines = enhancedContent.split('\n');
      if (lines.length > 2) {
        lines.shift(); // Remove first line (opening ```)
        lines.pop();   // Remove last line (closing ```)
        enhancedContent = lines.join('\n');
      }
    }

    return NextResponse.json({ 
      enhancedContent: enhancedContent.trim(),
      originalLength: content.length,
      enhancedLength: enhancedContent.trim().length,
      provider: providerName,
      model: selectedProvider.model
    });

  } catch (error) {
    console.error("AI Enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to enhance content with AI" },
      { status: 500 }
    );
  }
} 