export default function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only fixed left-3 top-3 z-[100] rounded-pill bg-cta px-4 py-3 font-bold text-white shadow-e3 focus:not-sr-only"
    >
      Skip to main content
    </a>
  );
}
