export async function sendAssistantMessage(payload) {
  const response = await fetch("/api/ai-assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        "Unable to contact PathPilot AI."
    );
  }

  return result.reply;
}