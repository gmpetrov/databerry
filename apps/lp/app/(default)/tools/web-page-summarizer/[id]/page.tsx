import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import React from 'react';

import slugify from '@chaindesk/lib/slugify';
import { SummaryPageProps, WebPageSummary } from '@chaindesk/lib/types';
import { parseId } from '@chaindesk/lib/web-page-summarizer';
import prisma from '@chaindesk/prisma/client';
import Cta from '@chaindesk/ui/lp/cta';

import Summary from '@/components/web-page-summarizer/summary';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getSummary = cache(async (id: string) => {
  const externalId = parseId(id);
  const llmTaskOutput = await prisma.lLMTaskOutput.findUnique({
    where: {
      unique_external_id: {
        externalId: externalId,
        type: 'web_page_summary',
      },
    },
  });

  return llmTaskOutput as WebPageSummary;
});

// const s = {
//   externalId:
//     'https://buttondown.email/ainews/archive/ainews-the-worlds-first-fully-autonomous-ai/',
//   type: 'web_page_summary',
//   output: {
//     metadata: {
//       title:
//         "[AINews] The world's first fully autonomous AI Engineer • ButtondownTwitterTwitter",
//       description:
//         'AI News for 3/11/2024-3/12/2024. We checked 364 Twitters and 21 Discords (336 channels, and 3499 messages) for you. Estimated reading time saved (at 200wpm):...',
//       ogImage:
//         'https://assets.buttondown.email/images/2f569324-3daa-47f6-ad31-2569b84f41fd.png?w=960&fit=max',
//       host: 'buttondown.email',
//       url: 'https://buttondown.email/ainews/archive/ainews-the-worlds-first-fully-autonomous-ai/',
//     },
//     en: {
//       chapters: [
//         {
//           title: 'Details about Cognition Labs and Devin',
//           summary:
//             "This section provides an overview of AI News highlighting the latest news related to AI engineer Devin from Cognition Labs. The AI News service summarizes discussions from AI discords and Twitters to help users stay informed without the fatigue. Devin stands out for its ability to learn to use unfamiliar technologies, address bugs and feature requests, deploy frontend apps, train AI models, and contribute to codebases. The section also discusses Devin's unique abilities in long-term reasoning and planning, combining large language models with reinforcement learning techniques, and utilizing various tools like asynchronous chat and an Editor with an IDE. While there is excitement and skepticism surrounding Devin's capabilities, the involvement of credible investors and positive feedback from beta testers indicate strong potential for this AI agent.",
//         },
//         {
//           title: 'Advances in Language Models and Architectures',
//           summary:
//             "### Advances in Language Models and Architectures\n\n- Google presents Multistep Consistency Models, a unification between Consistency Models and TRACT that can interpolate between a consistency model and a diffusion model. [210,858 impressions]\n- Algorithmic progress in language models: Using a dataset spanning 2012-2023, researchers find that the compute required to reach a set performance threshold has halved approximately every 8 months, substantially faster than hardware gains per Moore's Law. [14,275 impressions]\n- Covariant introduces RFM-1, a multimodal any-to-any sequence model capable of generating video for robotic interaction with the world. RFM-1 tokenizes 5 modalities: video, keyframes, text, sensory readings, robot actions. [48,605 impressions]",
//         },
//         {
//           title: 'Interconnects (Nathan Lambert)',
//           summary:
//             'Elon Musk hints at open sourcing Grok in a tweet, sparking community interest and discussions on the definition of open source. Cohere introduces Command-R, a generative model with a focus on enabling AI applications and academic access. Users discuss dropping costs of pretraining models like GPT-2, now sub-$1,000, citing Mosaic Cloud figures and a Databricks blog post. Meta plans a massive AI infrastructure expansion with 350,000 NVIDIA H100 GPUs by 2024.',
//         },
//         {
//           title: 'CUDA MODE Discord Summary',
//           summary:
//             "### Nvidia's Moat vs. Vulkan's Potential\nNvidia's dominance in the GPU landscape continues to be a point of fascination, with discussions highlighting Nvidia's compelling competitive advantage and software edge as nearly insurmountable, despite Vulkan's potential Pytorch backend posing a theoretical challenge. Users also expressed the complexities of working with Vulkan due to setup and packaging reminiscent of CUDA issues. Meta's significant investment in AI infrastructure with a 24k GPU cluster and a roadmap for 350,000 NVIDIA H100 GPUs reinforces Nvidia's dominance in the field.\n\n### Triton Community Gathers\nThe Triton programming language community is preparing for an upcoming meetup on 3/28 at 10 AM PT. Interaction with the community and information about the meeting can be accessed through the Triton Lang Slack channel and its GitHub discussions page.\n\n### CUDA Development Insights and Tips\nDiscussions related to CUDA included the benefits of thread coarsening for enhanced performance, the optimization of Visual Studio Code for CUDA development, and suggestions for learning specific CUDA data types and threads. A detailed c_cpp_properties.json configuration setup for VS Code was shared, highlighting necessary includes for CUDA toolkit and PyTorch.\n\n### PyTorch Ecosystem Active Discussions\nWithin the PyTorch community, questions were raised regarding the performance differences between libtorch and load_inline, clarification on the role of Modular in optimizing kernel compatibility with GPU architectures, and an open call for feedback on torchao RFC #47 to simplify the integration of new quantization algorithms and data types.\n\n### NVIDIA Innovations and Training Resources\nThe CUDA community touched upon NVIDIA's leading-edge techniques like Stream-K and Graphene IR, which promise significant speedups and optimizations in matrix multiplication on GPUs, and shared a link to the CUTLASS repository (NVIDIA Stream-K Example). For CUDA learners, a comprehensive CUDA Training Series on YouTube, along with its associated GitHub materials, was recommended (CUDA Training Series GitHub).\n\n### PMPP and Other Learning Resources\nThe \"Programming Massively Parallel Processors\" (PMPP) book was noted for not extensively covering profiling tools, with ancillary content available through associated YouTube videos. Additional CUDA coursework concerns were addressed, including questions about spacing in CUDA C++ syntax and exercise solutions for the PMPP 2023 edition.\n\n### Ring Attention Troubleshooting and Coordination\nA user offered GPU availability for stress testing ring attention code and coordinated meeting times aligned with US daylight saving changes, while seeking advice after encountering high training loss. WANDB was used as an evaluation tool for training sessions.\n\n### Off-topic Rumors and AI Developments\nSpeculative discussions about Inflection AI and Claude-3 led to clarification via a debunking tweet. A cryptic image sparked curiosity, and attention was drawn to a new AI software engineer named Devin, developed by Cognition Labs, which promises new benchmarks in software engineering, with a real-world test publicized by @itsandrewgao (Andrew Kean Gao's Tweet).",
//         },
//         {
//           title: 'Unsloth AI Community Updates',
//           summary:
//             '### Unsloth AI (Daniel Han) ▷ #welcome (12 messages🔥):\n- **Warm Welcomes & Important Reads**: @theyruinedelise greeted the group warmly and reminded to read channel <#1179040220717522974> and assign roles in <#1179050286980006030>.\n- **Game Talk in the Welcome Channel**: @emma039598 asked about gaming, with positive responses mentioning League of Legends, Elden Ring, and Soma.\n- **Greeting Newcomers**: @starsupernova welcomed newcomers.\n- **Casual Gaming Chat**: @emma039598 expressed a preference for RPGs.\n- **Expressions of Welcome and Joy**: @theyruinedelise shared a simple "win" and @chelmooz greeted everyone with a friendly "coucou".\n\n### Unsloth AI (Daniel Han) ▷ #random (9 messages🔥):\n- **Introducing ELLA for Improved Text-to-Image Diffusion Models**: @tohrnii shared an arxiv paper focusing on the Efficient Large Language Model Adapter (ELLA) for enhanced text-to-image diffusion models\' comprehension.\n- **Windows vs Linux for AI Development**: Discussions on development environments and dependency issues in AI development between users like @maxtensor and @starsupernova.\n- **The Grind of AI Model Training**: @thetsar1209 expressed distress over lengthy model training processes.\n- **Dependency Hell Strikes**: @maxtensor shared a frustrating dependency conflict experience.\n\n### Unsloth AI (Daniel Han) ▷ #help (272 messages🔥🔥):\n- **Gemma Model Conversion Saga**: @dahara1 shared insights on converting the Gemma model and discovered a potential bug with Unsloth\'s handling.\n- **Quantization Quirks Uncovered**: Users discussed difficulties with quantizing models and recommended alternatives.\n- **Learning from LLMs**: Philosophical conversation on learning rates and intelligence arising from deterministic machines.\n- **Unsloth on Windows Woes**: Challenges faced in installing xformers on Windows.\n- **Model Loading Mysteries**: Seeking assistance with model loading issues without fine-tuning.\n\n### Unsloth AI (Daniel Han) ▷ #showcase (10 messages🔥):\n- **Unsloth Doubles Fine-Tuning Speed**: Achieving speedups and memory usage reductions for LLM fine-tuning.\n- **Experiment26 Goes Public**: Introduction of an experimental model for refining LLM research.\n- **Community Support for Experiment26**: Community endorsement for fine-tuning advancements.\n- **Suggestion to Display Fine-Tuned Models**: Inviting users to showcase their fine-tuned models.\n- **Gemma Model Performance Showcase**: Demonstrating fast inference with fine-tuned Gemma models.\n\n### Unsloth AI Community Links:\n- [ELLA: Equip Diffusion Models with LLM for Enhanced Semantic Alignment](https://arxiv.org/abs/2403.05135?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [no title found](https://download.pytorch.org/whl/cu121?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [Gemma models do not work when converted to gguf format after training](https://github.com/unslothai/unsloth/issues/213?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [KeyError: lm_head.weight in GemmaForCausalLM.load_weights when loading finetuned Gemma 2B](https://github.com/vllm-project/vllm/issues/3323?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [VLLM Multi-Lora with embed_tokens and lm_head in adapter weights](https://github.com/vllm-project/vllm/issues/2816?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [GitHub - unslothai/unsloth: 5X faster 60% less memory QLoRA finetuning](http://github.com/unslothai/unsloth?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [Tutorial: How to convert HuggingFace model to GGUF format](https://github.com/ggerganov/llama.cpp/discussions/2948?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [py : add Gemma conversion from HF models by ggerganov · Pull Request #5647 · ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp/pull/5647?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai)\n- [unsloth/unsloth/save.py at main · unslothai/unsloth](https://github.com/unslothai/unsloth/blob/main/unsloth/save.py?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai#L706)',
//         },
//         {
//           title: 'Interest in Personal Assistant Project and API Features',
//           summary:
//             "Both @roey.zalta and @brknclock1215 expressed interest in @shine0252's personal assistant project, with @roey.zalta asking for more details. While prompting and parameter adjustments can aid in conciseness, remembering conversations would require external data storage. User @5008802 asked if the pplx API can reply with sources from the web, and @paul16307 inquired about adding Yarn-Mistral-7b-128k model for handling high-context conversations.",
//         },
//         {
//           title: 'AI Forum Discussions',
//           summary:
//             'This section provides insights into various discussions related to AI models and hardware in LM Studio, covering topics such as language model storytelling, model choices for coding in C++, ternary computing, stock price prediction AI, and more. Users inquire about updates, seek recommendations, discuss innovative computing approaches, and share experiences with different models. The section also includes links to useful resources like rendering mathematical expressions in Markdown and exploring ternary hashing.',
//         },
//         {
//           title: 'Web Docs Citing and ML Script Assistance',
//           summary:
//             '### Inquiry About Citing Web Docs in Research:\n- User @noir_bd asked if it is suitable to cite website documentation or articles in research or survey papers. The community did not provide a definitive answer but directed them to other platforms for further discussion.\n\n### Seeking Guidance with ML Script:\n- User @210924_aniketlrs02 requested help on using a Python script from a GitHub repository to extract quantized states from the Wav2Vec2 model. The specific script link was shared, but no assistance was given in response.\n\n### Link Shared Without Context:\n- User @ibrahim_72765_43784 shared a Kaggle discussion link without providing any context for its relevance.\n\n### Presentation Proposal for Diffusion Models:\n- User @chad_in_the_house proposed presenting on text-to-image customization techniques, with a focus on methods from a HuggingFace paper. Confirmation of the presentation date was pending.',
//         },
//         {
//           title:
//             'Excitement for Upcoming Presentation and Assistance Requests in HuggingFace Discussions',
//           summary:
//             "### for context.</li> \n\n- **Support and Excitement for Upcoming Presentation**: <code>@lunarflu</code> expressed enthusiasm and support for <code>@chad_in_the_house</code>'s potential presentation about customizing diffusion models using techniques from the HuggingFace paper. \n\n**Links mentioned**: \n\n- [Deleted Topic] | Kaggle: [Deleted Topic].\n- Paper page - RealCustom: Narrowing Real Text Word for Real-Time Open-Domain Text-to-Image Customization: no description found. \n- wav2vec2-codebook-indices/scripts/helpers/w2v2_codebook.py at master · fauxneticien/wav2vec2-codebook-indices: Contribute to fauxneticien/wav2vec2-codebook-indices development by creating an account on GitHub.\n\n<hr/> \n\n- **Assistance Request for wav2vec2 codebook script**: <code>@210924_aniketlrs02</code> seeks guidance on using a wav2vec2 codebook extraction script to extract quantized states of the Wav2Vec2 model. They are new to machine learning and need help applying the script. \n- **Inquiry About Unet with Structured Data**: <code>@nana_94125</code> asks if anyone has tried using Unet, a neural network architecture for image segmentation, with structured data. No further details provided.\n\n**Links mentioned**: \n \n- wav2vec2-codebook-indices/scripts/helpers/w2v2_codebook.py at master · fauxneticien/wav2vec2-codebook-indices: Contribute to fauxneticien/wav2vec2-codebook-indices development by creating an account on GitHub.",
//         },
//         {
//           title: 'AI Discussion: LlamaIndex, Claude 3, and Home AI',
//           summary:
//             'This section discusses various announcements and events related to AI, including a MemGPT webinar on long-term memory management, MemGPT presentation on memory management, and webinars on enhancing LLM memory and developing context-augmented apps with Claude 3. Additionally, there are mentions of RAG meetups, developer meetups, and tools like the create-llama command-line tool for home AI. The section also covers topics like multi-modal applications, Matryoshka Representation Learning paper discussions, and LLM research paper databases. Links to various resources and events are included for further exploration.',
//         },
//         {
//           title: 'Cohere Introduces Command-R',
//           summary:
//             '<li>@xeophon. brought attention to Command-R, a new scalable generative model for large-scale production, with weights released for academic use.</li>',
//         },
//         {
//           title: 'Topics Discussed in CUDA Mode Channels',
//           summary:
//             "This section covers different discussions that took place in various CUDA mode channels on topics such as thread coarsening efficiency boost, DIY learning resources for CUDA, and debugging CUDA with Visual Studio Code. Users also shared insights on using Vulkan as a CUDA alternative, Meta's massive AI infrastructure investment, and rumors about new AI integration. There were discussions on training series availability, PMPP book content, and issues related to PyTorch performance. Additionally, users sought help and shared experiences about Langchain AI implementation, integration, and troubleshooting in applications.",
//         },
//         {
//           title: 'LangChain AI Updates',
//           summary:
//             '### LangChain AI \n\n- **Langserve Usage Inquiry**: User @problem9069 sought assistance on using Langserve to capture output from a specific route in a variable, using the ChatOpenAI with gpt-4-turbo-preview model. \n\n- **Chat Playground Now Features Claude V3**: @dwb7737 created a pull request that updates the Chat Playground to utilize Claude version 3. The changes involve updating import statements and specifying the model_name parameter. \n\n- **Access to LangServer**: Users @juand4.dev and @gitmaxd expressed interest in obtaining access to LangServer. @gitmaxd suggested contacting <@703607660599181377> on platform X for access.',
//         },
//         {
//           title: 'Inference Issues with Mixtral 7b 8 Expert Model',
//           summary:
//             "* **Inference Issues with Mixtral 7b 8 Expert Model**: @rohitsaxena4378 faced an issue with the DiscoResearch/mixtral-7b-8expert model generating non-English text. The model is available on [Hugging Face](https://huggingface.co/DiscoResearch/mixtral-7b-8expert?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai).\n* **Use Official Mixtral Implementations**: In response to the inference issue, @bjoernp recommended using the official Mixtral implementation instead of the experimental DiscoResearch version, pointing to [Hugging Face's official model](https://huggingface.co/mistralai/Mixtral-8x7B-v0.1?utm_source=ainews&amp;utm_medium=email&amp;utm_campaign=ainews-the-worlds-first-fully-autonomous-ai).\n* **Experimental Label Suggested for Mixtral Implementation**: @bjoernp acknowledged the need to clearly label the experimental DiscoResearch/mixtral-7b-8expert model to guide users towards the official version for more reliable performance.",
//         },
//         {
//           title: 'Custom JavaScript Function and Social Network Links',
//           summary:
//             'The section includes a custom JavaScript function for creating image pop-up dialogs on a web page. It also showcases social network links for Twitter and a newsletter. Additionally, there is a footer section with more social network links and a recognition statement. The section closes with the inclusion of styles for comments, headings, lists, and code snippets, as well as setting a custom CSS variable for tint color.',
//         },
//       ],
//       faq: [
//         {
//           q: "What are some of Devin's unique abilities as an AI engineer at Cognition Labs?",
//           a: 'Devin has the ability to learn to use unfamiliar technologies, address bugs and feature requests, deploy frontend apps, train AI models, contribute to codebases, engage in long-term reasoning and planning, combine large language models with reinforcement learning techniques, and utilize tools like asynchronous chat and an Editor with an IDE.',
//         },
//         {
//           q: 'What are some recent advances in language models and architectures mentioned in the text?',
//           a: "Recent advances include Google's Multistep Consistency Models, algorithmic progress in language models showing faster performance improvements than hardware gains per Moore's Law, Covariant's RFM-1 multimodal sequence model for robotic interaction, open-sourcing clues from Elon Musk with Grok, Command-R by Cohere for generative modeling, and Meta's AI infrastructure expansion plans.",
//         },
//         {
//           q: "What is discussed about Nvidia's dominance in the GPU landscape in comparison to Vulkan's potential?",
//           a: "Nvidia's dominance is highlighted with compelling competitive advantage and software edge, seen as nearly insurmountable even against Vulkan's potential Pytorch backend challenge. Discussions also mention Meta's significant investment in AI infrastructure with a large cluster of NVIDIA GPUs, reinforcing Nvidia's position.",
//         },
//         {
//           q: 'What key insights are provided regarding the Triton programming language community meetups?',
//           a: 'The Triton community is preparing for an upcoming meetup, accessible through the Triton Lang Slack channel and GitHub discussions page, to interact and share information about their programming language.',
//         },
//         {
//           q: 'What topics are covered in discussions related to CUDA development?',
//           a: 'Discussions include benefits of thread coarsening for better performance, optimizing Visual Studio Code for CUDA development, learning specific CUDA data types and threads, and sharing detailed configuration setups for working with CUDA toolkit and PyTorch in VS Code.',
//         },
//       ],
//     },
//   },
// };

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const summary = await getSummary(id);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const title = summary?.output?.metadata?.title;
  return {
    title: `${summary?.output?.metadata?.title} - AI News | Chaindesk`,
    description:
      summary?.output?.metadata?.description ||
      `Get the latest AI news before anyone else`,
    alternates: {
      canonical: `/ai-news/${id}`,
    },
    openGraph: {
      images: [
        ...(summary?.output?.metadata?.ogImage
          ? [summary?.output?.metadata?.ogImage]
          : []),
        ...previousImages,
      ],
    },
    keywords: `AI News, AI chatbot, No-code platform, AI Customer Support, Onboarding, Slack AI chatbot, Automation, Chaindesk, ChatGPT Plugin, Chat PDF, Chat with any document, Custom ChatGPT Bot, Chatbot GPT, Chatbot, ChatGPT Chatbot, WhatsApp ChatGPT Chatbot`,
  };
}

export default async function YoutubeVideoSummary({
  params,
}: {
  params: { id: string };
}) {
  const id = parseId(params.id);
  const summary = await getSummary(id);

  if (!summary) {
    redirect('/ai-news');
  } else if (!!summary && params.id.length === 16) {
    redirect(`/ai-news/${slugify(summary.output.metadata.title)}-${id}`);
  }

  return (
    <>
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <Summary id={params.id} summary={summary} />
          <Cta />
        </div>
      </section>
    </>
  );
}
