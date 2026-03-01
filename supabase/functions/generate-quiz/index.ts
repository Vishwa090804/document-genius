import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const numQuestions = parseInt(formData.get("numQuestions") as string) || 5;
    const difficulty = (formData.get("difficulty") as string) || "Medium";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read file content as text
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let documentText = "";
    
    // For PDF files, extract text by decoding readable content
    if (file.name.endsWith(".pdf")) {
      // Simple PDF text extraction - decode the bytes and extract readable text
      const rawText = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
      // Extract text between BT/ET blocks and parentheses in PDF
      const textMatches = rawText.match(/\(([^)]+)\)/g);
      if (textMatches) {
        documentText = textMatches
          .map(m => m.slice(1, -1))
          .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
          .join(" ");
      }
      // Also try to get stream content
      const streamMatches = rawText.match(/stream\n([\s\S]*?)\nendstream/g);
      if (streamMatches) {
        for (const stream of streamMatches) {
          const content = stream.replace(/stream\n/, '').replace(/\nendstream/, '');
          const readable = content.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
          if (readable.length > 20 && /[a-zA-Z]{3,}/.test(readable)) {
            documentText += " " + readable;
          }
        }
      }
    } else {
      // For DOCX and text files
      const rawText = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
      
      if (file.name.endsWith(".docx")) {
        // Extract text from DOCX XML content
        const textMatches = rawText.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
        if (textMatches) {
          documentText = textMatches
            .map(m => m.replace(/<[^>]+>/g, ""))
            .join(" ");
        }
      } else {
        documentText = rawText;
      }
    }

    if (!documentText || documentText.trim().length < 50) {
      return new Response(JSON.stringify({ 
        error: "Could not extract enough text from the document. Please try a text-based PDF or a .txt file." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Truncate to ~8000 chars to stay within token limits
    const truncatedText = documentText.substring(0, 8000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
Difficulty Level: ${difficulty}

Each question must include:
- "question": The question text
- "options": An array of exactly 4 options (strings)
- "correctIndex": The index (0-3) of the correct option
- "explanation": A brief explanation of why the answer is correct

Return ONLY a valid JSON object with this exact structure, no markdown, no code fences:
{"questions": [...]}

Text:
${truncatedText}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a quiz generator. You MUST return ONLY valid JSON with no extra text, no markdown formatting, no code blocks. Just raw JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content from AI");

    // Clean the response - remove markdown code fences if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const quizData = JSON.parse(cleanedContent);

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
