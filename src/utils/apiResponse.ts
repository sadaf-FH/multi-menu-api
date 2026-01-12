export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: number;
  meta?: Record<string, any>;
}

export interface SuccessResponse {
  code?: number;
  message?: string;
  key?: string;
}

export class ApiResponseBuilder<T = unknown> {
  private response: ApiResponse<T> = {
    success: true,
  };

  success(messageOrObj?: string | SuccessResponse) {
    this.response.success = true;

    if (typeof messageOrObj === 'string') {
      this.response.message = messageOrObj;
    } else if (messageOrObj) {
      this.response.message = messageOrObj.message;
      this.response.meta = { ...this.response.meta, key: messageOrObj.key };
    }

    return this;
  }

  failure(error: string) {
    this.response.success = false;
    this.response.error = error;
    return this;
  }

  withData(data: T) {
    this.response.data = data;
    return this;
  }

  withMeta(meta: Record<string, any>) {
    this.response.meta = { ...this.response.meta, ...meta };
    return this;
  }

  withCode(code: number) {
    this.response.code = code;
    return this;
  }

  build(): ApiResponse<T> {
    return this.response;
  }
}
