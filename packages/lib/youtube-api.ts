import { google } from 'googleapis';
import { TranscriptResponse, YoutubeTranscript } from 'youtube-transcript';

export type YoutubeTranscriptType = {
  text: string;
  duration: number;
  offset: number;
};

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

  async getVideoSnippetById(videoId: string) {
    const video = await this.Youtube.search.list({
      part: 'snippet',
      q: videoId,
      type: 'video',
      maxResults: 1,
    });
    return video?.data?.items?.[0]?.snippet;
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

  async getYoutubeDatasourceName(url: string) {
    const type = YoutubeApi.getYoutubeLinkType(url);

    switch (type) {
      case 'channel':
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
        return channel?.data?.items[0]?.snippet?.title;
      case 'playlist':
        const playlistId = YoutubeApi.extractPlaylistId(url);
        if (!playlistId) {
          throw new Error('Unexpected Error occured, unable to get playlistId');
        }
        const playlistData = await this.Youtube.playlists.list({
          id: playlistId,
          part: 'snippet',
        });

        const { title, channelTitle } = playlistData?.data?.items?.[0]?.snippet;

        return `${channelTitle} - ${title}`;

        break;
      default:
        throw new Error('Uknown content type.');
    }
  }

  static async transcribeVideo(url: string): Promise<YoutubeTranscriptType[]> {
    return YoutubeTranscript.fetchTranscript(url);
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

  static extractVideoId(url: string) {
    const regex = /(?:\?v=|&v=|youtu\.be\/)([^&#]+)/;
    const match = url.match(regex);

    return match ? match[1] : null;
  }

  static groupTranscriptsBySeconds(props: {
    nbSeconds: number;
    transcripts: TranscriptResponse[];
  }) {
    const groups = [] as { text: string; offset: number }[];

    let counter = 0;
    let obj = { offset: 0, text: '' } as (typeof groups)[0];
    for (const each of props.transcripts) {
      const duration = Math.ceil(each.duration / 1000);

      if (counter === 0) {
        obj.offset = each.offset;
      }

      if (counter < props.nbSeconds) {
        obj.text += each.text;
        counter += duration;
      } else {
        groups.push(obj);
        obj = { offset: 0, text: '' };
        counter = 0;
      }
    }
    return groups;
  }
}
