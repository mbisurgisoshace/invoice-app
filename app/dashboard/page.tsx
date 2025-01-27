import { Button } from "@/components/ui/button";

import { signOut } from "../utils/auth";
import { requireUser } from "../utils/hooks";

export default async function Dashboard() {
  const session = await requireUser();

  return (
    <div>
      <h1>Hello from the Dashboard</h1>
    </div>
  );
}
