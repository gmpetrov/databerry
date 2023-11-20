import { google } from 'googleapis';

import { DatasourceType } from '@chaindesk/prisma';
export default class YoutubeApi {
  // TODO: remove any when google types are fixed
  private Youtube: ReturnType<typeof google.youtube> | any;

  constructor() {
    this.Youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY,
    });
  }

  async getVideosForChannel(url: string) {
    const handle = YoutubeApi.extractHandle(url);
    if (!handle) {
      throw new Error('Invalid Channel Url!');
    }
    const channel = await this.Youtube.search.list({
      part: 'snippet',
      q: handle,
      type: 'channel',
      maxResults: 1,
    });

    const channelId = channel.data.items[0].snippet.channelId;

    const res = await this.Youtube.channels.list({
      part: 'snippet,contentDetails,id',
      id: channelId,
      max_results: 50,
    });

    const uploadId = res.data.items[0].contentDetails.relatedPlaylists.uploads;

    return this.getVideosForUpload(uploadId);
  }

  async getVideosForPlaylist(url: string) {
    const playlistId = YoutubeApi.extractPlaylistId(url);
    if (!playlistId) {
      throw new Error('Unexpected Error occured, unable to get playlistId');
    }

    return this.getVideosForUpload(playlistId);
  }

  async getVideosForUpload(uploadId: string) {
    let nextPageToken = undefined;
    let videos: {
      id: string;
      title: string;
    }[] = [];

    do {
      try {
        const paginatedRes: any = await this.Youtube.playlistItems.list({
          part: 'snippet,contentDetails',
          playlistId: uploadId,
          max_results: 50,
          pageToken: nextPageToken,
        });

        videos = [
          ...videos,
          ...paginatedRes.data.items.map((item: any) => ({
            id: item?.contentDetails?.videoId,
            title: item?.snippet?.title,
          })),
        ];
        nextPageToken = paginatedRes?.data.nextPageToken;
      } catch (e) {
        console.error(e);
        break;
      }
    } while (nextPageToken);
    return videos;
  }

  static getYoutubeLinkType(url: string): 'channel' | 'playlist' | 'unknown' {
    const channelRegex = /youtube\.com\/@/;
    const playlistRegex = /list=([a-zA-Z0-9_-]+)/;

    if (channelRegex.test(url)) {
      return 'channel';
    } else if (playlistRegex.test(url)) {
      return 'playlist';
    } else {
      return 'unknown';
    }
  }

  static extractHandle(url: string) {
    const regex = /https:\/\/www\.youtube\.com\/@([^\/]+)/;
    const match = url.match(regex);

    return match ? match[1] : null;
  }

  static extractPlaylistId(url: string) {
    const regex = /(?:\?|\&)list=([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);

    return match ? match[1] : null;
  }
}
