import { Suspense } from "react";
import ModelStepView from "@/components/machine/views/modelstepview";

export default async function ModelPage({
  params,
}: {
  params: Promise<{ modelid: string }>;
}) {
  const { modelid } = await params;

  return (
    <div className="relative flex flex-col w-full h-full pt-6">
      <ModelStepView modelId={modelid} />
    </div>
  );
}