type IconProps = {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

function IconBase({
  className,
  size = 16,
  color = 'currentColor',
  strokeWidth = 2,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ color, display: 'inline-block', verticalAlign: 'middle' }}
    >
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 18L9 12L15 6" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 18L15 12L9 6" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12.5L9.2 16.7L19 6.9" />
    </IconBase>
  );
}

export function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6L18 18M18 6L6 18" />
    </IconBase>
  );
}

export function CircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="7" />
    </IconBase>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 2L5 13H11L9 22L19 10H13L15 2Z" />
    </IconBase>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 7V4H17" />
      <path d="M4 17V20H7" />
      <path d="M20 7C18.6 5.2 16.5 4 14 4C9.6 4 6 7.6 6 12" />
      <path d="M4 17C5.4 18.8 7.5 20 10 20C14.4 20 18 16.4 18 12" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9L12 15L18 9" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 6L15 12L9 18" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5V19M5 12H19" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7H20M4 12H20M4 17H20" />
    </IconBase>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="4" rx="1" />
      <rect x="13" y="10" width="7" height="10" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
    </IconBase>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V7L14 2Z" />
      <path d="M14 2V7H19" />
      <path d="M9 13H15M9 17H15" />
    </IconBase>
  );
}

export function KeyboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M7 11H7.01M11 11H11.01M15 11H15.01M19 11H19.01M7 15H17" />
    </IconBase>
  );
}

export function ScreenReaderIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="9" y="3" width="6" height="9" rx="2" />
      <path d="M8 17L6 21M16 17L18 21M12 12V21" />
      <path d="M9 7H15" />
    </IconBase>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 12C4.2 7.4 7.7 5 12 5C16.3 5 19.8 7.4 22 12C19.8 16.6 16.3 19 12 19C7.7 19 4.2 16.6 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function DocumentCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V7L14 2Z" />
      <path d="M14 2V7H19" />
      <path d="M9 15L11 17L15 13" />
    </IconBase>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3H15V4M9 9H15M9 13H15M9 17H13" />
    </IconBase>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3V15M7 10L12 15L17 10" />
      <path d="M5 20H19" />
    </IconBase>
  );
}

export function GitHubIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.38 6.84 9.74.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.02-2.75-.1-.26-.44-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.18 9.18 0 0 1 12 7.01c.85 0 1.7.12 2.49.36 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.21 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.58 5.06.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function GoogleIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.23Z" />
      <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.7Z" />
      <path fill="#FBBC05" d="M6.54 13.8A5.86 5.86 0 0 1 6.23 12c0-.63.11-1.24.31-1.8V7.7H3.3A9.77 9.77 0 0 0 2.25 12c0 1.55.37 3.02 1.05 4.3l3.24-2.5Z" />
      <path fill="#EA4335" d="M12 6.17c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.26 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.4l3.24 2.5c.77-2.31 2.92-4.03 5.46-4.03Z" />
    </svg>
  );
}
