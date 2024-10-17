import * as dotenv from 'dotenv'
import http, { IncomingMessage, ServerResponse } from 'http'
import { resolve } from 'path'
import { cwd } from 'process'
import url from 'url';
import { RequestType } from './common/enum/request-types.enum';
import { BASE_URL, CONTENT_TYPE_JSON } from './common/constants';

dotenv.config({ path: resolve(cwd(), '.env') });

const server = http.createServer((request: IncomingMessage, response: ServerResponse) => {
  const parsedUrl = url.parse(request.url || '', true);

  if (request.method === RequestType.GET) {
    handleGetRequest(request, response, parsedUrl);
  } else if (request.method === RequestType.POST && parsedUrl.path === BASE_URL) {
    handlePostRequest(request, response);
  } else if (request.method === RequestType.PUT && parsedUrl.path?.startsWith(BASE_URL + '/')) {
    handlePutRequest(request, response, parsedUrl);
  } else if (request.method === RequestType.DELETE && parsedUrl.path?.startsWith(BASE_URL + '/')) {
    handleDeleteRequest(request, response, parsedUrl);
  } else {
    sendResponse(response, 404, CONTENT_TYPE_JSON, { error: 'Method not allowed' });
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on ${ process.env.PORT }`);
});

