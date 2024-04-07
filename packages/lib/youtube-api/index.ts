import axios from 'axios';
import { load } from 'cheerio';
import { google } from 'googleapis';
import { TranscriptResponse } from 'youtube-transcript';

import { YOUTUBE_VIDEO_URL_RE } from './lib';
import {
  // TranscriptResponse,
  YoutubeTranscript,
} from './youtube-transcript-fix';

export type YoutubeTranscriptType = {
  text: string;
  duration: number;
  offset: number;
};

export type YoutubeVideoMetadata = {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
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

  static async getVideoMetadataWithoutApiKeys(videoId: string) {
    const response = await axios.get(
      `https://youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`
    );

    return response?.data as YoutubeVideoMetadata;
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
    const match = url.match(YOUTUBE_VIDEO_URL_RE);

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

  static async getVideoHTML(videoId: string) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const { data } = await axios.get(url);
    return data;
  }

  static async _getVideoCategory(html: string) {
    // Autos & Vehicles
    // Comedy
    // Education
    // Entertainment
    // Film & Animation
    // Gaming
    // Howto & Style
    // Music
    // News & Politics
    // Nonprofits & Activism
    // People & Blogs
    // Pets & Animals
    // Science & Technology
    // Sports
    // Travel & Events

    try {
      const $ = load(html);
      const scripts = $('script');
      let category = null as string | null;

      scripts.each((i: any, el: any) => {
        const scriptContent = $(el).html();
        if (scriptContent?.includes?.('"category"')) {
          const jsonMatch = scriptContent.match(/"category": ?"([^"]+)"/);
          if (jsonMatch && jsonMatch[1]) {
            category = jsonMatch[1];
            return false; // Break the loop
          }
        }
      });

      return category
        ? Buffer.from(category.replace(/\\u0026/, '&')).toString('utf-8')
        : category;
    } catch (error) {
      console.error('Error fetching page:', error);
      return null;
    }
  }

  static async getVideoCategory(videoId: string) {
    const html = await YoutubeApi.getVideoHTML(videoId);
    return YoutubeApi._getVideoCategory(html);
  }

  static async _getVideoKeywords(html: string) {
    try {
      const $ = load(html);

      return ($('meta[name="keywords"]').attr('content') || '').split(',');
    } catch (error) {
      console.error('Error fetching page:', error);
      return [];
    }
  }

  static async getVideoKeywords(videoId: string) {
    const html = await YoutubeApi.getVideoHTML(videoId);
    return YoutubeApi._getVideoKeywords(html);
  }

  static async getVideoMetadataFromHTML(videoId: string) {
    const html = await YoutubeApi.getVideoHTML(videoId);

    const category = await YoutubeApi._getVideoCategory(html);
    const keywords = await YoutubeApi._getVideoKeywords(html);

    return { category, keywords };
  }
}
