const MAX_FILE_BYTES = 500_000 // 500 KB

const ALLOWED_HOSTS = new Set(["github.com", "raw.githubusercontent.com"])

export async function fetchGitHubFile(url: string): Promise<{ code: string; filename: string }> {
  let parsed: URL
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
  } catch {
    throw new Error("Invalid URL")
  }

  const { hostname, pathname } = parsed

  if (!ALLOWED_HOSTS.has(hostname.toLowerCase())) {
    throw new Error("Only github.com or raw.githubusercontent.com URLs are accepted")
  }

  let rawUrl: string
  if (hostname === "github.com") {
    if (!pathname.includes("/blob/")) {
      throw new Error("URL must point to a specific file — include the branch and filename (e.g. /blob/main/server.js)")
    }
    rawUrl = "https://raw.githubusercontent.com" + pathname.replace("/blob/", "/")
  } else {
    rawUrl = url
  }

  const res = await fetch(rawUrl, { redirect: "error" })
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("File not found — check the URL points to an existing file in a public repo")
    }
    throw new Error(`Failed to fetch file (${res.status})`)
  }

  const contentLength = Number(res.headers.get("content-length") ?? 0)
  if (contentLength > MAX_FILE_BYTES) {
    throw new Error("File too large — maximum 500 KB")
  }

  const code = await res.text()
  if (code.length > MAX_FILE_BYTES) {
    throw new Error("File too large — maximum 500 KB")
  }

  const filename = pathname.split("/").filter(Boolean).pop() ?? "file"
  return { code, filename }
}
