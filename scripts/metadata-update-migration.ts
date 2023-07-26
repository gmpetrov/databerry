import axios from 'axios';
import mime from 'mime-types';
import pMap from 'p-map';
import pRetry, { AbortError } from 'p-retry';

import arraySplitChunks from '@app/utils/array-split-chunks';
import prisma from '@app/utils/prisma-client';

import { FileMetadataSchema } from '../types/document';
import getS3RootDomain from '../utils/get-s3-root-domain';
import { GoogleDriveManager } from '../utils/google-drive-manager';

/*
    // - rename source to source_url
    // - rename file_type to mime_type
    // - rename source_type to datasource_type
    - add datasource_type
    - add datasource_name
    - add mime_type
    - set source_url to url of datasource if any
*/

(async () => {
  const res = await prisma.appDatasource.findMany({
    where: {
      type: {
        not: 'file',
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    skip: 40438,
  });

  const ids = res.map((each) => each.id);
  // const ids = ['cljijcssp000ua50ub2oc6ta3'];

  const batches = arraySplitChunks(ids, 1000);

  console.log('DATABASE_URL', process.env.DATABASE_URL);
  console.log('QDRANT_API_URL', process.env.QDRANT_API_URL);
  console.log(`getS3RootDomain()`, getS3RootDomain());
  console.log(`${ids.length} Datasources to process`);
  console.log(`${batches.length} Batch to process`);

  let counter = 0;

  const step = 15;

  await pMap(
    batches,
    async (batch) => {
      const datasources = await prisma.appDatasource.findMany({
        where: {
          id: {
            in: batch,
          },
        },
        include: {
          serviceProvider: true,
        },
      });

      // await prisma.$transaction(
      //   async (tx) => {
      await pMap(
        datasources,
        async (ds) => {
          let metadata = ({ ...(ds?.config as object) } ||
            {}) as FileMetadataSchema;
          let dsMetadata = { ...metadata } as any;

          if ((metadata as any).source) {
            metadata.source_url = (metadata as any).source;
            delete (metadata as any).source;
            delete (dsMetadata as any).source;
          }

          if ((metadata as any).type) {
            metadata.mime_type = (metadata as any).type;
            delete (metadata as any).type;
          }

          if ((metadata as any).source_type) {
            metadata.datasource_type = (metadata as any).source_type;
            delete (metadata as any).source_type;
          }

          metadata.datasource_name = ds.name;

          if (ds.type === 'file') {
            const ext = mime.extension(
              (ds?.config as any)?.type || (ds?.config as any)?.mime_type
            );

            const s3Key = `datastores/${ds.datastoreId}/${ds.id}/${ds.id}.${ext}`;

            metadata.source_url = `${getS3RootDomain()}/${s3Key}`;
          } else if (ds.type === 'google_drive_file') {
            try {
              const fileId = (ds as any)?.config?.objectId as string;

              const driveManager = new GoogleDriveManager({
                accessToken: ds?.serviceProvider?.accessToken!,
                refreshToken: ds?.serviceProvider?.refreshToken!,
              });

              await driveManager.refreshAuth();

              const {
                data: { webViewLink },
              } = await driveManager.drive.files.get({
                fileId: fileId,
                fields: 'webViewLink',
              });

              metadata.source_url = webViewLink as string;
            } catch (err) {
              console.log(err);
            }
          }

          // Patch metadata of datasource
          if (metadata.source_url) {
            dsMetadata.source_url = metadata.source_url;
            delete dsMetadata.source;
          }
          if (metadata.mime_type) {
            dsMetadata.mime_type = metadata.mime_type;
            delete dsMetadata.type;
          }

          const runUpdate = async () => {
            const qdrantClient = axios.create({
              baseURL: process.env.QDRANT_API_URL,
              headers: {
                'api-key': process.env.QDRANT_API_KEY,
              },
            });

            const updateQdrant = async () => {
              await qdrantClient.post(
                '/collections/text-embedding-ada-002/points/payload',
                {
                  payload: {
                    ...metadata,
                    datasource_type: ds.type,
                    source: null,
                    file_type: null,
                    source_type: null,
                    objectId: null,
                    serviceProviderId: null,
                    sitemap: null,
                  },
                  filter: {
                    must: [
                      {
                        key: 'datasource_id',
                        match: { value: ds.id },
                      },
                    ],
                  },
                }
              );
            };

            const updateDB = async () => {
              await prisma.appDatasource.update({
                where: {
                  id: ds.id,
                },
                data: {
                  config: {
                    ...dsMetadata,
                  },
                },
              });
            };

            if (dsMetadata?.source_url?.includes('minio:9000')) {
              console.log('dsMetadata', dsMetadata);
            }
            await Promise.all([
              await pRetry(updateQdrant, {
                retries: 10,
              }),

              await pRetry(updateDB, {
                retries: 10,
              }),
            ]);
          };

          await pRetry(runUpdate, {
            retries: 0,
          });

          counter += 1;
          console.log(`Processed ${counter}/${ids.length} Datasources`);
        },
        {
          // concurrency: batch.length,
          concurrency: step,
        }
      );

      // counter += batch.length;
      // console.log(`Processed ${counter}/${ids.length} Datasources`);
      //   },
      //   {
      //     maxWait: 6000000000,
      //     timeout: 6000000000,
      //   }
      // );
    },
    {
      concurrency: 1,
    }
  );

  console.log('✅ Done');
})();

// BEFORE
// {
//   "id": "0040f8d7-d9ea-4118-9822-e19adec1dbe9",
//   "payload": {
//       "chunk_hash": "8dc19a5ba70d350776b10f16abe2dab51447905a247dcd21df3d050e3b22553f",
//       "chunk_offset": 15,
//       "datasource_hash": "0a7447fb8b01dc249398e9827b7dce5f23aefb3291adacf7b4fcd9f2a0ac9a74",
//       "datasource_id": "cljmzikbs00003b70qmn9ioay",
//       "datastore_id": "cljijc8et00110ujo456r09bg",
//       "source": "Arthera BlazeDAG Yellow Paper.pdf",
//       "tags": [],
//       "text": "\n \nsteps/timers\n \nare\n \nneeded,\n \nallowing the consensus to progress as fast as\n\npossible and speeding up block finality.\n\nWhile Arthera draws on recent work from Narwhal and Tusk, Bullshark, and Fin, it does not\n\nfully adhere to them. The proposed architecture is optimized to spread transactions using a\n\nDAG structure at network speed to achieve remarkably high transaction throughput. To\n\ndetermine the total order of accumulated transactions, network participants interpret their\n\nDAG locally without exchanging any messages. As long as the DAG transport can provide\n\nreliable and causally ordered transaction dissemination, consensus can be reached in a\n\nsimple manner.\n\nWe show that a DAG transport is sufficient to solve most of the BFT consensus problem by\n\nenabling\n \nreliable,\n \ncausally\n \nordered\n \nbroadcast\n \nof\n \ntransactions.\n \nMoreover,\n \nusing\n \na\n \nDAG\n\ntransport that adheres to these rules, a partial synchrony model to achieve BFT consensus\n\non the"
//   },
//   "vector": null
// },
