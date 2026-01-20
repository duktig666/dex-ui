// Type declarations for Reown AppKit web components
declare namespace JSX {
  interface IntrinsicElements {
    "w3m-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        size?: "sm" | "md";
        balance?: "show" | "hide";
        disabled?: boolean;
      },
      HTMLElement
    >;
    "w3m-network-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      },
      HTMLElement
    >;
    "w3m-connect-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        size?: "sm" | "md";
        label?: string;
        loadingLabel?: string;
      },
      HTMLElement
    >;
    "w3m-account-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        balance?: "show" | "hide";
      },
      HTMLElement
    >;
  }
}
