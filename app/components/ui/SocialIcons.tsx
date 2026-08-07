export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16.5 2h-3.1v13.6a2.9 2.9 0 1 1-2.4-2.86V9.6a6 6 0 1 0 5.5 5.98V9.1a7.7 7.7 0 0 0 4.5 1.43V7.4a4.6 4.6 0 0 1-4.5-4.5Z" />
    </svg>
  );
}

export function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.6 7.2a2.9 2.9 0 0 0-2.05-2.05C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.55.45A2.9 2.9 0 0 0 2.4 7.2 30 30 0 0 0 2 12a30 30 0 0 0 .4 4.8 2.9 2.9 0 0 0 2.05 2.05C6.2 19.3 12 19.3 12 19.3s5.8 0 7.55-.45a2.9 2.9 0 0 0 2.05-2.05A30 30 0 0 0 22 12a30 30 0 0 0-.4-4.8ZM10 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  );
}
