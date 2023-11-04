import cuid from 'cuid';

import {
  DatasourceStatus,
  DatasourceType,
  SubscriptionPlan,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

import accountConfig from '../account-config';
import { GoogleDriveManager } from '../google-drive-manager';
import triggerTaskLoadDatasource from '../trigger-task-load-datasource';
import { AppDocument } from '../types/document';
import { DatasourceGoogleDrive } from '../types/models';

import { DatasourceLoaderBase } from './base';

export class GoogleDriveFolderLoader extends DatasourceLoaderBase<DatasourceGoogleDrive> {
  isGroup = true;

  async getSize(text: string) {
    // return new Blob([text]).size;
    return 0;
  }

  async load() {
    const driveManager = new GoogleDriveManager({
      accessToken: this.datasource?.serviceProvider?.accessToken!,
      refreshToken: this.datasource?.serviceProvider?.refreshToken!,
    });

    const currentPlan =
      this.datasource?.organization?.subscriptions?.[0]?.plan ||
      SubscriptionPlan.level_0;

    await driveManager.refreshAuth();

    const files = (
      await driveManager.listFilesRecursive({
        folderId: this.datasource?.config?.objectId as string,
      })
    )?.filter(
      (each) =>
        Number(each.size || 0) < accountConfig[currentPlan]?.limits?.maxFileSize
    );

    const children = await prisma.appDatasource.findMany({
      where: {
        groupId: this.datasource?.id,
      },
      select: {
        id: true,
        config: true,
      },
    });

    const fileIds = files.map((f) => f.id);

    const ids = files.map((f) => {
      const found = children.find(
        (each) => (each as any)?.config?.objectId === f.id
      );

      if (found) {
        return found.id;
      }

      return cuid();
    });

    const childrenIdsToDelete =
      children
        ?.filter((each) => !fileIds?.includes((each as any)?.config?.objectId))
        ?.map((each) => each.id) || [];

    if (childrenIdsToDelete?.length > 0) {
      await prisma.appDatasource.deleteMany({
        where: {
          id: {
            in: childrenIdsToDelete,
          },
        },
      });
    }

    await prisma.appDatasource.createMany({
      data: files.map((each, idx) => ({
        id: ids[idx],
        type: DatasourceType.google_drive_file,
        name: each?.name!,
        config: {
          objectId: each?.id,
          tags: this.datasource?.config?.tags || [],
        },
        organizationId: this.datasource?.organizationId,
        datastoreId: this.datasource?.datastoreId,
        groupId: this.datasource?.id,
        serviceProviderId: this.datasource?.serviceProviderId,
      })),
      skipDuplicates: true,
    });

    await triggerTaskLoadDatasource(
      [...ids].map((id) => ({
        organizationId: this.datasource?.organizationId!,
        datasourceId: id,
        priority: 10,
      }))
    );

    await prisma.appDatasource.update({
      where: {
        id: this.datasource.id,
      },
      data: {
        status: DatasourceStatus.synched,
      },
    });

    return [] as AppDocument[];
  }
}
