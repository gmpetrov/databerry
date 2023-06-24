import { OAuth2Client } from 'google-auth-library';
import { drive_v3, google } from 'googleapis';

import { AcceptedDatasourceMimeTypes } from '@app/types/dtos';

const getAuth = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/integrations/google-drive/auth-callback`
  );

export class GoogleDriveManager {
  auth: OAuth2Client;
  drive: drive_v3.Drive;
  refreshToken?: string;
  accessToken?: string;

  constructor(props: { accessToken?: string; refreshToken?: string }) {
    this.auth = getAuth();

    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;

    this.auth.setCredentials({
      access_token: props.accessToken,
      refresh_token: props.accessToken,
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  static async fromCode(code: string) {
    const { tokens } = await getAuth().getToken(code);

    return new GoogleDriveManager({
      accessToken: tokens?.access_token!,
      refreshToken: tokens?.refresh_token!,
    });
  }

  async refreshAuth() {
    const { token } = await this.auth.getAccessToken();

    this.auth.setCredentials({
      access_token: token,
      refresh_token: this.refreshToken,
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });

    return this.auth;
  }

  async listDrives({
    pageSize,
    fields,
    pageToken,
  }: {
    pageSize?: number;
    pageToken?: string;
    fields?: string;
  }) {
    await this.refreshAuth();

    return this.drive.drives.list({
      // pageSize: pageSize || 100,
      // pageToken,
      fields: fields || 'nextPageToken, drives(id, name)',
    });
  }

  async listFilesRecursive({ folderId }: { folderId: string }) {
    await this.refreshAuth();

    const fileList = [] as drive_v3.Schema$File[];

    const mimeTypeFilter = [
      'application/vnd.google-apps.folder',
      ...AcceptedDatasourceMimeTypes,
    ]
      .map((each) => `mimeType='${each}'`)
      .join(' or ');

    const processFiles = async (folderId: string, pageToken?: string) => {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and (${mimeTypeFilter})`,
        fields: 'files(id, name, mimeType, modifiedTime)',
      });

      const files = response?.data?.files || [];

      for (const file of files) {
        if (
          file.mimeType === 'application/vnd.google-apps.folder' &&
          file?.id
        ) {
          await processFiles(file?.id);
        } else if (file?.id) {
          fileList.push(file);
        }
      }

      const nextPageToken = response.data.nextPageToken;

      if (nextPageToken) {
        await processFiles(folderId, nextPageToken);
      }
    };

    await processFiles(folderId);

    return fileList;
  }

  async listFolder({
    search,
    folderId,
    pageSize,
    fields,
    pageToken,
  }: {
    folderId?: string;
    search?: string;
    pageSize?: number;
    pageToken?: string;
    fields?: string;
  }) {
    await this.refreshAuth();

    const mimeTypeFilter = [
      'application/vnd.google-apps.folder',
      ...AcceptedDatasourceMimeTypes,
    ]
      .map((each) => `mimeType='${each}'`)
      .join(' or ');

    return this.drive.files.list({
      pageSize: pageSize || 100,
      pageToken,
      orderBy: 'name asc',
      q: `${folderId ? `'${folderId}'` : `'root'`} in parents${
        search ? ` and name contains '${search}'` : ''
      } and (${mimeTypeFilter})`,
      // q: "mimeType='application/vnd.google-apps.folder'",
      fields:
        fields ||
        'nextPageToken, files(id, name, mimeType, modifiedTime, size)',
    });
  }
}
