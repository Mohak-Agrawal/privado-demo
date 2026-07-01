export async function fetchGitHubFile(url: string): Promise<{ code: string; filename: string }> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error("Invalid URL")
  }

  const { hostname, pathname } = parsed

  if (hostname !== "github.com" && hostname !== "raw.githubusercontent.com") {
    throw new Error("Only github.com or raw.githubusercontent.com URLs are accepted")
  }

  let rawUrl: string
  if (hostname === "github.com") {
    // github.com/user/repo/blob/branch/path/to/file
    // → raw.githubusercontent.com/user/repo/branch/path/to/file
    rawUrl = "https://raw.githubusercontent.com" + pathname.replace("/blob/", "/")
  } else {
    rawUrl = url
  }

  const res = await fetch(rawUrl)
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`)
  }

  const code = await res.text()
  const filename = pathname.split("/").filter(Boolean).pop() ?? "file"

  return { code, filename }
}
