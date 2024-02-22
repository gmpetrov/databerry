export default function isUrlBlocked(url: string, patterns: string[]) {
  // Convert wildcard patterns to regex
  const regexPatterns = patterns.map(
    (pattern) =>
      new RegExp(
        '^' +
          pattern
            .replace(/\./g, '\\.') // Escape dots
            .replace(/\*/g, '.*') + // Convert * to .*
          '$'
      )
  );

  try {
    const parsedUrl = new URL(url);

    // Combine parts of the URL for thorough matching
    const fullUrl = parsedUrl.href; // Full URL
    const domainAndPath = `${parsedUrl.hostname}${parsedUrl.pathname}`;

    // Check if the URL matches any of the regex patterns
    return regexPatterns.some(
      (regex) => regex.test(fullUrl) || regex.test(domainAndPath)
    );
  } catch (error) {
    console.error('Error parsing URL:', error);
    return false;
  }
}
