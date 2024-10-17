export type JSONContentType = { "Content-Type": "application/json" };

export type TextContentType = { "Content-Type": "text/html" };

export type ResponseContentType = JSONContentType | TextContentType;

export type ErrorContentType = { error: string };
