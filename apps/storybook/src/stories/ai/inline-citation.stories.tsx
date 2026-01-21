import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
  InlineCitationText,
} from "@repo/ui/ai/inline-citation";

import type { Meta, StoryObj } from "@storybook/react-vite";

const sources = [
  {
    title: "React Aria Components",
    url: "https://react-spectrum.adobe.com/react-aria/",
    description: "Accessible primitives for building UI components.",
    quote:
      "React Aria provides behavior, accessibility, and interactions for UI components.",
  },
  {
    title: "Tailwind CSS",
    url: "https://tailwindcss.com/docs",
    description: "Utility-first CSS framework for rapid UI development.",
    quote: "Build modern websites without leaving your HTML.",
  },
];

const meta = {
  title: "AI Elements/InlineCitation",
  component: InlineCitation,
  tags: ["autodocs"],
} satisfies Meta<typeof InlineCitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-2xl text-sm">
      <InlineCitation>
        <InlineCitationText>
          The solution combines accessible primitives with a utility-first
          styling system.
        </InlineCitationText>
        <InlineCitationCard>
          <InlineCitationCardTrigger
            sources={sources.map((source) => source.url)}
          />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselIndex />
                <InlineCitationCarouselNext />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                {sources.map((source) => (
                  <InlineCitationCarouselItem key={source.url}>
                    <InlineCitationSource
                      description={source.description}
                      title={source.title}
                      url={source.url}
                    />
                    <InlineCitationQuote>{source.quote}</InlineCitationQuote>
                  </InlineCitationCarouselItem>
                ))}
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </div>
  ),
};
