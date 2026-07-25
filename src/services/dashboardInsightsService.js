const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getDashboardInsights(data) {
  const response = await fetch(
    `${API}/api/dashboard-insights`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Unable to load dashboard insights."
    );
  }

  return result.insights || [];
}