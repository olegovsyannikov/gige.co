---
title: "Getting Started with Astro + Shadcn/UI"
description: "Learn how to set up and customize your high-performance Astro site with Shadcn/UI components"
slug: "/Blogs/getting-started"
date: 2024-03-21
picture: ""
images:
  - src: ""
    alt: ""
  - src: ""
    alt: ""
---

Get started with ONE in minutes. This guide will walk you through setup, customization, and best practices.

## Quick Start

1. **Clone the Repository**
```bash
git clone https://github.com/one-ie/one.git
cd astro-shadcn
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:4321` to see your site in action!

## Key Features

1. **Performance First Architecture**
   - Zero JavaScript by default
   - Automatic image optimization
   - Built-in SEO optimizations
   - Perfect Lighthouse scores out of the box

2. **Beautiful UI Components**
   - Full Shadcn/UI component library
   - Dark mode support
   - Customizable theme
   - Accessible by default

3. **Developer Experience**
   - TypeScript support
   - Hot module reloading
   - Component auto-imports
   - Tailwind CSS integration

## Customizing Your Site

### Theme Configuration
Edit `src/styles/globals.css` to customize your color scheme:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* Add your custom colors here */
}
```

### Adding New Components
1. Use the CLI to add Shadcn components:
```bash
npx shadcn-ui add button
```

2. Import and use in your Astro pages:
```astro
---
import { Button } from "@/components/ui/button"
---

<Button>Click me!</Button>
```

## Best Practices

- ✅ Use static routes when possible
- ✅ Implement image optimization with `<Image />` component
- ✅ Leverage client directives wisely
- ✅ Follow the component-first architecture
- ✅ Utilize TypeScript for better type safety

## Need Help?

- 📖 [Documentation](https://docs.astro.build)
- 💬 [Discord Community](https://astro.build/chat)
- 🐛 [GitHub Issues](https://github.com/one-ie/astro-shadcn/issues)


