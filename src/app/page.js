import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";

export default function Home() {
  return (
    <>
      <div className="sticky top-0 z-50 w-full">
        <AnnouncementBar />
        <Header />
      </div>

      <main>
        <Hero />
      </main>
    </>
  );
}
