import type {ReactNode} from 'react';

/** Konuşma balonu simgesi; çizgi rengi ve kalınlığı kullanan bileşenin CSS sınıfından gelir. */
export default function SohbetSimgesi({className}: {className?: string}): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 5h16v11h-9l-4.5 3.5V16H4z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}
