import {
  JSONContentType,
  TextContentType,
} from "./types/response-content-types";

export const BASE_URL = "/api/users";

export const CONTENT_TYPE_JSON: JSONContentType = {
  "Content-Type": "application/json",
};

export const CONTENT_TYPE_TEXT: TextContentType = {
  "Content-Type": "text/html",
};
