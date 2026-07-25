const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function generateAIProject(projectData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/project-generator`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          "Unable to generate an AI project."
      );
    }

    if (!data?.success || !data?.project) {
      throw new Error(
        "The AI project response is incomplete."
      );
    }

    return data.project;
  } catch (error) {
    console.error("AI project service error:", error);

    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to the backend server. Make sure it is running on port 5000."
      );
    }

    throw error;
  }
}