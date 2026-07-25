const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ----------------------------------------------------
   Generate Interview
---------------------------------------------------- */

export async function generateInterview(data) {
  const response = await fetch(
    `${API_BASE_URL}/api/interview-simulator/generate`,
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
      result.error || "Unable to generate interview."
    );
  }

  return result.interview;
}

/* ----------------------------------------------------
   Evaluate Answer
---------------------------------------------------- */

export async function evaluateAnswer(data) {
  const response = await fetch(
    `${API_BASE_URL}/api/interview-simulator/evaluate`,
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
      result.error || "Unable to evaluate answer."
    );
  }

  return result.evaluation;
}

/* ----------------------------------------------------
   Final Report
---------------------------------------------------- */

export async function generateInterviewReport(data) {
  const response = await fetch(
    `${API_BASE_URL}/api/interview-simulator/report`,
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
      result.error ||
        "Unable to generate interview report."
    );
  }

  return result.report;
}