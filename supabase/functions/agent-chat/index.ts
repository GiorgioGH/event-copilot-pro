import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// N8N Webhook URL
const N8N_WEBHOOK_URL = "https://clemens07.app.n8n.cloud/webhook-test/6c2f381b-d7e6-4404-a10d-fd18e9b7202d";

// ============ DATA ============
// Vendors data from scraper/data/vendors.json
const vendorsData = [
  {
    vendor_type: "venue",
    name: "Tivoli Hotel & Congress Center",
    address: "Arni Magnussons Gade 2, Copenhagen V",
    description: "Modern meeting rooms for all types of events in Copenhagen",
    capacity: "50 - 500",
    rooms: 12,
    event_types: ["Conference", "Seminar", "Workshop", "Product Launch", "Gala Dinner"],
    price: "From 8500 DKK",
    amenities: ["WiFi", "Parking", "Catering Kitchen", "AV Equipment", "Accessibility"],
    rating: 4.6,
    reviews: 234
  },
  {
    vendor_type: "venue",
    name: "Scandic Copenhagen",
    address: "Vester Søgade 6, Copenhagen V",
    description: "Premium conference facilities with flexible meeting spaces",
    capacity: "30 - 400",
    rooms: 15,
    event_types: ["Conference", "Networking", "Workshop", "Team Building"],
    price: "From 7200 DKK",
    amenities: ["WiFi", "Parking", "Restaurant", "Fitness Center"],
    rating: 4.5,
    reviews: 189
  },
  {
    vendor_type: "venue",
    name: "Bella Center Copenhagen",
    address: "Center Boulevard 5, Copenhagen S",
    description: "Scandinavia's largest exhibition and conference center",
    capacity: "100 - 2000",
    rooms: 70,
    event_types: ["Conference", "Exhibition", "Trade Show", "Product Launch", "Gala"],
    price: "From 15000 DKK",
    amenities: ["WiFi", "Parking", "Restaurants", "AV Equipment", "Exhibition Space"],
    rating: 4.7,
    reviews: 456
  },
  {
    vendor_type: "venue",
    name: "Odd Fellow Palæet",
    address: "Bredgade 28, Copenhagen K",
    description: "Historic 18th-century palace with elegant rococo-style rooms",
    capacity: "20 - 150",
    rooms: 5,
    event_types: ["Gala Dinner", "Product Launch", "Networking", "Seminar"],
    price: "From 12000 DKK",
    amenities: ["WiFi", "Historic Architecture", "Catering"],
    rating: 4.8,
    reviews: 127
  },
  {
    vendor_type: "venue",
    name: "Hallernes Event & Konference",
    address: "Rådhuspladsen 14, Copenhagen V",
    description: "Modern event space with flexible layouts",
    capacity: "40 - 300",
    rooms: 8,
    event_types: ["Conference", "Workshop", "Networking", "Team Building"],
    price: "From 6500 DKK",
    amenities: ["WiFi", "Parking", "Catering", "AV Equipment"],
    rating: 4.4,
    reviews: 98
  },
  {
    vendor_type: "catering",
    name: "Copenhagen Catering",
    address: "Nørregade 8, Copenhagen K",
    description: "Premium catering with Danish and international cuisine",
    cuisine: ["Danish", "International", "Vegetarian", "Vegan"],
    dietary: ["Vegetarian", "Vegan", "Gluten-free", "Halal"],
    capacity: "500",
    price_per_person: "From 350 DKK",
    rating: 4.7,
    reviews: 203
  },
  {
    vendor_type: "catering",
    name: "Tapas Bar Catering",
    address: "Vesterbrogade 3, Copenhagen V",
    description: "Spanish-inspired tapas and Mediterranean flavors",
    cuisine: ["Spanish", "Mediterranean", "Tapas"],
    dietary: ["Vegetarian", "Gluten-free"],
    capacity: "200",
    price_per_person: "From 280 DKK",
    rating: 4.6,
    reviews: 156
  },
  {
    vendor_type: "catering",
    name: "Gourmet Events Copenhagen",
    address: "Nyhavn 17, Copenhagen K",
    description: "Fine dining, Michelin-inspired cuisine",
    cuisine: ["French", "Nordic", "International"],
    dietary: ["Vegetarian", "Vegan", "Gluten-free"],
    capacity: "150",
    price_per_person: "From 550 DKK",
    rating: 4.9,
    reviews: 89
  },
  {
    vendor_type: "transport",
    name: "Copenhagen Corporate Transport",
    address: "Kastrup Airport",
    description: "Luxury vehicles and professional drivers",
    vehicles: ["Luxury Sedan", "Minivan", "Bus", "Limousine"],
    capacity: "1 - 50",
    price: "From 450 DKK/hour",
    rating: 4.5,
    reviews: 142
  },
  {
    vendor_type: "transport",
    name: "Event Shuttle Services",
    address: "Amager Boulevard 70, Copenhagen S",
    description: "Reliable shuttle bus services for large events",
    vehicles: ["Bus", "Minibus", "Coach"],
    capacity: "20 - 50",
    price: "From 800 DKK/hour",
    rating: 4.3,
    reviews: 78
  },
  {
    vendor_type: "activities",
    name: "Copenhagen Team Building Adventures",
    address: "Nyhavn 1, Copenhagen K",
    description: "Escape rooms, cooking classes, outdoor adventures",
    activities: ["Team Building", "Escape Room", "Cooking Class", "Outdoor Adventure"],
    participants: "8 - 50",
    duration: "2-4 hours",
    price_per_person: "From 450 DKK",
    rating: 4.6,
    reviews: 167
  },
  {
    vendor_type: "activities",
    name: "Eventyr Workshop Studio",
    address: "Vesterbrogade 24, Copenhagen V",
    description: "Interactive workshops and creative activities",
    activities: ["Workshop", "Art Class", "Innovation Lab", "Networking Activity"],
    participants: "10 - 40",
    duration: "1-3 hours",
    price_per_person: "From 320 DKK",
    rating: 4.5,
    reviews: 134
  },
  {
    vendor_type: "av-equipment",
    name: "Sound & Light Copenhagen",
    address: "Industrivej 19, Ballerup",
    description: "Professional AV equipment rental",
    equipment: ["Sound System", "Projector", "Microphones", "Lighting", "Screens"],
    delivery: true,
    setup: true,
    price: "From 2500 DKK/day",
    rating: 4.7,
    reviews: 201
  },
  {
    vendor_type: "av-equipment",
    name: "AV Rental Copenhagen",
    address: "Lergravsvej 63, Copenhagen S",
    description: "Complete AV solutions for conferences",
    equipment: ["Projector", "Sound System", "Microphones", "Video Recording", "Streaming"],
    delivery: true,
    setup: true,
    price: "From 1800 DKK/day",
    rating: 4.4,
    reviews: 112
  }
];

// People/Employee data summary
const peopleData = {
  totalEmployees: 750,
  location: "Copenhagen, Denmark",
  departments: [
    { name: "Quality Control", count: 45 },
    { name: "Manufacturing", count: 120 },
    { name: "Product Development", count: 65 },
    { name: "Sales", count: 85 },
    { name: "Account Management", count: 55 },
    { name: "Engineering", count: 95 },
    { name: "Finance", count: 40 },
    { name: "Human Resources", count: 35 },
    { name: "Marketing", count: 60 },
    { name: "IT", count: 50 },
    { name: "Operations", count: 45 },
    { name: "Research", count: 30 },
    { name: "Customer Service", count: 25 }
  ],
  centers: ["West", "Main", "North", "South", "East"]
};

// ============ TOOL FUNCTIONS ============

function searchVendors(vendor_type?: string, keyword?: string, min_capacity?: number): string {
  let results = [...vendorsData];
  
  if (vendor_type) {
    results = results.filter(v => v.vendor_type === vendor_type);
  }
  
  if (keyword) {
    const kw = keyword.toLowerCase();
    results = results.filter(v => 
      v.name.toLowerCase().includes(kw) || 
      v.description.toLowerCase().includes(kw) ||
      (v.amenities && v.amenities.some((a: string) => a.toLowerCase().includes(kw))) ||
      (v.cuisine && v.cuisine.some((c: string) => c.toLowerCase().includes(kw))) ||
      (v.activities && v.activities.some((a: string) => a.toLowerCase().includes(kw)))
    );
  }
  
  if (min_capacity) {
    results = results.filter(v => {
      if (v.capacity) {
        const maxCap = parseInt(v.capacity.split('-').pop()?.trim() || '0');
        return maxCap >= min_capacity;
      }
      return true;
    });
  }
  
  return results.length > 0 ? JSON.stringify(results, null, 2) : "No vendors found.";
}

function getPeopleInfo(department?: string): string {
  if (department) {
    const dept = peopleData.departments.find(d => 
      d.name.toLowerCase().includes(department.toLowerCase())
    );
    if (dept) {
      return JSON.stringify({
        department: dept.name,
        employeeCount: dept.count,
        percentageOfCompany: ((dept.count / peopleData.totalEmployees) * 100).toFixed(1) + "%"
      }, null, 2);
    }
    return `Department "${department}" not found. Available: ${peopleData.departments.map(d => d.name).join(", ")}`;
  }
  return JSON.stringify(peopleData, null, 2);
}

function getVendorDetails(vendor_name: string): string {
  const vendor = vendorsData.find(v => 
    v.name.toLowerCase().includes(vendor_name.toLowerCase())
  );
  return vendor ? JSON.stringify(vendor, null, 2) : `Vendor "${vendor_name}" not found.`;
}

// ============ MAIN HANDLER ============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();

    console.log("Agent processing:", message);

    // Prepare context data for the AI
    const contextData = {
      vendors: vendorsData,
      people: peopleData
    };

    // Call n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        conversationHistory: conversationHistory || [],
        context: {
          vendorsSummary: `Available vendors: ${vendorsData.length} total (5 venues, 3 catering, 2 transport, 2 activities, 2 AV equipment)`,
          peopleSummary: `Company has ${peopleData.totalEmployees} employees across ${peopleData.departments.length} departments in ${peopleData.location}`,
          vendors: vendorsData,
          people: peopleData
        },
        tools: {
          available: ["search_vendors", "get_people_info", "get_vendor_details"],
          descriptions: {
            search_vendors: "Search vendors by type (venue/catering/transport/activities/av-equipment) or keyword",
            get_people_info: "Get employee/department information",
            get_vendor_details: "Get details about a specific vendor"
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("N8N webhook error:", response.status, errorText);
      throw new Error(`N8N webhook error: ${response.status}`);
    }

    const data = await response.json();
    console.log("N8N response:", data);

    // Handle different response formats from n8n
    let aiResponse = "";
    
    if (typeof data === "string") {
      aiResponse = data;
    } else if (data.response) {
      aiResponse = data.response;
    } else if (data.output) {
      aiResponse = data.output;
    } else if (data.message) {
      aiResponse = data.message;
    } else if (data.text) {
      aiResponse = data.text;
    } else {
      // If n8n returns structured data, format it nicely
      aiResponse = JSON.stringify(data, null, 2);
    }

    // Determine sources based on the query
    const sources: string[] = [];
    const msgLower = message.toLowerCase();
    if (msgLower.includes('venue') || msgLower.includes('catering') || msgLower.includes('transport') || 
        msgLower.includes('activity') || msgLower.includes('av') || msgLower.includes('vendor') ||
        msgLower.includes('food') || msgLower.includes('team building')) {
      sources.push('vendors.json');
    }
    if (msgLower.includes('employee') || msgLower.includes('department') || msgLower.includes('people') || 
        msgLower.includes('staff') || msgLower.includes('team')) {
      sources.push('people.json');
    }
    if (sources.length === 0) sources.push('vendors.json');

    console.log("Response sent to client");

    return new Response(JSON.stringify({
      response: aiResponse,
      sources,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Agent error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      response: "I apologize, but I encountered an error connecting to the AI service. Please check that your n8n webhook is active and try again.",
      sources: []
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
