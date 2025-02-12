declare module "@/components/ui/skeleton" {
  import { HTMLAttributes } from "react";

  export function Skeleton(props: HTMLAttributes<HTMLDivElement>): JSX.Element;
}

declare module "@/components/ui/badge" {
  import { HTMLAttributes } from "react";

  export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline";
  }

  export function Badge(props: BadgeProps): JSX.Element;
}

declare module "@/components/ui/button" {
  import { ButtonHTMLAttributes } from "react";

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
  }

  export function Button(props: ButtonProps): JSX.Element;
}

declare module "@/components/ui/card" {
  import { HTMLAttributes } from "react";

  export function Card(props: HTMLAttributes<HTMLDivElement>): JSX.Element;
  export function CardHeader(
    props: HTMLAttributes<HTMLDivElement>
  ): JSX.Element;
  export function CardTitle(props: HTMLAttributes<HTMLDivElement>): JSX.Element;
  export function CardDescription(
    props: HTMLAttributes<HTMLDivElement>
  ): JSX.Element;
  export function CardContent(
    props: HTMLAttributes<HTMLDivElement>
  ): JSX.Element;
}
