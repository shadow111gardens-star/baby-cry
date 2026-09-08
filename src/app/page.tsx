import BabyApp from "@/components/BabyApp";
import { getBabyState } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getBabyState();
  return <BabyApp initial={initial} />;
}
