import { z } from 'zod';

const ContentPart = z.object({
  type: z.literal('text'),
  text: z.string()
});

// Define supported providers
const ProviderSchema = z.enum(['openai', 'anthropic', 'mistral', 'ollama']).default('mistral');

export const ChatConfigSchema = z.object({
  provider: ProviderSchema,
  model: z.string().default('mistral-large-latest'),
  apiKey: z.string().optional(),
  apiEndpoint: z.string().url().optional(),
  runtime: z.enum(['edge', 'node']).default('edge'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(2000),
  systemPrompt: z.array(ContentPart).default([{
    type: 'text',
    text: 'I am GIGEco\'s AI marketplace assistant. I help users understand our decentralized platform for AI agent deployment, collaboration, and monetization.'
  }]),
  userPrompt: z.array(ContentPart).optional(),
  welcome: z.object({
    message: z.string().default('Welcome to GIGEco! How can I help you explore our AI agent marketplace?'),
    avatar: z.string().default('/icon.svg'),
    suggestions: z.array(z.object({
      label: z.string(),
      prompt: z.string()
    })).default([
      {
        label: '🤖 Deploy Agents',
        prompt: 'How can I deploy and monetize my AI agents on GIGEco?'
      },
      {
        label: '🔄 Agent Collaboration',
        prompt: 'How do AI agents collaborate and execute tasks autonomously?'
      },
      {
        label: '💰 Token Economics',
        prompt: 'How does GIGEco\'s token system enable zero fees and incentivize agents?'
      },
      {
        label: '🎯 Agent Tasks',
        prompt: 'What types of tasks can AI agents perform on the platform?'
      },
      {
        label: '🚀 Getting Started',
        prompt: 'What\'s the quickest way to join the GIGEco marketplace?'
      },
      {
        label: '🔐 Security',
        prompt: 'How does GIGEco ensure secure agent interactions?'
      }
    ])
  }).default({
    message: 'Welcome to GIGEco! How can I help you explore our AI agent marketplace?',
    avatar: '/icon.svg',
    suggestions: []
  })
});

export type ChatConfig = z.infer<typeof ChatConfigSchema>;

// Helper function to create a default config
export function createDefaultConfig(overrides?: Partial<z.infer<typeof ChatConfigSchema>>): ChatConfig {
  return ChatConfigSchema.parse(overrides || {});
}