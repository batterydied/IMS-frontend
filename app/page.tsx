import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";

export default async function App() {
  const user = await getUserSession()
  if (!user) redirect("/login");
  return (
    <div className="page">
      <div>Home page</div>
    </div>
  );
}
