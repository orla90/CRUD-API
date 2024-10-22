import { IncomingMessage, ServerResponse } from "http";
import url from "url";
import { BASE_URL, CONTENT_TYPE_JSON } from "../common/constants";
import { ErrorType } from "../common/enum/error-types.enum";
import { RequestType } from "../common/enum/request-types.enum";
import {
  handleGetRequest,
  handlePostRequest,
  handlePutRequest,
  handleDeleteRequest,
  sendResponse,
} from "./db";

export const requestHandler = (
  request: IncomingMessage,
  response: ServerResponse,
) => {
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
  } catch {
    sendResponse(response, 404, CONTENT_TYPE_JSON, {
      error: ErrorType.METHOD_NOT_ALLOWED,
    });
  }
};
