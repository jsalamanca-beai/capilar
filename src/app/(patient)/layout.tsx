import PatientProvider from "@/components/patient/PatientProvider";
import PatientHeader from "@/components/patient/PatientHeader";
import BottomNav from "@/components/shared/BottomNav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PatientProvider>
      <div className="flex flex-col min-h-screen bg-bg">
        <PatientHeader />
        <main className="flex-1 pb-20 overflow-y-auto">{children}</main>
        <BottomNav />
      </div>
    </PatientProvider>
  );
}
