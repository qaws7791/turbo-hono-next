import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion
      className="w-full max-w-xl"
      defaultValue={["item-1"]}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Information</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            Our flagship product combines cutting-edge technology with sleek
            design. Built with premium materials, it offers reliable
            performance.
          </p>
          <p>
            Key features include advanced processing and an intuitive user
            interface designed for beginners and experts.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Details</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real time through the portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a 30-day return policy. If you are
            not satisfied, return the item in original condition.
          </p>
          <p>
            Our return process includes free return shipping and refunds
            processed within 48 hours of receipt.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
