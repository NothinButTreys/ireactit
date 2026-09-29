import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer, type Plugin, type ViteDevServer } from 'vite';

type ApiModule = { POST: (request: Request) => Promise<Response> };
type Load = () => Promise<ApiModule>;

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Buffer));
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return new Request(`http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`, {
    method: req.method,
    headers,
    body: chunks.length ? Buffer.concat(chunks) : undefined,
  });
}

async function writeWebResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

function mount(middlewares: ViteDevServer['middlewares'], load: Load) {
  middlewares.use('/api/contact', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    try {
      const { POST } = await load();
      await writeWebResponse(res, await POST(await toWebRequest(req)));
    } catch (err) {
      next(err);
    }
  });
}

export function devApi(): Plugin {
  return {
    name: 'ireactit-dev-api',
    configureServer(server) {
      mount(server.middlewares, () => server.ssrLoadModule('/api/contact.ts') as Promise<ApiModule>);
    },
    configurePreviewServer(server) {
      let loader: Promise<ViteDevServer> | undefined;
      mount(server.middlewares, async () => {
        // Safe to load without a config (and so without Vite's `@/` alias resolver):
        // the server chain (api/**, src/features/contact/server/**, and the lib
        // files it depends on) only ever uses relative `.js` imports, enforced by
        // the eslint no-restricted-imports override and tsconfig.server.json.
        loader ??= createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
        return (await loader).ssrLoadModule('/api/contact.ts') as Promise<ApiModule>;
      });
    },
  };
}
