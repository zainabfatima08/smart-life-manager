import { PremiumNav } from '@/components/premium-nav';

export default function ProfileLayout({
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
