'use client';

import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import { Avatar, Card, Stack, Typography } from '@mui/joy';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionGroup from '@mui/joy/AccordionGroup';
import AccordionSummary from '@mui/joy/AccordionSummary';
import React from 'react';

type Props = {};

const Stars = () => (
  <Stack direction="row" gap={0.25}>
    <StarRateRoundedIcon sx={{ color: 'gold' }} />
    <StarRateRoundedIcon sx={{ color: 'gold' }} />
    <StarRateRoundedIcon sx={{ color: 'gold' }} />
    <StarRateRoundedIcon sx={{ color: 'gold' }} />
    <StarRateRoundedIcon sx={{ color: 'gold' }} />
  </Stack>
);

function Body() {
  return (
    <Stack
      sx={{ pt: 12, px: 2, maxWidth: 'md', width: '100%', mx: 'auto' }}
      gap={12}
    >
      <Stack gap={1}>
        <Typography level="h2">How to Summarize YouTube Videos?</Typography>
        <Typography level="body-md">
          Easily generate a YouTube summary in 3 simple steps
        </Typography>

        <Stack sx={{ mt: 2, gap: 2 }}>
          <Card size="sm">
            <Typography level="h3">
              Step 1: Copy the YouTube Video URL
            </Typography>

            <Typography level="body-md">
              Copy the URL of the YouTube video you want to summarize and paste
              it in the summarizer form.
            </Typography>
          </Card>
          <Card size="sm">
            <Typography level="h3">Step 2: Generate the Summary</Typography>

            <Typography level="body-md">
              {`Simply click the "Summarize" button and our AI summarizer will generate a summary of the video in seconds.`}
            </Typography>
          </Card>
          <Card size="sm">
            <Typography level="h3">Step 3: Enjoy your Summary</Typography>

            <Typography level="body-md">
              {`Now you can read the summary of the video and get the main points without watching the entire video. Click on paragraphs to see the video segment!`}
            </Typography>
          </Card>
        </Stack>
      </Stack>
      <Stack gap={1}>
        <Typography level="h2">YouTube Summarizer Use Cases</Typography>
        <Typography level="body-md">
          Ideal for students, researchers, and YouTubers of all kinds
        </Typography>

        <Stack sx={{ mt: 2, gap: 2 }}>
          <Card size="sm">
            <Typography
              level="h3"
              startDecorator={
                <Avatar>
                  <SchoolRoundedIcon />
                </Avatar>
              }
            >
              For Students
            </Typography>

            <Typography level="body-md">
              Stay ahead with your studies by efficiently summarizing lectures
              and tutorials from YouTube videos.
            </Typography>
          </Card>
          <Card size="sm">
            <Typography
              level="h3"
              startDecorator={
                <Avatar>
                  <WorkRoundedIcon />
                </Avatar>
              }
            >
              For Professionals
            </Typography>

            <Typography level="body-md">
              Quickly summarize YouTube videos to stay informed, extract
              essential insights for efficient decision-making, and enhance your
              productivity with our AI-powered video summarizer.
            </Typography>
          </Card>
          <Card size="sm">
            <Typography
              level="h3"
              startDecorator={
                <Avatar>
                  <ScienceRoundedIcon />
                </Avatar>
              }
            >
              For Researchers
            </Typography>

            <Typography level="body-md">
              Effortlessly summarize YouTube videos to gather key information,
              extract critical insights for your studies, and boost your
              research efficiency with our AI-powered video summarizer.
            </Typography>
          </Card>
        </Stack>
      </Stack>
      <Stack gap={1}>
        <Typography level="h2">User Reviews</Typography>
        <Typography level="body-md">
          Simply the best YouTube video summarizer out there
        </Typography>

        <Stack sx={{ mt: 2, gap: 2 }}>
          <Card size="sm">
            <Stars />
            <Typography
              level="body-lg"
              sx={{ fontStyle: 'italic', fontWeight: 'md' }}
            >
              This AI YouTube video summarizer is a game-changer! As a student,
              it saves me so much time. The summaries are accurate and help me
              quickly understand complex topics. Highly recommend!
            </Typography>
            <Typography level="body-md">Emily R.</Typography>
            <Typography level="body-sm">Student</Typography>
          </Card>
          <Card size="sm">
            <Stars />
            <Typography
              level="body-lg"
              sx={{ fontStyle: 'italic', fontWeight: 'md' }}
            >
              Incredible tool for professionals! I can quickly get the gist of
              industry-related videos without spending hours watching them. The
              integration of ChatGPT and Chaindesk makes the summaries spot on.
            </Typography>
            <Typography level="body-md">James K.</Typography>
            <Typography level="body-sm">Video Editor</Typography>
          </Card>
          <Card size="sm">
            <Stars />
            <Typography
              level="body-lg"
              sx={{ fontStyle: 'italic', fontWeight: 'md' }}
            >
              As a researcher, this summarizer is invaluable. It extracts key
              points efficiently and helps me stay on top of the latest
              developments in my field. A must-have for anyone in research.
            </Typography>
            <Typography level="body-md">Sophia L.</Typography>
            <Typography level="body-sm">Senior Data Scientist</Typography>
          </Card>
          <Card size="sm">
            <Stars />
            <Typography
              level="body-lg"
              sx={{ fontStyle: 'italic', fontWeight: 'md' }}
            >
              I’m a content creator, and this tool helps me quickly review and
              get ideas from other videos. The AI-generated summaries are
              concise and very helpful. It’s like having an assistant!
            </Typography>
            <Typography level="body-md">Michael T.</Typography>
            <Typography level="body-sm">Content Creator</Typography>
          </Card>
          <Card size="sm">
            <Stars />
            <Typography
              level="body-lg"
              sx={{ fontStyle: 'italic', fontWeight: 'md' }}
            >
              This summarizer is fantastic for keeping up with educational
              content on YouTube. The AI does a great job of capturing the main
              points, making it easier to digest information fast. Love it!
            </Typography>
            <Typography level="body-md">Jessica B.</Typography>
            <Typography level="body-sm">Marketing Manager</Typography>
          </Card>
        </Stack>
      </Stack>
      <Stack gap={1}>
        <Typography level="h2">Frequently Asked Questions</Typography>

        <Stack sx={{ mt: 2, gap: 2 }}>
          <Card size="sm">
            <AccordionGroup size="lg">
              <Accordion>
                <AccordionSummary component="h3">
                  What is the AI YouTube Video Summarizer?
                </AccordionSummary>
                <AccordionDetails>
                  The AI YouTube Video Summarizer is a tool powered by ChatGPT
                  and Chaindesk that generates concise summaries of YouTube
                  videos, allowing users to quickly understand the main points
                  without watching the entire video.
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary component="h3">
                  How do I use the AI YouTube Video Summarizer?
                </AccordionSummary>
                <AccordionDetails>
                  Simply input the URL of the YouTube video you want to
                  summarize into the tool. The AI will process the video and
                  provide a detailed summary within seconds.
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary component="h3">
                  Is the AI YouTube Video Summarizer free to use?
                </AccordionSummary>
                <AccordionDetails>
                  Yes, our summarizer is completely free to use. There are no
                  hidden fees or subscriptions required.
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary component="h3">
                  What types of videos can be summarized?
                </AccordionSummary>
                <AccordionDetails>
                  All YouTube videos with spoken content can be summarized. The
                  video must include captions for the AI to process the audio
                  and generate a summary.
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary component="h3">
                  How accurate are the summaries generated by the AI?
                </AccordionSummary>
                <AccordionDetails>
                  The AI, powered by ChatGPT and Chaindesk, provides highly
                  accurate summaries by extracting key points and important
                  information from the video content.
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary component="h3">
                  Can I use the summaries for academic or professional purposes?
                </AccordionSummary>
                <AccordionDetails>
                  Yes, the summaries are designed to assist students,
                  researchers, and professionals by providing quick and reliable
                  insights from YouTube videos.
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary component="h3">
                  How long does it take to generate a summary?
                </AccordionSummary>
                <AccordionDetails>
                  The summarizer typically processes and generates a summary
                  within a few seconds, depending on the length and complexity
                  of the video.
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary component="h3">
                  Are there any limitations on the length of the videos that can
                  be summarized?
                </AccordionSummary>
                <AccordionDetails>
                  While there is no strict limitation, very long videos may take
                  slightly longer to process. The tool is optimized for standard
                  YouTube video lengths.
                </AccordionDetails>
              </Accordion>
            </AccordionGroup>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default Body;
