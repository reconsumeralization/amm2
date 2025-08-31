import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
}

// Simple response templates for common queries
const responseTemplates = {
  greeting: [
    "Hello! I'm your ModernMen assistant. I can help you book appointments, check schedules, or answer questions about our services.",
    "Hi there! How can I help you today? I can assist with appointments, service information, or general questions.",
    "Welcome to ModernMen! I'm here to help with anything you need."
  ],
  booking: [
    "I'd be happy to help you book an appointment! What service are you interested in?",
    "Let me help you schedule an appointment. Which service would you like to book?",
    "Great! I can help you find the perfect appointment slot. What type of service are you looking for?"
  ],
  services: [
    "We offer a variety of services including haircuts, beard trims, hot towel shaves, and styling. What would you like to know more about?",
    "Our services include classic haircuts, modern fades, beard grooming, and premium shave experiences. Which interests you?",
    "ModernMen provides professional grooming services from haircuts to full beard maintenance. What can I tell you about?"
  ],
  hours: [
    "We're open Monday-Friday 9am-7pm, Saturday 8am-6pm, and Sunday 10am-5pm. When would you like to visit?",
    "Our hours are Mon-Fri 9-7, Sat 8-6, Sun 10-5. What day works best for you?",
    "We're here Monday through Sunday with extended weekend hours. When are you available?"
  ],
  default: [
    "I'd be happy to help you with that! Can you tell me more about what you're looking for?",
    "That's a great question! Let me help you find the right information.",
    "I'm here to assist! Could you provide a bit more detail about what you need?"
  ]
}

function categorizeMessage(message: string): keyof typeof responseTemplates {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'greeting'
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
    return 'booking'
  }
  
  if (lowerMessage.includes('service') || lowerMessage.includes('haircut') || lowerMessage.includes('beard') || lowerMessage.includes('shave')) {
    return 'services'
  }
  
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('close') || lowerMessage.includes('time')) {
    return 'hours'
  }
  
  return 'default'
}

function getRandomResponse(category: keyof typeof responseTemplates): string {
  const responses = responseTemplates[category]
  return responses[Math.floor(Math.random() * responses.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history = [] } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('Chatbot API called with message:', message)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    // Categorize the message and get appropriate response
    const category = categorizeMessage(message)
    const response = getRandomResponse(category)
    
    // Add context-aware responses based on history
    let contextualResponse = response
    if (history.length > 0) {
      const lastMessage = history[history.length - 1]
      if (lastMessage.role === 'assistant' && lastMessage.content.includes('appointment')) {
        if (category === 'services') {
          contextualResponse = "Perfect! For that service, I can check our availability. Would you prefer morning or afternoon appointments?"
        }
      }
    }

    return NextResponse.json({
      message: contextualResponse,
      timestamp: new Date().toISOString(),
      category
    })
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chatbot API is running',
    capabilities: [
      'Appointment booking assistance',
      'Service information',
      'Hours and location',
      'General questions'
    ]
  })
}