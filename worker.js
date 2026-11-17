export default {
  async fetch(request, env) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;

    const pageUrl = new URL("/404", request.url);
    const page = await env.ASSETS.fetch(new Request(pageUrl, { method: "GET" }));
    if (!page.ok) return asset;

    const headers = new Headers(page.headers);
    headers.set("x-robots-tag", "noindex");
    return new Response(request.method === "HEAD" ? null : page.body, {
      status: 404,
      statusText: "Not Found",
      headers,
    });
  },
};
