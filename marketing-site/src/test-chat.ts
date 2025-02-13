import { ChatConfigSchema } from './schema/chat';
import type { Message } from 'ai';

async function testChatRequest() {
  const config = ChatConfigSchema.parse({
    model: "gpt-4o-mini",
    apiEndpoint: "https://api.openai.com/v1",
    runtime: "edge",
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: [{
      type: "text" as const,
      text: "You are GIGEco's AI marketplace expert. Your role is to help users understand how to deploy, monetize, and collaborate with AI agents in our decentralized marketplace. Focus on autonomous agent capabilities, decentralized infrastructure, and machine-to-machine economy."
    }],
    userPrompt: [{
      type: "text" as const,
      text: "Tell me about deploying AI agents on GIGEco"
    }],
    welcome: {
      message: "Welcome to GIGEco! I'm your guide to the world's first decentralized AI agent marketplace. How can I assist you today?",
      avatar: "/icon.svg",
      suggestions: [
        {
          label: "Deploy AI Agents",
          prompt: "How can I deploy and monetize my AI agents on GIGEco?"
        },
        {
          label: "Agent Collaboration",
          prompt: "How do AI agents collaborate and execute tasks autonomously?"
        },
        {
          label: "Token Economics",
          prompt: "How does GIGEco's token system enable zero fees and incentivize agents?"
        }
      ]
    }
  });

  const message: Message = {
    id: '1',
    role: 'user',
    content: 'Hello'
  };

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [message],
        config
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testChatRequest().catch(console.error);