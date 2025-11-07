import ModelLoader from "@/components/machine/model-loader";
import { auth } from "@/lib/auth";

export default async function AppPage() {
  const session = await auth();

  return (
    <div className="flex items-center justify-center w-full h-full text-woodsmoke-50">
      <ModelLoader />
    </div>
  );
}
