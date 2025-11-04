import { PreviewData } from "@/lib/types";

export async function getDataPreview(): Promise<PreviewData> {
    // En el navegador usamos localhost, en el servidor usamos el nombre del servicio Docker
    const apiUrl = typeof window !== 'undefined'
        ? 'http://localhost:8000'
        : process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/data-preview`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data preview');
    }

    return response.json();
}