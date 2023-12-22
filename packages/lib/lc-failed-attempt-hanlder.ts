// Current langchain implementation do not retry timeout errors
// https://github.com/langchain-ai/langchainjs/issues/2706
const STATUS_NO_RETRY = [
  400, // Bad Request
  401, // Unauthorized
  402, // Payment Required
  403, // Forbidden
  404, // Not Found
  405, // Method Not Allowed
  406, // Not Acceptable
  407, // Proxy Authentication Required
  409, // Conflict
];

// Modifies the defaultFailedAttemptHandler to make request timeouts retryable
const handler = (error: any) => {
  console.log('onFailedAttempt------------>', error);

  if (
    error.message.startsWith('Cancel') ||
    error.message.startsWith('AbortError') ||
    error.message.startsWith('ToolApprovalRequired') ||
    error.name === 'AbortError'
  ) {
    throw error;
  }

  if ((error as any)?.code === 'ECONNABORTED') {
    throw error;
  }

  const status = (error as any)?.response?.status ?? (error as any)?.status;
  if (status && STATUS_NO_RETRY.includes(+status)) {
    throw error;
  }

  if ((error as any)?.error?.code === 'insufficient_quota') {
    const err = new Error(error?.message);
    err.name = 'InsufficientQuotaError';
    throw err;
  }
};

export default handler;
