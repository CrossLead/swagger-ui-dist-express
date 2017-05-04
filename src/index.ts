import * as express from 'express';
import * as resolve from 'resolve';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

export default function createServer(opts: {
  url?: string;
  spec?: any;
  oauth2RedirectUrl?: string;
  dom_id?: string;
  operationsSorter?: 'alpha' | 'method' | Function
  validationUrl?: string,
  layout?: string;
} = {}): express.Express {
  if (!opts.url && !opts.spec) throw new Error(`Must provide a url or a spec`);

  const app = express();

  const staticFolder = path.dirname(resolve.sync('swagger-ui-dist', {
    packageFilter(pkg, pkgfile) {
      pkg.main = pkg.main.replace('dist/', '');
      return pkg;
    }
  }));

  const $ = cheerio.load(
    fs.readFileSync(
      path.join(staticFolder, 'index.html')
    ).toString()
  );

  /**
   * rewrite init function
   */
  $('script:last-child').replaceWith(`
    <script>
      window.onload = function() {
        // Build a system
        var ui = SwaggerUIBundle({
          url: "${opts.url}",
          spec: ${opts.spec ? JSON.stringify(opts.spec) : 'undefined'},
          dom_id: '${opts.dom_id || '#swagger-ui'}',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "${opts.layout || 'StandaloneLayout'}"
        })

        window.ui = ui
      }
    </script>
  `);

  const index = $.html();
  const send = (req: express.Request, res: express.Response) => res.send(index);

  app.get('/', send);
  app.get('/index.html', send);
  app.use(express.static(staticFolder));

  return app;
}