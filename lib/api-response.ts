export async function apiResponse(response: Response) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw Error(
      "The website could not complete this request. Please refresh and try again.",
    );
  }
  if (!response.ok)
    throw Error(
      typeof data?.error === "string"
        ? data.error
        : "Request failed. Please try again.",
    );
  return data;
}
