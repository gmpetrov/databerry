const addSlashUrl = (url: string) => {
  const urlObj = new URL(url);

  // Check if the pathname already ends with a slash
  if (!urlObj.pathname.endsWith('/')) {
    // If not, add a trailing slash to the pathname
    urlObj.pathname += '/';
  }

  return urlObj.toString();
};

export default addSlashUrl;
