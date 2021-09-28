export interface ErrorResponseDetails {
  request?: Request;
  url: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  errors?: string[];
}
