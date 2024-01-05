import {
  ArrowsPointingOutIcon,
  ArrowTrendingUpIcon,
  Battery100Icon,
  BoltIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  CircleStackIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  FaceSmileIcon,
  HandRaisedIcon,
  HandThumbUpIcon,
  LanguageIcon,
  LightBulbIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/20/solid';
import React, { useEffect } from 'react';

import Cta from '../landing-page/Cta';
import FAQ from '../landing-page/FAQ';
import { Footer } from '../landing-page/Footer';
import Languages from '../landing-page/Languages';
import PartnerLogos from '../PartnerLogos';

import Feature from './Feature';
import Hero from './Hero';

type Props = {};

function Body({}: Props) {
  return (
    <>
      <Hero />

      <PartnerLogos />

      <Feature
        label="Productivity Boost"
        title={'Drastically cut down on support inquiries'}
        items={[
          {
            name: 'Always available',
            description: `GPT-4 powered AI agents are available 24/7/365 to answer your customers' questions.`,
            icon: Battery100Icon,
          },

          {
            name: 'Delegate routine queries',
            description:
              'Our AI will handles routine queries and common issues, allowing your support team to focus on more complex, high-priority tasks.',
            icon: ArrowTrendingUpIcon,
          },
          {
            name: "Enhance customer's satisfaction",
            description:
              'By resolving minor concerns before they reach your human agents, our AI not only streamlines your support workflow but also enhances customer satisfaction through prompt, accurate responses.',
            icon: FaceSmileIcon,
          },
        ]}
        mediaUrl="/landing-page/demo-resolve.mp4"
        inversed
      />

      <Feature
        label="Tailored to your business"
        title={'Trustworthy AI trained on your data'}
        // description={
        //   "Chaindesk's AI is trained on your data to provide the best answers to your customers."
        // }
        items={[
          {
            name: 'Load data from any source',
            description: `Easily connect your data or upload documents. `,
            icon: CloudArrowUpIcon,
          },
          {
            name: 'Multilingual',
            description:
              'We handle translations of your content in +100 languages automatically.',
            icon: LanguageIcon,
          },
          // {
          //   name: 'No misleading answers',
          //   description:
          //     'Our AI has been trained to avoid hallucinations and misleading answers.',
          //   icon: CheckBadgeIcon,
          // },
          {
            name: 'Sources included',
            description:
              'Every response is backed by sources extracted from the uploaded document.',
            icon: LinkIcon,
          },
        ]}
        mediaUrl="/landing-page/datasources3.png"
      />

      <Languages />

      <Feature
        label="You are in control"
        title={'Smart Human Handoff'}
        // description="Our AI technology adeptly navigates complex issues, funneling them to your human support teams for a personalized touch—amplifying customer satisfaction."
        items={[
          {
            name: 'Focus on complex issues',
            description: `Our AI intuitively redirects the conversation to your human support team.`,
            icon: HandRaisedIcon,
          },
          {
            name: 'Conversation Summary',
            description: `We send a comprehensive summary of the interaction to your support personnel, enabling them to pick up right where the AI left off.`,
            icon: LightBulbIcon,
          },
          {
            name: 'Your support team on steroids',
            description: `Maintain high-quality customer engagement with the perfect blend of AI efficiency and human touch, ensuring that no query goes unanswered and every customer interaction is satisfactory.`,
            icon: BoltIcon,
          },
        ]}
        // description="When a query surpasses the scope of our autonomous agent, it intuitively redirects the conversation to your human support team. This ensures that your customers continue to receive personalized attention without any hitches. Our AI not only identifies the precise moment for handoff but also provides a comprehensive summary of the interaction to your support personnel, enabling them to pick up right where the AI left off. Maintain high-quality customer engagement with the perfect blend of AI efficiency and human touch, ensuring that no query goes unanswered and every customer interaction is satisfactory."
        mediaUrl="/landing-page/demo-handoff.mp4"
        inversed
      />

      <Feature
        label="Tranform visitors into customers"
        title={'Generate Leads'}
        description="Leverage the prowess of our autonomous customer support agent to not just resolve queries but also identify and nurture potential leads."
        mediaUrl="/landing-page/demo-lead.jpg"
      />

      <Feature
        label="Fine-tuning"
        title={'Review and improve your AI'}
        // description="Our AI technology adeptly navigates complex issues, funneling them to your human support teams for a personalized touch—amplifying customer satisfaction."
        // description="Easily review your AI's performance in real-time, identify areas for enhancement, and iteratively train it to meet your support objectives. Our intuitive interface facilitates continuous improvement, making your autonomous agent increasingly adept at delivering exceptional customer experiences."
        items={[
          {
            name: 'Answers Rating',
            description: `Customers can rate the answers provided by the AI, allowing you to identify areas for improvement.`,
            icon: HandThumbUpIcon,
          },
          {
            name: 'Review',
            description: `Easily review your AI's performance and iteratively train it to meet your support objectives`,
            icon: MagnifyingGlassIcon,
          },
          {
            name: 'Zero-inbox Goal',
            description: `You have the option to manually mark a conversation as resolved, or let the AI do it for you. Zero-inbox means no more open tickets!`,
            icon: CheckCircleIcon,
          },
        ]}
        mediaUrl="/landing-page/inbox.jpg"
        inversed
      />

      {/* 
      <Feature
        label="No-coding required"
        title={'Plug & Play in minutes'}
        description="GPT-4 powered AI agents scale on demand to help you handle more requests faster so you can ditch deflection and containment KPIs and, instead, embrace resolution as the ultimate mark of success."
        mediaUrl="/landing-page/vs.png"
        
      /> */}

      <Feature
        label="Deploy Anywhere"
        title={'Omnichannel'}
        // description="GPT-4 powered AI agents scale on demand to help you handle more requests faster so you can ditch deflection and containment KPIs and, instead, embrace resolution as the ultimate mark of success."
        description={
          <div className="mt-6 space-y-4 text-lg leading-8 text-gray-300">
            <p>{'Automatically support your customers wherever they are.'}</p>
            <p>
              {
                'Our autonomous agent seamlessly integrates across multiple communication platforms—be it email, chat, social media, or phone—providing a consistent and efficient support experience.'
              }
            </p>
            <p>
              {
                'Elevate your customer service to a new level of excellence, with streamlined operations and satisfied customers across all channels.'
              }
            </p>
          </div>
        }
        // description="Our autonomous agent seamlessly integrates across multiple communication platforms—be it email, chat, social media, or phone—providing a consistent and efficient support experience. No matter where your customers reach out, our AI-driven agent is there to assist, ensuring every interaction is handled with precision and understanding. Elevate your customer service to a new level of excellence, with streamlined operations and satisfied customers across all channels."
        mediaUrl="/landing-page/deploy.jpg"
      />

      <Feature
        label="Amazing Experience"
        title={'More than a FAQ Chatbot'}
        // description="GPT-4 powered AI agents scale on demand to help you handle more requests faster so you can ditch deflection and containment KPIs and, instead, embrace resolution as the ultimate mark of success."
        // description="Discover a new realm of customer support with our autonomous agent that goes beyond mere FAQ interactions. Unlike standard chatbots that offer canned responses to common queries, our AI-driven agent dives deeper to understand the nuanced needs of your customers. It learns from each interaction, continually refining its responses to provide more precise and personalized assistance over time. With the ability to tackle complex queries and seamlessly escalate to human support when necessary, it's not just an FAQ chatbot—it's your round-the-clock, intelligent customer support companion. Elevate your customer service to a new pinnacle, ensuring your clients receive insightful and accurate support whenever they need it."
        mediaUrl="/landing-page/vs.png"
        items={[
          {
            name: 'AI Revolution',
            description: `Unlike standard chatbots that offer canned responses to common queries, our AI-driven agent dives deeper to understand the nuanced needs of your customers.`,
            icon: SparklesIcon,
          },
          {
            name: 'Beyond canned responses',
            description: `Discover a new realm of customer support with our autonomous agent that goes beyond mere FAQ interactions.`,
            icon: ArrowsPointingOutIcon,
          },
          {
            name: 'Smart Assistant',
            description: `With the ability to tackle complex queries and seamlessly escalate to human support when necessary, it's not just an FAQ chatbot—it's your round-the-clock, intelligent customer support companion.`,
            icon: CpuChipIcon,
          },
        ]}
        inversed
      />

      <Feature
        label="We respect your privacy"
        title={'GDPR Compliant'}
        mediaUrl="/landing-page/eu-flag.png"
        items={[
          {
            name: 'Founded in France',
            description: `All servers and databases are located in Europe.`,
            icon: CircleStackIcon,
          },
          {
            name: 'Secure by design',
            description: 'All data is encrypted at rest and in transit.',
            icon: ShieldCheckIcon,
          },
          {
            name: 'You own your data',
            description:
              'You data is only used to train your AI and is never shared with third parties.',
            icon: FaceSmileIcon,
          },
        ]}
      />

      <FAQ />

      <Cta />
    </>
  );
}

export default Body;
