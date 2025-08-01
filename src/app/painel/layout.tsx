export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 text-white min-h-screen overflow-hidden">
      {children}
    </div>
  );
}
