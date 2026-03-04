import { getTrending } from "@/lib/data";
import TrendsClient from "./TrendsClient";

export default function TrendsPage() {
  const trending = getTrending();
  return <TrendsClient trending={trending} />;
}
