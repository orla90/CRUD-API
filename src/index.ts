import * as dotenv from "dotenv";
import http, { IncomingMessage, ServerResponse } from "http";
import { resolve } from "path";
import { cwd } from "process";
import url from "url";
import {
  handleGetRequest,
  handlePostRequest,
  handlePutRequest,
  handleDeleteRequest,
  sendResponse,
} from "./db";
import { RequestType } from "./common/enum/request-types.enum";
import { BASE_URL, CONTENT_TYPE_JSON } from "./common/constants";
import { ErrorType } from "./common/enum/error-types.enum";

dotenv.config({ path: resolve(cwd(), ".env") });

const requestHandler = (request: IncomingMessage, response: ServerResponse) => {
  const parsedUrl = url.parse(request.url || "", true);

  try {
    if (request.method === RequestType.GET) {
      handleGetRequest(request, response, parsedUrl);
    } else if (
      request.method === RequestType.POST &&
      parsedUrl.path === BASE_URL
    ) {
      handlePostRequest(request, response);
    } else if (
      request.method === RequestType.PUT &&
      parsedUrl.path?.startsWith(BASE_URL + "/")
    ) {
      handlePutRequest(request, response, parsedUrl);
    } else if (
      request.method === RequestType.DELETE &&
      parsedUrl.path?.startsWith(BASE_URL + "/")
    ) {
      handleDeleteRequest(request, response, parsedUrl);
    } else {
      sendResponse(response, 404, CONTENT_TYPE_JSON, {
        error: ErrorType.METHOD_NOT_ALLOWED,
      });
    }
  } catch(err) {
    sendResponse(response, 404, CONTENT_TYPE_JSON, { error: ErrorType.METHOD_NOT_ALLOWED });
  }
}

export const server = http.createServer(requestHandler);

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${ process.env.PORT }`);
});
