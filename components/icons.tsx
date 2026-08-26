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
