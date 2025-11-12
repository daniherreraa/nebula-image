import ModelLoader from "@/components/machine/model-loader";

// Force dynamic rendering due to useSearchParams in ModelLoader
export const dynamic = 'force-dynamic';

export default async function AppPage() {
  // const session = await safeAuth(); // TODO: Add authentication check

  return (
    <div className="flex items-center justify-center w-full h-full text-woodsmoke-50">
      <ModelLoader />
    </div>
  );
}
