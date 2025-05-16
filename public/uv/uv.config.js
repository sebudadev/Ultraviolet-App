self.__uv$config = {
  prefix: '/service/',
  encodeUrl: Ultraviolet.codec.xor.encode, // or whatever encode function you use
  bare: '/bare/',
  handler: '/uv.handler.js',
  client: '/uv.client.js',
  bundle: '/uv.bundle.js',
  config: '/uv.config.js'
};