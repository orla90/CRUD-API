import { BASE_URL, CONTENT_TYPE_JSON } from "../common/constants";
import { User } from "../common/models/user";
import { v4 as uuidv4, validate as isUuid } from "uuid";
import { IncomingMessage, ServerResponse } from "http";
import { UrlWithParsedQuery } from "url";
import {
  ErrorContentType,
  ResponseContentType,
} from "../common/types/response-content-types";
import { ErrorType } from "../common/enum/error-types.enum";
import cluster from "cluster";

let users: User[] = [];

export const isUuidValid = (id = "") => isUuid(id);

export const sendResponse = (
  response: ServerResponse,
  statusCode: number,
  contentType: ResponseContentType,
  payload: User | User[] | string | ErrorContentType,
) => {
  response.writeHead(statusCode, contentType);
  response.end(typeof payload === "string" ? payload : JSON.stringify(payload));
};

export const handleGetRequest = (
  request: IncomingMessage,
  response: ServerResponse,
  parsedUrl: UrlWithParsedQuery,
) => {
  try {
    if (cluster.isWorker && process.send) {
      process.send({ type: "state", data: users });
    }

    if (parsedUrl.path === BASE_URL) {
      sendResponse(response, 200, CONTENT_TYPE_JSON, users);
    } else if (parsedUrl.path?.startsWith(BASE_URL + "/")) {
      const userId =
        (Array.isArray(parsedUrl.query.id)
          ? parsedUrl.query.id[0]
          : parsedUrl.query.id) || parsedUrl.pathname?.split("/").pop();
      const user = userId ? getUserById(userId) : null;

      if (user && isUuidValid(userId)) {
        sendResponse(response, 200, CONTENT_TYPE_JSON, user);
        return;
      } else if (user && !isUuidValid(userId)) {
        sendResponse(response, 400, CONTENT_TYPE_JSON, {
          error: ErrorType.INVALID_USER_ID,
        });
      } else {
        sendResponse(response, 404, CONTENT_TYPE_JSON, {
          error: ErrorType.USER_NOT_FOUND,
        });
      }
    } else {
      sendResponse(response, 404, CONTENT_TYPE_JSON, {
        error: `Endpoint ${parsedUrl.path} not found`,
      });
    }
  } catch {
    sendResponse(response, 500, CONTENT_TYPE_JSON, {
      error: ErrorType.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getUserById = (userId: string) => {
  if (cluster.isWorker && process.send) {
    process.send({ type: "state", data: users });
  }
  return users.find((user) => user.id === userId);
};

export const handlePostRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  try {
    let requestBody = "";

    request.on("data", (chunk: string) => {
      requestBody += chunk;
    });

    request.on("end", () => {
      try {
        const user = JSON.parse(requestBody);
        if (user && user.username && user.age && user.hobbies) {
          user.id = uuidv4();
          users.push(user);
          if (cluster.isWorker && process.send) {
            process.send({ type: "state", data: users });
          }
          sendResponse(response, 201, CONTENT_TYPE_JSON, user);
          return;
        } else {
          const emptyFields = ["username", "age", "hobbies"].reduce(
            (result: string[], prop: string) => {
              if (!user[prop]) result.push(prop);
              return result;
            },
            [],
          );

          sendResponse(response, 400, CONTENT_TYPE_JSON, {
            error: `${ErrorType.MISSING_REQUIRED_FIELDS} ${emptyFields.join(", ")}`,
          });
        }
      } catch {
        sendResponse(response, 400, CONTENT_TYPE_JSON, {
          error: ErrorType.INVALID_JSON_BODY,
        });
      }
    });
  } catch {
    sendResponse(response, 500, CONTENT_TYPE_JSON, {
      error: ErrorType.INTERNAL_SERVER_ERROR,
    });
  }
};

export const handlePutRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  parsedUrl: UrlWithParsedQuery,
) => {
  try {
    let requestBody = "";

    request.on("data", (chunk: string) => {
      requestBody += chunk;
    });

    request.on("end", () => {
      try {
        const user = JSON.parse(requestBody);
        if (user.username && user.age && user.hobbies) {
          const userId = parsedUrl.path?.split("/").pop();
          const userIndex = users.findIndex((user) => user.id === userId);

          if (userIndex !== -1 && isUuidValid(userId)) {
            users[userIndex] = {
              ...users[userIndex],
              ...user,
            };
            if (cluster.isWorker && process.send) {
              process.send({ type: "state", data: users });
            }
            sendResponse(response, 200, CONTENT_TYPE_JSON, users[userIndex]);
            return;
          }
          if (userIndex !== -1 && !isUuidValid(userId)) {
            sendResponse(response, 400, CONTENT_TYPE_JSON, {
              error: ErrorType.INVALID_USER_ID,
            });
          } else {
            sendResponse(response, 404, CONTENT_TYPE_JSON, {
              error: ErrorType.USER_NOT_FOUND,
            });
          }
        } else {
          const emptyFields = ["username", "age", "hobbies"].reduce(
            (result: string[], prop: string) => {
              if (!user[prop]) result.push(prop);
              return result;
            },
            [],
          );

          sendResponse(response, 400, CONTENT_TYPE_JSON, {
            error: `${ErrorType.MISSING_REQUIRED_FIELDS} ${emptyFields.join(", ")}`,
          });
        }
      } catch {
        sendResponse(response, 400, CONTENT_TYPE_JSON, {
          error: ErrorType.INVALID_JSON_BODY,
        });
      }
    });
  } catch {
    sendResponse(response, 500, CONTENT_TYPE_JSON, {
      error: ErrorType.INTERNAL_SERVER_ERROR,
    });
  }
};

export const handleDeleteRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  parsedUrl: UrlWithParsedQuery,
) => {
  try {
    const userId = parsedUrl.path?.split("/").pop();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex !== -1 && isUuidValid(userId)) {
      if (cluster.isWorker && process.send) {
        process.send({ type: "state", data: users });
      }
      sendResponse(
        response,
        204,
        CONTENT_TYPE_JSON,
        users.splice(userIndex, 1)[0],
      );
      return;
    } else if (userIndex !== -1 && !isUuidValid(userId)) {
      sendResponse(response, 400, CONTENT_TYPE_JSON, {
        error: ErrorType.INVALID_USER_ID,
      });
    } else {
      sendResponse(response, 404, CONTENT_TYPE_JSON, {
        error: ErrorType.USER_NOT_FOUND,
      });
    }
  } catch {
    sendResponse(response, 500, CONTENT_TYPE_JSON, {
      error: ErrorType.INTERNAL_SERVER_ERROR,
    });
  }
};

export const updateUsers = (newUsers: User[]): void => {
  try {
    users = newUsers;
  } catch {
    console.log(ErrorType.COMMON_ERROR);
  }
};
