import { Health } from "@/components/Health";
import { RangiSplash } from "@/components/brand/RangiSplash";

export default function Home() {
  return (
    <main>
      <div style={{ maxWidth: 260 }}>
        <RangiSplash theme="light" />
      </div>
      <p>Khung dự án đã chạy.</p>
      <Health status="unknown" />
    </main>
  );
}
