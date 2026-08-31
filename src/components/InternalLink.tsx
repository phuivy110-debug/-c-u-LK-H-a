import React from 'react';

export function InternalLink({ href, onNavigate, children, ...props }:
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick' | 'href'> & {
    href: string; onNavigate?: (path: string) => void;
  }) {
  return <a {...props} href={href} onClick={event => {
    if (onNavigate && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      onNavigate(href);
    }
  }}>{children}</a>;
}
