/**
 * Shared card hover shell — glow border + lift on landing, subtle lift on app surfaces.
 */

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type HoverCardVariant = "glow" | "subtle";

const innerToneClass = {
  landing: "hover-card__inner--landing",
  panel: "hover-card__inner--panel",
  deck: "hover-card__inner--deck",
  card: "hover-card__inner--card",
} as const;

type HoverCardTone = keyof typeof innerToneClass;

type HoverCardOwnProps<T extends ElementType> = {
  as?: T;
  variant?: HoverCardVariant;
  tone?: HoverCardTone;
  innerClassName?: string;
  children: ReactNode;
  className?: string;
};

export type HoverCardProps<T extends ElementType = "div"> = HoverCardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof HoverCardOwnProps<T>>;

export default function HoverCard<T extends ElementType = "div">({
  as,
  variant = "glow",
  tone = "landing",
  innerClassName = "",
  children,
  className = "",
  ...props
}: HoverCardProps<T>) {
  const Component = as || "div";

  return (
    <Component
      className={[
        "hover-card",
        variant === "subtle" && "hover-card--subtle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {variant === "glow" && (
        <div className="hover-card__glow" aria-hidden="true" />
      )}
      <div
        className={[
          "hover-card__inner",
          innerToneClass[tone],
          innerClassName,
        ].join(" ")}
      >
        {children}
      </div>
    </Component>
  );
}
