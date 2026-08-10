import { notFound } from 'next/navigation';
import LessonPlayer from '@/components/LessonPlayer';
import { buildMasteryMission } from '@/lib/masteryMission.server';

export default async function MasteryMissionPage({
  params,
  searchParams
}: {
  params: Promise<{ conceptTag: string }>;
  searchParams: Promise<{ round?: string }>;
}) {
  const { conceptTag } = await params;
  const { round } = await searchParams;
  const decoded = decodeURIComponent(conceptTag);
  const mission = await buildMasteryMission(decoded, Number(round ?? '1'));
  if (!mission) notFound();
  return <LessonPlayer lesson={mission} masteryTag={decoded} masteryRound={Number(round ?? '1')} />;
}
