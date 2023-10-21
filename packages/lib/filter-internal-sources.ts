import { Source } from './types/document';

const filterInternalSources = (sources: Source[]) => {
  return (sources || [])?.filter(
    (each) =>
      !each?.source_url?.includes('s3.chaindesk.ai') &&
      !each?.source_url?.includes('databerry.s3.amazonaws.com') &&
      !each?.source_url?.includes('minio:9000')
  );
};

export default filterInternalSources;
