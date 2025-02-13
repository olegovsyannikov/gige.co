import { makeMarkdownText } from "@assistant-ui/react-markdown";
import { CodeHighlighter } from "./syntax-highlighter";
import type { ComponentProps, ReactNode } from "react";

type CodeProps = ComponentProps<'code'> & {
  children?: ReactNode;
  className?: string;
};

const CodeBlock = ({ children, className }: CodeProps) => {
  // Convert children to string if needed
  const codeString = typeof children === 'string' ? children : String(children || '');
  const language = className?.replace('language-', '') || 'text';
  
  return (
    <div className="rounded-md border">
      <CodeHighlighter language={language}>
        {codeString}
      </CodeHighlighter>
    </div>
  );
};

export const MarkdownText = makeMarkdownText({
  components: {
    code: CodeBlock,
  }
});
