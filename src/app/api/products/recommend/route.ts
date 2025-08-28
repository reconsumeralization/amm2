import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload();

    // Get user data
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's appointment history
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        user: { equals: userId },
        status: { equals: 'completed' },
      },
      limit: 20,
      sort: '-date',
    });

    // Get all active products
    const productsQuery: any = {
      isActive: { equals: true },
    };

    if (category) {
      productsQuery.category = { equals: category };
    }

    const products = await payload.find({
      collection: 'products',
      where: productsQuery,
      limit: 50,
      sort: '-featured,-order',
    });

    if (products.docs.length === 0) {
      return NextResponse.json([]);
    }

    // Build context for AI recommendation
    const userContext = {
      preferences: user.profile?.preferences || {},
      appointments: appointments.docs.map((apt: any) => ({
        service: apt.service?.name || apt.service,
        date: apt.date,
      })),
      loyalty: user.loyalty || {},
    };

    // Create AI prompt for recommendations
    const prompt = `
      Based on the following user data, recommend ${limit} products from the available products list.
      
      User Context:
      - Hair Type: ${userContext.preferences.hairType || 'unknown'}
      - Hair Length: ${userContext.preferences.hairLength || 'unknown'}
      - Beard Style: ${userContext.preferences.beardStyle || 'unknown'}
      - Recent Services: ${userContext.appointments.slice(0, 5).map((apt: any) => apt.service).join(', ')}
      - Loyalty Tier: ${userContext.loyalty.tier || 'bronze'}
      
      Available Products:
      ${products.docs.map((product: any) => 
        `- ${product.name} (${product.category}): ${product.shortDescription || product.description}`
      ).join('\n')}
      
      Please return a JSON array of product IDs in order of recommendation priority. 
      Consider the user's hair type, recent services, and preferences.
      Focus on products that complement their recent services and match their style preferences.
      
      Return only the JSON array, no additional text.
    `;

    try {
      // Get AI recommendations
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional barber and grooming expert. Provide product recommendations based on user preferences and service history."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      
      // Parse AI response
      let recommendedProductIds: string[] = [];
      try {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\[.*\]/);
        if (jsonMatch) {
          recommendedProductIds = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

      // If AI parsing failed, use fallback logic
      if (recommendedProductIds.length === 0) {
        recommendedProductIds = getFallbackRecommendations(userContext, products.docs);
      }

      // Filter and sort products based on recommendations
      const recommendedProducts = products.docs
        .filter((product: any) => recommendedProductIds.includes(product.id))
        .sort((a: any, b: any) => {
          const aIndex = recommendedProductIds.indexOf(a.id);
          const bIndex = recommendedProductIds.indexOf(b.id);
          return aIndex - bIndex;
        })
        .slice(0, limit);

      // If we don't have enough recommended products, fill with featured products
      if (recommendedProducts.length < limit) {
        const remainingProducts = products.docs
          .filter((product: any) => !recommendedProductIds.includes(product.id))
          .filter((product: any) => product.featured)
          .slice(0, limit - recommendedProducts.length);
        
        recommendedProducts.push(...remainingProducts);
      }

      return NextResponse.json(recommendedProducts);

    } catch (aiError) {
      console.error('AI recommendation failed, using fallback:', aiError);
      
      // Fallback to rule-based recommendations
      const fallbackProducts = getFallbackRecommendations(userContext, products.docs);
      const recommendedProducts = products.docs
        .filter((product: any) => fallbackProducts.includes(product.id))
        .slice(0, limit);

      return NextResponse.json(recommendedProducts);
    }

  } catch (error) {
    console.error('Product recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to get product recommendations' },
      { status: 500 }
    );
  }
}

function getFallbackRecommendations(userContext: any, products: any[]) {
  const recommendations: string[] = [];
  
  // Rule-based recommendations
  const { preferences, appointments } = userContext;
  
  // Get recent services
  const recentServices = appointments.slice(0, 3).map((apt: any) => apt.service?.toLowerCase() || '');
  
  // Hair type based recommendations
  if (preferences.hairType) {
    const hairTypeProducts = products.filter((product: any) => {
      const description = (product.description + ' ' + product.shortDescription).toLowerCase();
      return description.includes(preferences.hairType) || 
             (preferences.hairType === 'curly' && description.includes('curl')) ||
             (preferences.hairType === 'straight' && description.includes('straight'));
    });
    recommendations.push(...hairTypeProducts.slice(0, 2).map((p: any) => p.id));
  }
  
  // Service-based recommendations
  if (recentServices.some((service: string) => service.includes('beard'))) {
    const beardProducts = products.filter((product: any) => product.category === 'beard');
    recommendations.push(...beardProducts.slice(0, 2).map((p: any) => p.id));
  }
  
  if (recentServices.some((service: string) => service.includes('hair'))) {
    const hairProducts = products.filter((product: any) => product.category === 'hair');
    recommendations.push(...hairProducts.slice(0, 2).map((p: any) => p.id));
  }
  
  // Featured products as fallback
  const featuredProducts = products.filter((product: any) => product.featured);
  recommendations.push(...featuredProducts.slice(0, 2).map((p: any) => p.id));
  
  // Remove duplicates and return
  return [...new Set(recommendations)];
}
