import MagicLinkClient from "./MagicLinkClient";

export default async function MagicLinkPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <MagicLinkClient token={token} />;
}
