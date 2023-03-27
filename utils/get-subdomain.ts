const getSubdomain = (url: string) => {
  const subdomain = url?.split('.')[0];

  return subdomain;
};

export default getSubdomain;
