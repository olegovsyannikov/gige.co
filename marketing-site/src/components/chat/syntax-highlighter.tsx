import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeProps {
  language: string;
  children: string;
}

export const CodeHighlighter = ({ language, children }: CodeProps) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={coldarkDark}
      customStyle={{
        margin: 0,
        width: "100%",
        background: "transparent",
        padding: "1.5rem 1rem",
        fontSize: "0.875rem", // 14px
        lineHeight: "1.5", // For better readability
      }}
      PreTag="div"
    >
      {children}
    </SyntaxHighlighter>
  );
};
