const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/v1',
      },
      onProxyReq: function(proxyReq, req, res) {
        // Log request path
        console.log('Proxy request path:', proxyReq.path);
      },
      onProxyRes: function(proxyRes, req, res) {
        // Log response status
        console.log('Proxy response status:', proxyRes.statusCode);
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};