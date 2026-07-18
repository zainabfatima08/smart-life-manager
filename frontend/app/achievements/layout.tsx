import { PremiumNav } from '@/components/premium-nav';

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PremiumNav />
      <div className="md:ml-64">
        {children}
      </div>
    </>
  );
}
