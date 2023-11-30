const timeCodeToSeconds = (timecode: string) =>
  timecode.split(':').reduce((acc, val) => acc * 60 + parseInt(val), 0);

export default timeCodeToSeconds;
