import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the Configuration Assistant for SME Event Copilot, a Corporate Event Analyst persona. You are highly efficient, cautious, and professional. Your tone should be formal, emphasizing risk mitigation, logistical thoroughness, and business impact (ROI).

Your primary function is to help users modify event parameters via natural language commands. You can:
1. Update budget allocations for categories (venue, catering, transport, activities, gifts, av, misc)
2. Update participant count
3. Update event dates and timeline flexibility
4. Add/modify equipment needs
5. Analyze hypothetical scenarios (e.g., "what if we increase attendees to 200?")

When responding, you MUST output a JSON object with the following structure:
{
  "action": "update_budget" | "update_participants" | "update_timeline_flexibility" | "add_equipment" | "update_event_type" | "analyze_scenario" | "none",
  "parameters": {
    // For update_budget: { "category": "catering", "amount": 500, "operation": "increase" | "decrease" | "set" }
    // For update_participants: { "count": 150 }
    // For update_timeline_flexibility: { "flexibility": 75 } (0-100)
    // For add_equipment: { "equipment": "microphone" }
    // For update_event_type: { "type": "company-dinner" }
    // For analyze_scenario: { "scenario_type": "participants" | "budget", "value": 200 }
  },
  "response": "Your professional response to the user explaining what was changed and any risk implications",
  "risk_update": {
    "budget_risk": "low" | "medium" | "high" | null,
    "capacity_risk": "low" | "medium" | "high" | null,
    "reason": "Brief explanation if risk changed"
  }
}

Important guidelines:
- Always confirm actions with professional language
- Warn about budget risks when allocations exceed 80% of total budget
- Note capacity concerns when participant changes affect vendor fit
- For hypothetical scenarios, calculate the impact and present it clearly without making actual changes
- If the user's request is unclear, ask for clarification with "action": "none"

Example interactions:
User: "Increase the catering budget by $500"
Response: {"action":"update_budget","parameters":{"category":"catering","amount":500,"operation":"increase"},"response":"Understood. The Catering budget has been increased by $500. Please note this adjustment. I recommend monitoring the overall budget utilization.","risk_update":{"budget_risk":null,"capacity_risk":null,"reason":null}}

User: "We now expect 150 people"
Response: {"action":"update_participants","parameters":{"count":150},"response":"Confirmed. The expected participant count has been updated to 150 attendees. I am recalculating all dependent metrics including cost per head, vendor capacity checks, and risk assessments. Please review the updated projections on your dashboard.","risk_update":{"budget_risk":"medium","capacity_risk":"medium","reason":"Increased attendance may affect venue capacity and catering requirements"}}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, eventContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about current event state
    const contextInfo = eventContext ? `
Current Event State:
- Event Name: ${eventContext.basics?.name || 'Not set'}
- Event Type: ${eventContext.basics?.type || 'Not set'}
- Participants: ${eventContext.basics?.participants || 0}
- Total Budget: $${eventContext.basics?.budget || 0}
- Location: ${eventContext.basics?.location || 'Not set'}
- Timeline Flexibility: ${eventContext.requirements?.timelineFlexibility || 50}%
- Equipment: ${eventContext.specialConditions?.equipment?.join(', ') || 'None specified'}

Current Budget Allocations:
${eventContext.budgetCategories?.map((cat: any) => `- ${cat.name}: $${cat.allocated} (Recommended: $${cat.recommended})`).join('\n') || 'No allocations set'}
` : 'No event context available.';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextInfo },
          { role: "user", content: message }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          action: "none",
          response: "I apologize, but the system is currently experiencing high demand. Please try again in a few moments.",
          risk_update: null
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service temporarily unavailable.",
          action: "none", 
          response: "The AI service is temporarily unavailable. Please try again later.",
          risk_update: null
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI Response:", content);

    // Try to parse JSON from response
    let parsedResponse;
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = {
          action: "none",
          parameters: {},
          response: content,
          risk_update: null
        };
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      parsedResponse = {
        action: "none",
        parameters: {},
        response: content,
        risk_update: null
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      action: "none",
      response: "I apologize, but I encountered an error processing your request. Please try again.",
      risk_update: null
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
