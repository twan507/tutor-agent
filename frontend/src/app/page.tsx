import { Health } from "@/components/Health";
import { RangiLogo } from "@/components/brand/RangiLogo";

export default function Home() {
  return (
    <main>
      <div style={{ maxWidth: 260 }}>
        <RangiLogo variant="wordmark" theme="light" />
      </div>
      <p>Khung dự án đã chạy.</p>
      <Health status="unknown" />
    </main>
  );
}
