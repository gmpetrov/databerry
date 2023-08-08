const cleanTextForEmbeddings = (text: string) => {
  return text?.trim()?.replace(/\n+/g, ` `);
};

export default cleanTextForEmbeddings;
