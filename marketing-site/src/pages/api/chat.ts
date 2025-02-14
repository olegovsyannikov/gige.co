/// <reference types="node" />

import type { APIRoute } from 'astro';
import 'dotenv/config';
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { mistral } from "@ai-sdk/mistral";
import { createEdgeRuntimeAPI } from "@assistant-ui/react/edge";
import { type ChatConfig } from '@/schema/chat';
import type { Message } from 'ai';

interface ChatRequest {
  id: string;
  messages: Message[];
  config: ChatConfig;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ANTHROPIC_API_KEY?: string;
      VITE_ANTHROPIC_API_KEY?: string;
      PUBLIC_ANTHROPIC_API_KEY?: string;
      MISTRAL_API_KEY?: string;
      OPENAI_API_KEY?: string;
      VERCEL_ENV?: string;
    }
  }
}

const getAnthropicKey = (): string => {
  // In Vercel's Edge Runtime, environment variables are available directly
  const key = process.env.ANTHROPIC_API_KEY;
              
  if (!key) {
    console.error('Anthropic API key not found in environment variables');
    throw new Error('ANTHROPIC_API_KEY not configured in Vercel environment');
  }
  
  return key;
};

const getProvider = (config: ChatConfig) => {
  switch (config.provider) {
    case 'anthropic': {
      const anthropicKey = getAnthropicKey();
      return anthropic(config.model, {
        anthropicApiKey: anthropicKey,
        maxTokens: config.maxTokens,
        temperature: config.temperature
      });
    }
      
    case 'mistral':
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error('MISTRAL_API_KEY not configured in Vercel environment');
      }
      return mistral(config.model);
      
    case 'openai':
    default:
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured in Vercel environment');
      }
      return openai(config.model);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const requestData = await request.json() as ChatRequest;
    const config = {
      ...requestData.config,
      provider: requestData.config?.provider || 'anthropic',
      model: requestData.config?.model || 'claude-3-opus-20240229'
    };

    // Check environment variables early
    if (config.provider === 'anthropic') {
      // Verify Anthropic key is available
      getAnthropicKey();
    }

    // Transform messages to the format expected by the AI provider
    const messages = requestData.messages.map(msg => {
      // Handle content that's already in the correct format
      if (Array.isArray(msg.content) && msg.content[0]?.type === 'text') {
        return msg;
      }
      // Transform string content to expected format
      return {
        ...msg,
        content: [{
          type: 'text' as const,
          text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }]
      };
    });

    const handler = createEdgeRuntimeAPI({
      model: getProvider(config),
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2000
    });

    const response = await handler.POST({
      ...request,
      json: async () => ({
        messages,
        functions: [],
        function_call: null
      })
    });

    if (!response.ok) {
      throw new Error(`Edge runtime error: ${response.statusText}`);
    }

    return response;

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        provider: 'anthropic',
        environment: process.env.VERCEL_ENV || 'production'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};