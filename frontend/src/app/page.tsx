import { Health } from "@/components/Health";

export default function Home() {
  return (
    <main>
      <h1>tutor-agent</h1>
      <p>Khung dự án đã chạy.</p>
      <Health status="unknown" />
    </main>
  );
}
