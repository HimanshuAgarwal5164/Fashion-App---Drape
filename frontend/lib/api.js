import { DEFAULT_API_URL } from "./constants";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || "Request failed");
  }
  return data;
}

export async function fetchOccasions() {
  const response = await fetch(`${API_BASE_URL}/api/occasions`);
  return parseJsonResponse(response);
}

export async function detectLook(blob) {
  const form = new FormData();
  form.append("file", blob, "capture.jpg");
  const response = await fetch(`${API_BASE_URL}/api/detect-skin-tone`, {
    method: "POST",
    body: form,
  });
  return parseJsonResponse(response);
}

export async function fetchRecommendations(payload) {
  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response);
}

export async function buildWardrobe(payload) {
  const response = await fetch(`${API_BASE_URL}/api/wardrobe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response);
}
