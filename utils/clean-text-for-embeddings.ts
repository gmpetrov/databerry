const cleanTextForEmbeddings = (text: string) => {
  return text
    ?.trim()
    ?.replace(/\t+/g, '')
    ?.replace(/\n+/g, ` `)
    ?.replace(/\s+/g, ` `);
};

export default cleanTextForEmbeddings;
